import React, {Component} from 'react';
import service from 'myx-lib/service';
import _ from 'myx-lib/underscore';

class JoinRoom extends Component {

	state = {
		name: 'Test Participant',
		handshakeComplete: false,
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

				t.setState({handshakeComplete: true, roomData: response.body.data});
			});
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

		var content;

		if (this.state.handshakeComplete) {
			content = (
				<div className='participant-list'>
					<h4>Participant List</h4>
					{_.map(this.state.roomData.participants, (participant, index) => (<div key={'participant-' + index} className='participant-name'>{participant}</div>))}
				</div>);
		} else if (this.state.error) {
			content = (
				<div className='participant-details'>
					<div className='error-message'>{this.state.error}</div>
				</div>);
		} else {
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
