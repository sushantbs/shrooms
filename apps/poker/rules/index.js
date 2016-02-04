var state = {
  buyIn: 0,
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
};

module.exports = {
  type: 'card',
  game: {
    pot: 0,
    hand: 0,

  },
  dealer: {
    roundRobin: true,
    initial: 0
  },
  deal: {
    cards: 2
  },
  player: {
    props: {
      hand: 0,
    },
    actions: {

    }
  },
  play: {
    always: {

    },
    turns: [{
        type: 'call'
    }]
  },
  forfeit: {

  },
  result: {

  }
}
