
module.exports = function (allSeven) {

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
			singleSuit: 0,
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
					if (singleSuit !== cardSuit) {
						singleSuit = 0;
					}
				} else {
					ct.sequence = 2;
					ct.isSequence = true;
					ct.sequences.push([card, prevCard]);
					if (prevSuit === cardSuit) {
						singleSuit = cardSuit;
					}
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

	return combinationMap;

};

