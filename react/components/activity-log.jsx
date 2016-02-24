import React, {Component} from 'react';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';
import _ from 'lodash';

export default class ActivityLog extends Component {

  state = {
    message: ''
  }

  componentDidUpdate () {
    var logDiv = this.refs['activity-log'];
    logDiv.scrollTop = logDiv.scrollHeight;
  }

  updateState (stateKey, e) {
    var state = {};
    state[stateKey] = e.target.value;

    this.setState(state);
  }

  sendActivity () {

    if (this.props.onMessage) {
      this.props.onMessage(this.state.message);
    }

    this.setState({
      message: ''
    });
  }



  render () {

    var {activity, user} = this.props;
    var height = (document.body.clientHeight - 250);
    return (
      <div className='activity-area' style={{height: height}}>
        <div className='activity-log' ref='activity-log'>
        {
          _.map(activity, (activityItem, index) => {
            if (activityItem.actor === 'room') {
              return (
                <div key={index} className='room-activity'>
                  <div className='activity-log'>{activityItem.text}</div>
                </div>);
            } else {
              return (
                <div key={index} className={((activityItem.actor.id === user.id) ? 'my-activity' : 'user-activity')}>
                  <div className='activity-details'>
                    <div className='activity-actor'>{activityItem.actor.name}</div>
                    <div className='activity-text'>{activityItem.text}</div>
                  </div>
                </div>);
            }
          })
        }
        </div>
        <div className='create-activity'>
          <div className='activity-text'>
            <TextField className='activity-input' value={this.state.message} onChange={this.updateState.bind(this, 'message')} onEnterKeyDown={this.sendActivity.bind(this)} />
          </div>
          <div className='activity-button'>
            <RaisedButton label='SEND' primary={true} onClick={this.sendActivity.bind(this)} />
          </div>
        </div>
      </div>
    );
  }
}
