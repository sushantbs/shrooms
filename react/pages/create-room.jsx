import React, {Component} from 'react';
import {Router, browserHistory} from 'react-router';
import service from 'superagent';

class PokerRoom extends Component {

	state = {
		name: 'Poker',
		creator: 'Creator',
		buyIn: 1000
	}

	submitForm () {
		var t = this;

		service
			.post('/api/create')
			.send(this.state)
			.end(function (err, response) {

				if (err) {
					t.setState({error: 'Error'});
					return;
				}

				if (window.localStorage) {
					localStorage.setItem(response.body.data, t.state.name);
				}

				browserHistory.push({
					pathname: '/join/' + response.body.data
				});
			});
	}

	constructor (props, context) {

		super(props, context);
		this.context = context;
	}

	updateState (key, e) {

		var state = {};
		state[key] = e.target.value;

		this.setState(state);
	}

	handleKeyDown (e) {
		debugger;
		if (e.keyCode === 13) {
				this.submitForm();
		}
	}

	render () {

		return (
			<div className='create-room'>
				<form onKeyUp={this.handleKeyDown.bind(this)}>
					<div>
						<span>Room Name: </span><input type='text' name='name' value={this.state.name || 'Test Room'} onChange={this.updateState.bind(this, 'name')} />
					</div>
					<div>
						<span>Admin Name: </span><input type='text' name='creator' value={this.state.creator || 'Sushant'} onChange={this.updateState.bind(this, 'creator')} />
					</div>
					<div>
						<span>Buy In: </span><input type='number' name='name' value={this.state.buyIn || 1000} onChange={this.updateState.bind(this, 'buyIn')} />
					</div>
					<div>
						<input type='button' value='Create Room' onClick={this.submitForm.bind(this)} />
					</div>
				</form>
			</div>);
	}
}

export default PokerRoom;
