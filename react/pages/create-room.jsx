import React, {Component} from 'react';
import {Router, browserHistory} from 'react-router';
import service from 'superagent';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import RaisedButton from 'material-ui/lib/raised-button';

class PokerRoom extends Component {

	state = {
		name: '',
		creator: '',
		rule: -1,
		context: null
	}

	static defaultProps = {
		rules: [{text: 'Select the Rules', value: -1}, {text: 'Texas Holdem Poker', value: 1}, {text: 'Black Jack', value: 2}]
	}

	submitForm () {
		var t = this;

		if (this.state.rule === -1) {
			return (this.setState({error: 'Rules are necessary.'}));
		}

		if (!this.state.name || !this.state.creator) {
			return this.setState({error: 'Names are important'});
		}

		service
			.post('/api/create')
			.send(this.state)
			.end(function (err, response) {

				if (err) {
					t.setState({error: 'Error'});
					return;
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

	updateRule (e, index, rule) {

		let context = ((rule === 1) ? {buyIn: 1000, small: 10} : null);
		this.setState({rule, context});
	}

	updateState (key, e) {

		var state = {};
		state[key] = e.target.value;

		this.setState(state);
	}

	updateContext (key, e) {
		let context = {},
			{value} = e.target;

		context[key] = value;

		this.setState({context});
	}

	render () {

		var ruleBasedFields = null;

		if (this.state.rule === 1 && this.state.context) {
			ruleBasedFields = [
				(<TextField floatingLabelText='Buy In' value={this.state.context.buyIn} onChange={this.updateContext.bind(this, 'buyId')} onEnterKeyDown={this.submitForm.bind(this)} />),
				(<TextField floatingLabelText='Small blinds' value={this.state.context.small} onChange={this.updateContext.bind(this, 'small')} onEnterKeyDown={this.submitForm.bind(this)} />)
			]
		}

		return (
			<div style={{padding: 10}}>
				<form>
					<SelectField value={this.state.rule} onChange={this.updateRule.bind(this)}>
						{_.map(this.props.rules, (ruleObj, index) => (<MenuItem key={index} value={ruleObj.value} primaryText={ruleObj.text} />))}
					</SelectField>
					<TextField floatingLabelText='Room Name' hintText='e.g Poker 101' value={this.state.name} onChange={this.updateState.bind(this, 'name')} onEnterKeyDown={this.submitForm.bind(this)} />
					<TextField floatingLabelText='Creator Name' value={this.state.creator} onChange={this.updateState.bind(this, 'creator')} onEnterKeyDown={this.submitForm.bind(this)} />
					{ruleBasedFields}
					<div style={{marginTop: 50}}>
						<RaisedButton label='CREATE ROOM' primary={true} onClick={this.submitForm.bind(this)} />
					</div>
				</form>
			</div>);
	}
}

export default PokerRoom;
