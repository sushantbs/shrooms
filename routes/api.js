var express = require('express');
var router = express.Router();
var debug = require('debug')('api');
var Promise = require('es6-promise').Promise;

var Room = require('../shrooms');

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var _ = require('lodash');
var calulateWinnings = require('../lib/winnings-calculator').calculateWinnings;

var SHROOMCOLLECTION = {};

var cardValue = {
	'2': 2,
	'3': 3,
	'4': 4,
	'5': 5,
	'6': 6,
	'7': 7,
	'8': 8,
	'9': 9,
	'10': 10,
	'J': 11,
	'Q': 12,
	'K': 13,
	'A': 14
};


router.post('/create', function (req, res, next) {

	var postBody = req.body;
	debug(postBody);

	var rule = postBody.rule,
		context = postBody.context,
		name = postBody.name,
		creator = postBody.creator;

	var roomObj = new Room({creatorName: creator});

	switch (rule) {

		case 1:
			roomObj
				.setRules()
				.setContext(context)
				.write()
				.then(function (result) {

					var id = result.id;

					req.roomsession.roomId = id;
					req.roomsession.participantName = creator;

					SHROOMCOLLECTION[id] = roomObj;

					res.status(200).send({status: 'success', data: result.id});
				})
				.catch(function (err) {
					console.error(err);
					res.status(500).send({status: 'error', error: 'Error while creating the room'});
				});

			break;

		default:
			console.error('Rules set invalid');
			return res.status(500).send({status: 'error', error: 'Rules set invalid'});
	}
});

router.get('/state', function (req, res, next) {

	console.log(req.roomsession);

	var roomId = req.roomsession.roomId,
		participant = req.roomsession.participantName,
		roomObj = SHROOMCOLLECTION[roomId];

	if (roomObj && roomObj.hasParticipant(participant)) {
		return res.status(200).send({status: 'success', data: roomObj.getState()});
	} else {
		return res.status(500).send({status: 'error', error: 'Error getting room state'});
	}

});

router.post('/join', function (req, res, next) {

	var postBody = req.body,
		joinRoomId = postBody.roomId
		existingRoomId = req.roomsession.roomId,
		existingName = req.roomsession.participantName,
		roomObj = ROOMS[joinRoomId];

	if (existingRoomId) {
		if ((existingRoomId === joinRoomId) && (existingName === postBody.name)) {
			res.redirect('/room/' + joinRoomId);
		} else {
			res.status(500).send({status: 'error', error: 'You are part of another room or are part of this room as another participant.'});
		}
	} else if (roomObj.isClosed) {
		return res.status(500).send({status: 'error', error: 'The rooms is not accepting any more participants.'});
	} else {
		roomObj
			.joinRoom({name: postBody.name, context: postBody.context})
			.write()
			.then(function (result) {

				req.roomsession.roomId = joinRoomId;
				req.roomsession.participantName = postBody.name;

				res.status(200).send({status: 'success', data: result});
			})
			.catch(function (err) {
				res.status(500).send({status: 'error', error: 'Error in joining room. Please try again.'});
			});
	}
});

router.post('/leave', function (req, res, next) {

	var participantName = req.roomsession.participantName,
		roomId = req.roomsession.roomId;

	roomObj = ROOMS[roomId];

	roomObj
		.leaveRoom({name: participantName})
		.write()
		.then(function (result) {
			res.status(200).send({status: 'success', data: result});
		})
		.catch(function (err) {
			res.status(500).send({status: 'error', error: 'Error in leaving the room. Please try again.'});
		});
});

router.post('/remove', function (req, res, next) {

});

router.post('/startgame', function (req, res, next) {

	var postBody = req.body;
	var objectId = ObjectId(postBody.roomId),
		resultObj = {};

	connectToDB()
		.then(function (dbhandle) {
			dbhandle.collection('rooms').updateOne({_id: objectId}, {
				$set: {"inProgress": true}
			}, function (err, update) {

				if (err) {
					console.log(err);
					res.status(500).end('Error updating the Room');
					return;
				}

				if (!update.result.n) {
					console.log('No result');
					res.status(500).end('Room not found');
					return;
				}

				dbhandle.collection('rooms').findOne({_id: objectId}, function (err, fetch) {

					if (err) {
						console.log(err);
						res.status(500).send(err);
						return;
					}

					dbhandle.close();
					res.send({status: 'success', data: fetch});
				});
			});
		})
		.catch(function (err) {
			console.log(err);
			res.status(500).send(err);
		});
});

