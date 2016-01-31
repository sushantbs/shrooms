var calculateScore = require('../lib/score-calculator');

var combinationMap = {
	cards: {
		all: [2,3,4,5,6,7,8],
		high: [4,5,6,7,8],
		matches: [],
		sequences: [],
		singles: [],
		suit: {1: [], 2: [], 3: [], 4: []},
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
		singleSuit: 0,
		isMatching: false,
		isSequence: false
	}
};

console.log("Min-Max\n====================");
console.log("High Card\n-------------------");

combinationMap.cards.high = [7,5,4,3,2];
console.log(calculateScore(combinationMap));

combinationMap.cards.high = [14,13,12,11,9];
console.log(calculateScore(combinationMap));

console.log("\nPairs\n-------------------");
combinationMap.cards.pair = 1;

combinationMap.cards.high = [5,4,3];
combinationMap.cards.matches = [[2,2]];
console.log(calculateScore(combinationMap));

combinationMap.cards.high = [13,12,11];
combinationMap.cards.matches = [[14,14]];
console.log(calculateScore(combinationMap));

console.log("\nTwo Pairs\n-----------------");
combinationMap.cards.twoPair = 1;

combinationMap.cards.high = [4];
combinationMap.cards.matches = [[3,3],[2,2]];
console.log(calculateScore(combinationMap));

combinationMap.cards.high = [12];
combinationMap.cards.matches = [[14,14],[13,13]];
console.log(calculateScore(combinationMap));

console.log("\nThree-o-K\n-----------------");
combinationMap.cards.threeok = 1;

combinationMap.cards.high = [4,3];
combinationMap.cards.matches = [[2,2,2]];
console.log(calculateScore(combinationMap));

combinationMap.cards.high = [13,12];
combinationMap.cards.matches = [[14,14,14]];
console.log(calculateScore(combinationMap));


console.log("\nStraight\n-------------------");
combinationMap.cards.straight = 1;
combinationMap.cards.high = [];

combinationMap.cards.sequences = [[5,4,3,2,1]];
console.log(calculateScore(combinationMap));

combinationMap.cards.sequences = [[14,13,12,11,10]];
console.log(calculateScore(combinationMap));

console.log("\nFlush\n-------------------");
combinationMap.cards.flush = 1;

combinationMap.cards.suit['1'] = [7,5,4,3,2];
console.log(calculateScore(combinationMap));

combinationMap.cards.suit['1'] = [14,13,12,11,9];
console.log(calculateScore(combinationMap));


console.log("\nFull house\n-------------------");
combinationMap.cards.fullhouse = 1;

combinationMap.cards.matches = [[3,3],[2,2,2]];
console.log(calculateScore(combinationMap));

combinationMap.cards.matches = [[14,14,14],[13,13]];
console.log(calculateScore(combinationMap));

console.log("\nFour-o-K\n----------------");
combinationMap.cards.fourok = 1;

combinationMap.cards.high = [3];
combinationMap.cards.matches = [[2,2,2,2]];
console.log(calculateScore(combinationMap));

combinationMap.cards.high = [13];
combinationMap.cards.matches = [[14,14,14,14]];
console.log(calculateScore(combinationMap));

console.log("\nStraight Flush\n----------------");
combinationMap.cards.straightflush = 2;
combinationMap.cards.high = [];

combinationMap.cards.suit[2] = [5,4,3,2,1];
console.log(calculateScore(combinationMap));

combinationMap.cards.suit[2] = [14,13,12,11,10];
console.log(calculateScore(combinationMap));


