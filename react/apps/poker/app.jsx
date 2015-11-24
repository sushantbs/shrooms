import React, {Component} from 'react';
import _ from 'myx-lib/underscore';
import service from 'myx-lib/service';

class PokerApp extends Component {

	static propTypes = {
		room: React.PropTypes.object.isRequired,
		getState: React.PropTypes.func.isRequired
	}

	state = {
		roomState: null
	}

	getState () {
		this.props.getState();
	}

	game () {

	}

	turn (turnObj) {
		var t = this;
		var {roomId} = this.props;

		turnObj.roomId = roomId;
		service()
			.post('/api/playturn')
			.send(turnObj)
			.end(function (err, response) {

				if (err) {
					t.setState({error: 'Error'});
					return;
				}

				t.setState({roomState: _.at(response, 'body.data')});
			});

	}

	deal () {
		var t = this;
		var {roomId} = this.props;

		service()
			.post('/api/deal')
			.send({roomId})
			.end(function (err, response) {

				if (err) {
					t.setState({error: 'Error'});
					return;
				}

				t.setState({roomState: _.at(response, 'body.data')});
			});
	}

	stateTimer () {
		var t = this;

		setTimeout(function () {
			t.getState();
			t.stateTimer();
		}, 2000);
	}

	componentDidMount () {

		this.getState();
	}

	constructor (props, context) {

		super(props, context);
		this.context = context;
		this.state.roomState = this.props.room;
	}

	checkCall (index) {

		var type = 'call';

		this.turn({index, type});
	}

	fold (index) {

		var type = 'fold';

		this.turn({index, type});
	}

	raise (index, raise) {

		var type = 'raise';

		this.turn({index, type,  raise});
	}

	renderCard (code) {

		var codes = code.split(':'),
			suit = codes[1],
			color,
			unicode;

		switch (suit) {

			case '1':
				unicode = <span>&spades;</span>;
				color = 'black';
				break;

			case '2':
				unicode = <span>&clubs;</span>;
				color = 'black';
				break;

			case '3':
				unicode = <span>&hearts;</span>;
				color = 'red';
				break;

			case '4':
				unicode = <span>&diams;</span>;
				color = 'red';
				break;
		}

		return (<div key={'table-cards-' + codes.join('-')} style={{color: color}} className='card'>{[codes[0], unicode]}</div>);
	}

	renderActions (pot, index) {

		var player = pot.players[index];

		if (!player) {
			player = {
				contrib: 0
			}
		}

		var callButton,
			info = null;

		if (!pot.toCall || ((pot.toCall - player.contrib) === 0)) {
			callButton = (<input type='button' value='Check' onClick={this.checkCall.bind(this, index)} />);
		} else {
			callButton = (<input type='button' value='Call' onClick={this.checkCall.bind(this, index)} />);
			info = (<div className='call-info'>{pot.toCall - player.contrib} to call</div>);
		}

		return [
			info,
			(<input type='button' value='Fold' onClick={this.fold.bind(this, index)} />),
			callButton,
			(<input type='button' value='Raise' onClick={this.raise.bind(this, index, 50)} />)
		]
	}

	render () {

		let {roomState} = this.state,
			{me} = this.props,
			{gameState} = roomState,
			dealer = roomState.participants[gameState.dealer].name,
			pots = gameState.pots,
			pot = pots && pots[pots.length - 1],
			end;


		switch (gameState.stage) {
			case 0: // Cards to be dealt


			case 1: // Cards dealt waiting for players to complete first round of betting


			case 2:

				break;

			default:

				break;
		}

		var participantArr = _.map(roomState.participants, (participant, index) => {

			var classNameArr = ['participant-block'],
				dealButton = null,
				cardBlock = null;

			if (participant.name === me) {
				classNameArr.push('my-block');
				cardBlock = (<div className='block-cards'>{(participant.cards && participant.cards.length) ? (<div>{[this.renderCard(participant.cards[0]), this.renderCard(participant.cards[1])]}</div>) : null}</div>)
			}

			if (participant.name === dealer) {
				classNameArr.push('dealer-block');

				if (gameState.stage === 0) {

					if (dealer === me) {
						dealButton = (<input type='button' className='deal-button' value='Deal' onClick={this.deal.bind(this)} />);
					} else {
						dealButton = (<div className='dealer-text'>Waiting for dealer</div>);
					}
				}
			}

			return (
				<div key={'participant-' + participant.name} className={[classNameArr.join(' ')]}>
					<div className='block-name'>{participant.name}</div>
					<div className='block-worth'>{participant.worth}</div>
					{cardBlock}
					<div className='block-pot-value'>In the pot: {(pot.players[index] && pot.players[index].contrib) || 0}</div>
					{((roomState.participants[gameState.currentPlayer].name === me) && (gameState.currentPlayer === index)) ? this.renderActions(pot, index) : null}
					{dealButton}
				</div>);
		});

		var cardBlock = (
			<div className='card-block'>
				<div>
					<div className='all-cards'>
						<div className='card upside-down stacked'>GR</div>
					</div>
					<div className='burn-cards'>
						<div className='card upside-down stacked'>GR</div>
					</div>
				</div>
				<div className='flop-cards'>{_.map(gameState.flop, this.renderCard.bind(this))}</div>
				<div className='turn-cards'>{_.map(gameState.turn, this.renderCard.bind(this))}</div>
				<div className='river-cards'>{_.map(gameState.river, this.renderCard.bind(this))}</div>
			</div>);

		if (gameState.stage && gameState.turns && gameState.turns.length) {
			var turnInfo = (<div className='turn-info-block'>{gameState.turns[gameState.turns.length - 1]}</div>);
		} else {
			var turnInfo = (<div className='turn-info-block'></div>);
		}

		return (
			<div className='game-section'>
				{cardBlock}
				{participantArr}
				{turnInfo}
			</div>);
	}
}

export default PokerApp;
