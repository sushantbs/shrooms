import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import service from 'superagent';
import _ from 'lodash';
import ParticipantTile from '../components/participant-tile.jsx';

export default class Shroom extends Component {

  state = {
    participants: []
  }

  constructor () {
    super();
  }

  componentDidMount () {

    service
      .get('/api/state')
      .end((err, result) => (this.setState({participants: result.participants})));
  }

  render () {
    return (<ParticipantTile list={this.state.participants} />);
  }
}
