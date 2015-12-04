var express = require('express');
var router = express.Router();
var debug = require('debug')('api');
var Promise = require('es6-promise').Promise;

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var crypto = require('crypto-js');
var _ = require('myx-lib/underscore');

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

function connectToDB () {

	var promise = new Promise(function (resolve, reject) {

		MongoClient.connect('mongodb://localhost:27017/rooms', function (err, dbhandle) {

			if (err) {
				return reject(err);
			}

			return resolve(dbhandle);
		});
	});

	return promise;
}

function calculateWinnings (roomState) {

	var participantResult = [],
		gameState = roomState.gameState,
		tableCards = gameState.flop.concat(gameState.turn).concat(gameState.river),
		allSeven = null,
		results = [];

	_.each(roomState.participants, function (participant, index) {

		if (!participant.hasFolded) {

			allSeven = tableCards.concat(participant.cards);
			allSeven = _.sortBy(allSeven, function (card) {return cardValue[card.split(':')[0]]});

			var combinationMap = {
				cards: {
					highCard: allSeven[6],
					pair: 0,
					twoPair: 0,
					threeok: 0,
					straight: 0,
					flush: 0,
					fullhouse: 0,
					fourok: 0,
					straightFlush: 0,
					royalFlush: 0,
				},
				context: {
					maxMatch: 1,
					maxSequence: 1,
					maxSuit: 1,
					match: 1,
					sequence: 1,
					suit: {1: [], 2: [], 3: [], 4: []},
					matches: [],
					sequences: [],
					singles: [],
					isMatching: false,
					isSequence: false
				}
			};

			var ct = combinationMap.context;
			var combo = combinationMap.cards;

			_.each(allSeven, function (card, index) {

				var temp = card.split(':');
				var cardValue = temp[0];
				var cardSuit = temp[1];

				ct.suit[cardSuit].push(card);

				if (!index) {
					return;
				}

				var prevCard = allSeven[index - 1];
				temp = prevCard.split(':');
				var prevValue = temp[0];
				var prevSuit = temp[1];

				if (cardValue === prevValue) {
					if (ct.isMatching) {
						ct.match += 1;
						ct.matches[ct.matches.length - 1].push(card);
					} else {
						ct.isMatching = true;
						ct.match = 2;
						ct.matches.push([card, prevCard]);
					}

					if (ct.match === 2) {
						if (combo.pair) {
							combo.twoPair = 1;
						} else {
							combo.pair = 1;
						}
					} else if (ct.match === 3) {
						combo.threeok = 1;
						if (combo.pair) {
							combo.fullhouse = 1;
						}
					} else if (ct.match === 4) {
						combo.fourok = 1;
					} else {
						console.log('Abe! The number of matching cards is more than 4??');
					}
					// is maxMatch necessary?
					ct.maxMatch = Math.max(ct.match, ct.maxMatch);
				} else {

					if (ct.isMatching) {
						ct.isMatching = false;
					}

					if (cardValue - prevValue === 1) {

						if (ct.isSequence) {
							ct.sequence += 1;
							ct.sequences[ct.sequences.length - 1].push(card);
						} else {
							ct.sequence = 2;
							ct.isSequence = true;
							ct.sequences.push([card, prevCard]);
						}

						ct.maxSequence = Math.max(ct.sequence, ct.maxSequence);

						if (ct.sequence >= 5) {
							combo.straight = 1;
						}

					} else {
						if (ct.isSequence) {
							ct.isSequence = false;
						}
					}
				}

				if (ct.suit[cardSuit].length >= 5) {
					combo.flush = 1;
				}
			});

			console.log('Result Obj');
			console.log(JSON.stringify(combinationMap, null, 4));

			// Check for a,2,3,4,5 straight possibility
			// if () {

			// }
		}
	});

	if (!results.length) {
		console.log('ERROR: Abe?! Yeh kya hua?? Koi winner toh hona chahiye!');
		return false;
	}

	return results;
}

router.post('/create', function (req, res, next) {
	var postBody = req.body;
	debug(postBody);

	postBody.participants = [];
	postBody._id = new ObjectId();

	postBody.gameState = {
		stage: 0,
		blinds: 10,
		dealer: 0,
		currentPlayer: 0,
		burnCards: [],
		flop: [],
		turn: [],
		river: [],
		cards: [],
		pots:[]
	}

	connectToDB()
		.then(function (dbhandle) {

			dbhandle.collection('rooms').insertOne(postBody, function (err, result) {
				if (err) {
					res.status(500).send(err);
					return;
				}

				dbhandle.close();
				res.send({status: 'success', data: postBody._id});
			});
		})
		.catch(function (err) {
			console.log(err);
			res.status(500).send(err);
		});
});

router.post('/join', function (req, res, next) {

	var postBody = req.body;
	debug(postBody);

	var objectId = ObjectId(postBody.roomId),
		resultObj = {};

	connectToDB()
		.then(function (dbhandle) {
			dbhandle.collection('rooms').updateOne({_id: objectId}, {
				$addToSet: {participants: {name: postBody.name, worth: postBody.buyIn}}
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

router.post('/leave', function (req, res, next) {

	var postBody = req.body;
	debug(postBody);

	var objectId = ObjectId(postBody.roomId),
		resultObj = {};

	connectToDB()
		.then(function (dbhandle) {
			dbhandle.collection('rooms').updateOne({_id: objectId}, {$pull: {participants: postBody.name}}, function (err, update) {

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