var shuffleDeck = function () {

	var deck = [
		'A:1', '2:1', '3:1', '4:1', '5:1', '6:1', '7:1', '8:1', '9:1', '10:1', 'J:1', 'Q:1', 'K:1',
		'A:2', '2:2', '3:2', '4:2', '5:2', '6:2', '7:2', '8:2', '9:2', '10:2', 'J:2', 'Q:2', 'K:2',
		'A:3', '2:3', '3:3', '4:3', '5:3', '6:3', '7:3', '8:3', '9:3', '10:3', 'J:3', 'Q:3', 'K:3',
		'A:4', '2:4', '3:4', '4:4', '5:4', '6:4', '7:4', '8:4', '9:4', '10:4', 'J:4', 'Q:4', 'K:4'
	],
	temp;

	for (var m = 0; m < 500; m += 1) {

		i = Math.floor(parseInt((Math.random() * 200), 10) % 52);
		j = Math.floor(parseInt((Math.random() * 200), 10) % 52);

		temp = deck[i];
		deck[i] = deck[j];
		deck[j] = temp;
	}

	console.log(deck);

	return deck;
}

router.post('/deal', function (req, res, next) {

	var cards = shuffleDeck();

	var postBody = req.body;
	var objectId = ObjectId(postBody.roomId),
		resultObj = {};

	connectToDB()
		.then(function (dbhandle) {
			dbhandle.collection('rooms').findOne({_id: objectId}, function (err, fetch) {

				if (err) {
					console.log(err);
					res.status(500).send(err);
					return;
				}


				_.forEach(fetch.participants, function (participant) {
					participant.cards = cards.splice(0, 2);
				});

				var participants = fetch.participants,
					gameState = fetch.gameState,
					playerCount = participants.length,
					blinds = fetch.gameState.blinds,
					dealer = fetch.gameState.dealer;

				gameState.dealer = (gameState.dealer + 1) % playerCount;
				gameState.burnCards = [];
				gameState.flop = [];
				gameState.turn = [];
				gameState.river = [];
				gameState.pot = [];

				var pot = {
					toCall: 0,
					value: 0,
					players: {}
				};

				var small = ((dealer + 1) % playerCount);
				participants[small].worth -= blinds;

				pot.value = blinds;

				pot.players[small] = {
					contrib: blinds,
					isActive: true
				}

				var big = ((dealer + 2) % playerCount);
				participants[big].worth -= (2 * blinds);

				pot.value += (2 * blinds);
				pot.toCall = (2 * blinds);

				pot.players[big] = {
					contrib: (2 * blinds),
					isActive: true
				}

				pot.toCall = (2 * blinds);

				gameState.currentPlayer = ((dealer + 3) % playerCount);
				gameState.cards = cards;
				gameState.stage = 1;
				gameState.pots = [pot];
				gameState.raisedBy = (dealer + 2) % playerCount;


				dbhandle.collection('rooms').updateOne({_id: objectId}, {
					$set: {
						"participants": participants,
						"gameState": gameState
					}
				}, function (err, update) {

					if (err) {
						console.log(err);
						res.status(500).end('Error updating the Room');
						return;
					}

					if (!update.result.n) {
						console.log('No result');
						res.status(500).end('Room not found');
						return;
					}

					dbhandle.close();
					res.send({status: 'success', data: fetch});
				});
			});
		})
		.catch(function (err) {
			console.log(err);
			res.status(500).send(err);
		});
});

