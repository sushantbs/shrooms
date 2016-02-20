var express = require('express');
var router = express.Router();
var debug = require('debug')('api');
var Promise = require('es6-promise').Promise;

var RoomManager = require('../shrooms');
var Participant = require('../shrooms/src/participant');

var ObjectId = require('mongodb').ObjectID;

var _ = require('lodash');
var calulateWinnings = require('../lib/winnings-calculator').calculateWinnings;

var SHROOMCOLLECTION = {};
var SOCKETS = {};

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


module.exports = function (io) {

	var roomMgr = new RoomManager(io);

	router.post('/create', function (req, res, next) {

		var postBody = req.body,
			rule = postBody.rule;

		roomMgr
			.createRoom(postBody)
			.then(function (roomObj) {

				if (!roomObj) {
					console.log('ERROR: room creation failed');
					return res.status(500).send('room creation failed');
				}

				req.roomsession.roomId = roomObj.getId();
				req.roomsession.participantId = roomObj.creator.getId();
				req.roomsession.isCreator = true;

				console.log('/create: client session obj post room creation: ' + JSON.stringify(req.roomsession, null, 4));
				res.status(200).send({status: 'success', data: roomObj.getId()});
			})
			.catch(function (err) {
				console.log(err);
				res.status(500).send({status: 'error', error: 'Unable to create the room'});
			});
	});


	router.get('/info', function (req, res, next) {

		var roomId = req.query.roomId;
		console.log('fetch room info for ' + roomId);

		roomMgr
			.fetchRoom(roomId)
			.then(function (roomObj) {
				console.log('/info: sending room info');
				res.status(200).send({status: 'success', data: roomObj.getInfo()});
			})
			.catch(function (err) {
				console.log('ERROR: /info: fetching room info failed');
				res.status(500).send({status: 'error', error: (err || 'Error connecting to DB')});
			});
	});

	router.get('/state', function (req, res, next) {

		var roomId = req.roomsession.roomId,
			participantId = req.roomsession.participantId;

		console.log('/state: client session from cookie: ' + JSON.stringify(req.roomsession, null, 4));

		roomMgr
			.fetchRoom(roomId)
			.then(function (roomObj) {
				if (roomObj.hasParticipant(participantId)) {
					return res.status(200).send({status: 'success', data: roomObj.getState()});
				} else {
					console.log('ERROR: /state: participant is not part of the room');
					return res.status(500).send({status: 'error', error: 'You are not part of this room. Try joining this room'});
				}
			})
			.catch(function (err) {
				console.log('ERROR: /state: fetching room failed');
				res.status(500).send({status: 'error', error: (err || 'Error connecting to DB')});
			});

	});

	router.post('/join', function (req, res, next) {

		var postBody = req.body,
			joinRoomId = postBody.roomId,
			existingRoomId = req.roomsession.roomId,
			existingName = req.roomsession.participantName;

		if (existingRoomId) {
			if ((existingRoomId === joinRoomId) && (existingName === postBody.name)) {
				res.redirect('/room/' + joinRoomId);
			} else {
				console.log('ERROR: you are part of another room - ' + existingRoomId + ' as ' + existingName);
				res.status(500).send({status: 'error', error: 'You are part of another room or are part of this room as another participant.', data: {roomId: existingRoomId}});
			}
		} else {

			roomMgr
				.fetchRoom(joinRoomId)
				.then(function (roomObj) {

					if (roomObj.isClosed) {
						console.log('ERROR: /join this room is closed');
						return res.status(500).send({status: 'error', error: 'The rooms is not accepting any more participants.'});
					} else if (roomObj) {

						console.log('adding participant to the room');
						var participant = new Participant({name: postBody.name});

						roomObj
							.joinRoom(participant)
							.write()
							.then(function (result) {

								req.roomsession.roomId = joinRoomId;
								req.roomsession.participantId = participant._id;

								console.log('joined room: ' + JSON.stringify(req.roomsession, null, 4))
								res.status(200).send({status: 'success', data: result._id});

								roomEntry.socketListener.emitState();
							})
							.catch(function (err) {
								res.status(500).send({status: 'error', error: 'Error in joining room. Please try again.'});
							});
					}
				})
				.catch(function (err) {
					console.log('ERROR: fetching room');
					res.status(500).send({status: 'error', error: (err || 'Error connecting to DB')});
				});
		}
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

	return router;
};
