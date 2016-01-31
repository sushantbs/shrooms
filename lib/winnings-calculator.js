var scoreCalculator = require('./score-calculator');
var getCombinationMap = require('./combination-map');

module.exports = function (roomState) {

	var participantResult = [],
		gameState = roomState.gameState,
		tableCards = gameState.flop.concat(gameState.turn).concat(gameState.river),
		pots = gameState.pots,
		allSeven = null,
		results = {winners: []},
		playerScore = null,
		cardDS = null;


	// Which participants are part of the pot?
	// _.each(pots, function () {

	// });

	_.each(roomState.participants, function (participant, index) {

		if (!participant.hasFolded) {

			allSeven = tableCards.concat(participant.cards);
			allSeven = _.sortBy(allSeven, function (card) {return (-1 * cardValue[card.split(':')[0]])});

			cardDS = getCombinationMap(allSeven);
			playerScore = scoreCalculator(cardDS);

			if (!results.winners.length
				|| (playerScore.rankValue < results.winnerScore.rankValue)
				|| (playerScore.rankValue === results.winnerScore.rankValue && playerScore.score > results.winnerScore.score)
				|| (playerScore.rankValue === results.winnerScore.rankValue && playerScore.score === results.winnerScore.score && playerScore.high > results.winnerScore.high)) {

				results.winners = [index];
				results.winnerScore = playerScore;

			} else if (playerScore.rankValue === results.winnerScore.rankValue && playerScore.score === results.winnerScore.score && playerScore.high === results.winnerScore.high) {
				results.winners.push(index);
			}
		}
	});

	if (!results.winners.length) {
		console.log('ERROR: Abe?! Yeh kya hua?? Koi winner toh hona chahiye!');
		return false;
	}

	return results;
}