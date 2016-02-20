import React, {Component} from 'react';
import {Router, browserHistory} from 'react-router';
import service from 'superagent';
import Card from 'material-ui/lib/card/card';
import CardHeader from 'material-ui/lib/card/card-header';
import CardActions from 'material-ui/lib/card/card-actions';
import CardText from 'material-ui/lib/card/card-text';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';
import _ from 'lodash';

var rules = {
	1: {
		text: 'Texas Holdem Poker',
		context: {
			buyIn: 'Buy In',
			small: 'Small Blind'
		}
	},
	2: {
		text: 'Black Jack',
		context: {
			min: 'Minimum Bet'
		}
	}
}

class JoinRoom extends Component {

	state = {
		name: '',
		rule: 0,
		context: null
	}

	submitForm () {
		var t = this;

		if (!this.state.name) {
			return this.setState({error: 'Names are important'});
		}

		service
			.post('/api/join')
			.send({name: this.state.participantName, roomId: this.state.roomId})
			.end(function (err, response) {

				if (err) {
					var errorBody = _.get(err, 'response.body');
					debugger;
					t.setState({error: errorBody.error, errorData: errorBody.data});
					return;
				}

				browserHistory.push({
					pathname: '/room/' + response.body.data
				});
			});
	}

	constructor (props, context) {

		super(props, context);
		this.context = context;
	}

	componentWillMount () {
		this.state.roomId = this.props.params.roomId;
	}

	componentDidMount () {

		let {roomId} = this.state;

		service
			.get('/api/info')
			.query({roomId})
			.end((err, response) => {
				if (err) {
					return console.error('Error fetchin room details');
				}

				this.setState({...response.body.data})
			})
	}

	updateState (key, e) {

		var state = {};
		state[key] = e.target.value;

		this.setState(state);
	}

	eraseCookieFromAllPaths (name) {
		// This function will attempt to remove a cookie from all paths.
		var pathBits = location.pathname.split('/');
		var pathCurrent = ' path=';

		// do a simple pathless delete first.
		document.cookie = name + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT;';

		for (var i = 0; i < pathBits.length; i++) {
				pathCurrent += ((pathCurrent.substr(-1) != '/') ? '/' : '') + pathBits[i];
				document.cookie = name + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT;' + pathCurrent + ';';
		}
	}

	forceJoinRoom () {
		this.eraseCookieFromAllPaths('roomsession');
		this.submitForm();
	}

	goBack () {
		browserHistory.push({
			pathname: '/room/' + (this.state.errorData && this.state.errorData.roomId)
		})
	}

	render () {

		var ruleBasedFields = null;

		if (this.state.context) {
			ruleBasedFields = [];
			let translator = rules[this.state.rule].context;

			_.forEach(this.state.context, (ctxItem, index) => {
				ruleBasedFields.push(<div key={index} className='info-row'><div className='info-label'>{translator[index]}</div><div className='info-value'>{ctxItem}</div></div>)
			});
		}

		var errorBlock = this.state.errorData ? (
			<div className='error-block'>
				<div>{this.state.error}</div>
				<p>Click <b>FORCE JOIN</b> to leave the room you other room part of and join {this.state.name}.
				If you wish to go back to the other room click GO BACK.</p>
				<RaisedButton label='FORCE JOIN' primary={true} onClick={this.forceJoinRoom.bind(this)} />
				<RaisedButton label='GO BACK' onClick={this.goBack} />
			</div>) : null;

		return (
			<div className='content-block'>
				<Card>
					<CardHeader
						title={this.state.name}
						subtitle={this.state.rule && rules[this.state.rule].text} />
					<CardText>
						{ruleBasedFields}
					</CardText>
					<CardActions>
						<div className='form-container'>
							<TextField floatingLabelText='Name' value={this.state.participantName} onChange={this.updateState.bind(this, 'participantName')} onEnterKeyDown={this.submitForm.bind(this)} />
							<div style={{marginTop: 50}}>
								<RaisedButton label='JOIN ROOM' primary={true} onClick={this.submitForm.bind(this)} />
							</div>
							{errorBlock}
						</div>
					</CardActions>
				</Card>
			</div>);
	}
}

export default JoinRoom;
