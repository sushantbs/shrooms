import React, {Component} from 'react';
import service from 'superagent';
import _ from 'lodash';

import App from '../../apps/poker/react/app.jsx';

class JoinRoom extends Component {

	state = {
		name: 'Test Participant',
		buyIn: 0,
		handshakeComplete: false,
		fetchingRoom: false,
		error: null,
		started: false
	}

	sendJoinRequest () {

		var t = this;

		service()
			.post('/api/join')
			.send(this.state)
			.end(function (err, response) {

				if (err) {
					t.setState({error: 'Error'});
					return;
				}

				if (window.localStorage) {
					localStorage.setItem(t.state.roomId, t.state.name);
				}

				t.setState({handshakeComplete: true, roomData: response.body.data});
			});
	}

	sendLeaveRequest () {
		var t = this;

		service()
			.post('/api/leave')
			.send(this.state)
			.end(function (err, response) {

				if (err) {
					t.setState({error: 'Error'});
					return;
				}

				if (window.localStorage) {
					localStorage.removeItem(t.state.roomId);
				}

				t.setState({handshakeComplete: false, roomData: null, fetchingRoom: false});
			});
	}

	getRoomState () {
		var t = this;

		service()
			.get('/api/roomstate')
			.query({roomId: this.state.roomId})
			.end(function (err, response) {

				if (err) {
					t.setState({error: 'Error'});
					return;
				}

				t.setState({handshakeComplete: true, roomData: response.body.data, fetchingRoom: false, started: Boolean(response.body.data.inProgress)});
			});
	}

	startGame () {

		var t = this;
		var {roomId} = this.state;

		service()
			.post('/api/startgame')
			.send({roomId})
			.end(function (err, response) {

				if (err) {
					t.setState({error: 'Error'});
					return;
				}

				if (_.at(response, 'body.data.inProgress')) {
					t.setState({started: true});
				}
			});

	}

	componentWillMount () {

		if (window.localStorage) {
			var name = localStorage.getItem(this.state.roomId);
			if (name) {
				this.state.name = name;
				this.state.fetchingRoom = true;
				this.getRoomState();
			}
		}
	}

	constructor (props, context) {

		super(props, context);
		this.context = context;
		this.state.roomId = this.props.params.roomId;
	}

	updateState (key, e) {

		var state = {},
			val = e.target.value;

		if (key === 'buyIn' && isNaN(val)) {
			e.preventDefault();
			return;
		}
		state[key] = e.target.value;

		this.setState(state);
	}

	render () {

		var content = 'Please wait...';

		var appArea = null;

		if (!this.state.started) {
			if (!this.state.roomData) {
				appArea = (<span>Fetching room data...</span>);
			} else if (this.state.roomData.creator === this.state.name) {
				appArea = (<input key='start-game-button' className='start-button' type='button' value='Start Game' onClick={this.startGame.bind(this)} />);
			} else {
				appArea = (<input key='start-game-button' className='start-button' type='button' value='Start Game' onClick={this.startGame.bind(this)} />);
			}
		} else {
			appArea = (<App key='game-of-room' room={this.state.roomData} getState={this.getRoomState.bind(this)} me={this.state.name} roomId={this.state.roomId} />);
		}

		if (this.state.handshakeComplete) {
			content = [
				<div key='room-name' className='room-name'>{this.state.roomData.name}</div>,
				<div key='participant-list' className='participant-list'>
					<h4>Participant List</h4>
					{_.map(this.state.roomData.participants, (participant, index) =>
						(participant.name === this.state.name) ?
							(<div key={'participant-' + index} className='participant-name'>{participant.name}<span className='participant-worth'>{participant.worth}</span><input className='leave-button' type='button' value='Leave' onClick={this.sendLeaveRequest.bind(this)} /></div>)
							: (<div key={'participant-' + index} className='participant-name'>{participant.name}<span className='participant-worth'>{participant.worth}</span></div>))}
					{appArea}
				</div>,
				];
		} else if (this.state.error) {
			content = (
				<div className='participant-details'>
					<div className='error-message'>{this.state.error}</div>
				</div>);
		} else if (!this.state.fetchingRoom) {
			content = (
				<div className='participant-details'>
					<form>
						<div>
							<span>Name: </span><input type='text' value={this.state.name} onChange={this.updateState.bind(this, 'name')} />
						</div>
						<div>
							<span>Buy In: </span><input type='text' value={this.state.buyIn} onChange={this.updateState.bind(this, 'buyIn')} />
						</div>
						<div>
							<input type='button' value='Join Room' onClick={this.sendJoinRequest.bind(this)} />
						</div>
					</form>
				</div>);
		}

		return (
			<div className='join-room'>
				{content}
			</div>);
	}
}

JoinRoom.contextTypes = {
	router: React.PropTypes.func.isRequired
}

export default JoinRoom;