router.post('/playturn', function (req, res, next) {

	var postBody = req.body;
	var objectId = ObjectId(postBody.roomId),
		resultObj = {};

	connectToDB()
		.then(function (dbhandle) {
			dbhandle.collection('rooms').findOne({_id: objectId}, function (err, fetch) {

				if (err) {
					console.log(err);
					res.status(500).send(err);
					return;
				}

				var playerIndex = postBody.index,
					participants = fetch.participants,
					gameState = fetch.gameState,
					playerCount = participants.length,
					player = participants[playerIndex],
					currentPlayer = gameState.currentPlayer,
					stage = gameState.stage,
					pot = gameState.pots[gameState.pots.length - 1];

				if (currentPlayer !== playerIndex) {
					console.log('ERROR: The player who played is not the current player!');
				}

				if (postBody.type === 'fold') {
					player.hasFolded = true;

					if (pot.players[playerIndex]) {
						pot.players[playerIndex].isActive = false;
					}

					var nextPlayer = (currentPlayer + 1) % playerCount;

					while (participants[nextPlayer].hasFolded) {
						nextPlayer = (nextPlayer + 1) % playerCount;
						if (nextPlayer === currentPlayer) {

							var results = calculateWinnings(roomState);

							if (!results) {
								res.send({status: 'error', 'message': 'Error while calculating winnings'});
							}

							gameState.stage = -1;

							_.each(participants, function (participant) {
								participant.hasFolded = false;
								participant.cards = [];
							});

							_.each(results, function (resultObj) {
								participants[resultObj.playerIndex].worth += resultObj.winnings;
							});
						}
					}
				}

				if (postBody.type === 'call') {

					if (!pot.players[playerIndex]) {
						pot.players[playerIndex] = {
							contrib: 0,
							isActive: true
						}
					}

					var contrib = pot.players[playerIndex].contrib;
					var toCall = pot.toCall;

					var bet = (toCall - contrib);
					player.worth -= bet;
					pot.value += bet;

					pot.players[playerIndex].contrib = toCall;

					var nextPlayer = (currentPlayer + 1) % playerCount;

					while (participants[nextPlayer].hasFolded) {
						nextPlayer = (nextPlayer + 1) % playerCount;
						if (nextPlayer === currentPlayer) {
							console.log('ERROR: If he is the last person playing he should not have called!');
						}
					}

					if (nextPlayer === gameState.raisedBy) {

						gameState.burnCards = gameState.burnCards.concat(gameState.cards.splice(0, 1));

						if (stage === 1) {
							gameState.flop = gameState.cards.splice(0, 3);
						} else if (stage === 2) {
							gameState.turn = gameState.cards.splice(0, 1);
						} else if (stage === 3) {
							gameState.river = gameState.cards.splice(0, 1);
						} else {

							// Game has ended...
							var results = calculateWinnings(fetch);
							gameState.stage = -1;

							_.each(participants, function (participant) {
								participant.hasFolded = false;
								participant.cards = [];
							});

							_.each(results, function (resultObj) {
								participants[resultObj.playerIndex].worth += resultObj.winnings;
							});
						}

						gameState.stage += 1;
					}
				}

				if (postBody.type === 'raise') {

					var raise = postBody.raise;

					if (!pot.players[playerIndex]) {
						pot.players[playerIndex] = {
							contrib: 0,
							isActive: true
						}
					}

					var contrib = pot.players[playerIndex].contrib;
					var toCall = pot.toCall;

					var bet = (toCall - contrib) + raise;
					player.worth -= bet;
					pot.value += bet;

					pot.players[playerIndex].contrib = toCall + raise;
					pot.toCall += raise;

					gameState.raisedBy = playerIndex;

					var nextPlayer = (currentPlayer + 1) % playerCount;

					while (participants[nextPlayer].hasFolded) {
						nextPlayer = (nextPlayer + 1) % playerCount;
						if (nextPlayer === currentPlayer) {
							console.log('ERROR: If he is the last person playing he should not have raised!');
						}
					}
				}

				gameState.currentPlayer = nextPlayer;

				dbhandle.collection('rooms').updateOne({_id: objectId}, {
					$set: {
						"participants": participants,
						"gameState": gameState
					}
				}, function (err, update) {

					if (err) {
						console.log(err);
						res.status(500).end('Error updating the Room');
						return;
					}

					if (!update.result.n) {
						console.log('No result');
						res.status(500).end('Room not found');
						return;
					}

					dbhandle.close();
					res.send({status: 'success', data: fetch});
				});
			});
		})
		.catch(function (err) {
			console.log(err);
			res.status(500).send(err);
		});
});

router.post('/pauseplay', function (req, res, next) {

});

router.get('/roomstate', function (req, res, next) {

	var queryObj = req.query;
	debug(queryObj);

	var objectId = ObjectId(queryObj.roomId),
		resultObj = {};

	connectToDB()
		.then(function (dbhandle) {
			dbhandle.collection('rooms').findOne({_id: objectId}, function (err, fetch) {

				if (err) {
					console.log(err);
					res.status(500).send(err);
					return;
				}

				dbhandle.close();
				res.send({status: 'success', data: fetch});
			});
		})
		.catch(function (err) {
			console.log(err);
			res.status(500).send(err);
		});
});

module.exports = router;
