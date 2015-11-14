import React, {Component} from 'react';
import service from 'myx-lib/service';
import _ from 'myx-lib/underscore';

class JoinRoom extends Component {

	state = {
		name: 'Test Participant',
		handshakeComplete: false,
		fetchingRoom: false,
		error: null
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

				t.setState({handshakeComplete: true, roomData: response.body.data, fetchingRoom: false});
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

		var state = {};
		state[key] = e.target.value;

		this.setState(state);
	}

	render () {

		var content = 'Please wait...';

		if (this.state.handshakeComplete) {
			content = [
				<div className='room-name'>{this.state.roomData.name}</div>,
				<div className='participant-list'>
					<h4>Participant List</h4>
					{_.map(this.state.roomData.participants, (participant, index) =>
						(participant === this.state.name) ?
							(<div key={'participant-' + index} className='participant-name'>{participant}<input className='leave-button' type='button' value='Leave' onClick={this.sendLeaveRequest.bind(this)} /></div>)
							: (<div key={'participant-' + index} className='participant-name'>{participant}</div>))}
				</div>];
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
