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

console.log("Adjacent\n====================");
console.log("High Card\n-------------------");

combinationMap.cards.high = [14,5,4,3,2];
console.log(combinationMap.cards.high.join('-') + ":\t\t" + JSON.stringify(calculateScore(combinationMap), null, 4));

combinationMap.cards.high = [13,12,11,10,8];
console.log(combinationMap.cards.high.join('-') + ":\t\t" + JSON.stringify(calculateScore(combinationMap), null, 4));

combinationMap.cards.high = [9,5,4,3,2];
console.log(combinationMap.cards.high.join('-') + ":\t\t" + JSON.stringify(calculateScore(combinationMap), null, 4));

combinationMap.cards.high = [8,7,6,5,3];
console.log(combinationMap.cards.high.join('-') + ":\t\t" + JSON.stringify(calculateScore(combinationMap), null, 4));


console.log("\nPairs\n-------------------");
combinationMap.cards.pair = 1;

combinationMap.cards.high = [4,3,2];
combinationMap.cards.matches = [[14,14]];
console.log("14-14-4-3-2:\t\t" + JSON.stringify(calculateScore(combinationMap), null, 4));

combinationMap.cards.high = [12,11,10];
combinationMap.cards.matches = [[13,13]];
console.log("13-13-12-11-10:\t\t" + JSON.stringify(calculateScore(combinationMap), null, 4));

combinationMap.cards.high = [14,13,12];
combinationMap.cards.matches = [[2,2]];
console.log("2-2-14-13-12:\t\t" + JSON.stringify(calculateScore(combinationMap), null, 4));

combinationMap.cards.high = [5,4,2];
combinationMap.cards.matches = [[3,3]];
console.log("3-3-5-4-2:\t\t" + JSON.stringify(calculateScore(combinationMap), null, 4));



console.log("\nTwo Pairs\n-----------------");
combinationMap.cards.twoPair = 1;

combinationMap.cards.high = [3];
combinationMap.cards.matches = [[14,14],[2,2]];
console.log("14-14-2-2-3" + JSON.stringify(calculateScore(combinationMap), null, 4));

combinationMap.cards.high = [11];
combinationMap.cards.matches = [[13,13],[12,12]];
console.log("13-13-12-12-11" + JSON.stringify(calculateScore(combinationMap), null, 4));


console.log("\nThree-o-K\n-----------------");
combinationMap.cards.threeok = 1;

combinationMap.cards.high = [2,3];
combinationMap.cards.matches = [[14,14,14]];
console.log("14-14-2-2-3" + JSON.stringify(calculateScore(combinationMap), null, 4));

combinationMap.cards.high = [14,12];
combinationMap.cards.matches = [[13,13,13]];
console.log("14-13-13-13-12" + JSON.stringify(calculateScore(combinationMap), null, 4));


console.log("\nFull house\n-------------------");
combinationMap.cards.fullhouse = 1;

combinationMap.cards.matches = [[14,14,14],[2,2]];
console.log("14-14-14-2-2" + JSON.stringify(calculateScore(combinationMap), null, 4));

combinationMap.cards.matches = [[14,14],[13,13,13]];
console.log("14-14-13-13-13" + JSON.stringify(calculateScore(combinationMap), null, 4));

combinationMap.cards.matches = [[13,13,13],[12,12]];
console.log("13-13-13-12-12" + JSON.stringify(calculateScore(combinationMap), null, 4));

combinationMap.cards.matches = [[3,3,3],[2,2]];
console.log("3-3-3-2-2" + JSON.stringify(calculateScore(combinationMap), null, 4));

combinationMap.cards.matches = [[3,3],[2,2,2]];
console.log("3-3-2-2-2" + JSON.stringify(calculateScore(combinationMap), null, 4));
