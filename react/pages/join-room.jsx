import React, {Component} from 'react';
import {Router, browserHistory} from 'react-router';
import service from 'superagent';
import Card from 'material-ui/lib/card/card';
import CardHeader from 'material-ui/lib/card/card-header';
import CardActions from 'material-ui/lib/card/card-actions';
import CardText from 'material-ui/lib/card/card-text';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';

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

class CreateRoom extends Component {

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
					t.setState({error: 'Error'});
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

	render () {

		var ruleBasedFields = null;

		if (this.state.context) {
			ruleBasedFields = [];
			let translator = rules[this.state.rule].context;

			_.forEach(this.state.context, (ctxItem, index) => {
				ruleBasedFields.push(<div key={index} className='info-row'><div className='info-label'>{translator[index]}</div><div className='info-value'>{ctxItem}</div></div>)
			});
		}

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
						</div>
					</CardActions>
				</Card>
			</div>);
	}
}

export default CreateRoom;
