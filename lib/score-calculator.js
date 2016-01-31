
function highCard (cards) {

	var multiplier = Math.pow(13, 5),
		score = 0;

	for (var i = 0, len = cards.length; i < len; i += 1) {
		score += (multiplier * cards[i]);
		multiplier = multiplier / 13;
	}

	return {
		score: score,
		rankValue: 8
	}
}

function pairs (pairArr, handWeight) {

	var multiplier = Math.pow(13, 2),
		score = 0;

	handWeight = handWeight || 2;

	for (var i = 0 , len = pairArr.length; i < len; i += 1) {
		score += (multiplier * pairArr[i][0]);
		multiplier = (multiplier / 13);
	}

	return {
		score: score,
		rankValue: (8 - pairArr.length)
	};
}

function threeOK (threes) {

	var multiplier = 4,
		score = 0;

	for (var i = 0 , len = threes.length; i < len; i += 1) {
		score += (13 * threes[i][0]);
	}

	return {
		score: score,
		rankValue: 5
	}
}

function straight (sequences) {

	return {
		rankValue: 4,
		score: 13 * sequences[0][0]
	};
}

function flush (flushCards) {

	return {
		rankValue: 3,
		score: highCard(flushCards).score
	}
}

function fullhouse (matches) {

	var handWeight = 3,
		score = 0;

	for (var i = 0, len = matches.length; i < len; i += 1) {
		if (matches[i].length === 3) {
			score += Math.pow(13, 2) * (matches[i][0]);
		} else {
			score += 13 * matches[i][0];
		}
	}

	return {
		rankValue: 2,
		score: score
	};
}

function fourOK (matches) {

	var score = 0;

	for (var i = 0, len = matches.length; i < len; i += 1) {
		if (matches[i].length === 4) {
			score += (13 * matches[i][0]);
		}
	}

	return {
		rankValue: 1,
		score: score
	};
}

function straightFlush (sequence) {

	return {
		rankValue: 0,
		score: straight([sequence]).score
	};
}

function calculateScore (cMap) {

	var cards = cMap.cards,
		handValue;

	if (cards.straightflush) {
		handValue = straightFlush(cards.suit[cards.straightflush]);
	} else if (cards.fourok) {
		handValue = fourOK(cards.matches)
		handValue.high = highCard(cards.high).score;
	} else if (cards.fullhouse) {
		handValue = fullhouse(cards.matches);
	} else if (cards.flush) {
		handValue = flush(cards.suit[cards.flush]);
	} else if (cards.straight) {
		handValue = straight(cards.sequences);
	} else if (cards.threeok) {
		handValue = threeOK([cards.matches[0]]);
		handValue.high = highCard(cards.high).score;
	} else if (cards.twoPair) {
		handValue = pairs([cards.matches[0], cards.matches[1]], 3);
		handValue.high = highCard(cards.high).score;
	} else if (cards.pair) {
		handValue = pairs([cards.matches[0]]);
		handValue.high = highCard(cards.high).score;
	} else {
		handValue = highCard(cards.high);
	}

	return handValue;
}

module.exports = calculateScore;