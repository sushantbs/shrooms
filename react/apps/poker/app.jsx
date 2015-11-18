import React, {Component} from 'react';
import _ from 'myx-lib/underscore';

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

	turn () {

	}

	dealGame () {

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

	render () {

		let {roomState} = this.state,
			{gameState} = roomState,
			{me} = this.props,
			dealer = roomState.participants[gameState.dealer].name,
			end;


		switch (gameState.stage) {
			case 0: // Cards to be dealt


			case 1:
			case 2:

				break;

			default:

				break;
		}

		var participantArr = _.map(roomState.participants, (participant) => {

			var classNameArr = ['participant-block'],
				dealButton = null;

			if (participant.name === me) {
				classNameArr.push('my-block');
			}

			if (participant.name === dealer) {
				classNameArr.push('dealer-block');

				if (gameState.stage === 0) {

					if (dealer === me) {
						dealButton = (<input type='button' className='deal-button' value='Deal' onClick={this.dealGame.bind(this)} />);
					} else {
						dealButton = (<div className='dealer-text'>Waiting for dealer</div>);
					}
				}
			}

			return (
				<div key={'participant-' + participant.name} className={[classNameArr.join(' ')]}>
					<div className='block-name'>{participant.name}</div>
					<div className='block-worth'>{participant.worth}</div>
					<div className='block-pot'>{participant.potValue || 0}</div>
					{dealButton}
				</div>);
		});

		if (gameState.stage) {
			var turnInfo = (<div className='turn-info-block'>{gameState.turns[gameState.turns.length - 1]}</div>);
		} else {
			var turnInfo = (<div className='turn-info-block'>Waiting for game to start</div>);
		}

		return (
			<div className='game-section'>
				{participantArr}
				{turnInfo}
			</div>);
	}
}

export default PokerApp;
