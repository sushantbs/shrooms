import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import service from 'superagent';
import _ from 'lodash';
import TextField from 'material-ui/lib/text-field';
import ParticipantTile from '../components/participant-tile.jsx';

export default class Shroom extends Component {

  state = {
    participants: []
  }

  constructor () {
    super();
  }

  makeSocketConnection () {

    var roomId = this.props.params.roomId;
    if (roomId) {

      console.log('connecting to ' + roomId);
      this.socket = io.connect('/' + roomId);
      this.addSocketListeners();
    }
  }

  setReconnectionTimer () {
    //setTimeout(() => (this.makeSocketConnection()), 3000);
  }

  addSocketListeners () {

    var socket = this.socket;

    socket.on('error', (error) => {
      console.log('Socket connection error - ' + error);
      if (error === 'Invalid namespace') {
        this.restoreRoom();
      } else {
        this.setReconnectionTimer();
      }
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      if (typeof GetCookie !== 'undefined') {
        //http://msdn.microsoft.com/en-us/library/ms533693(v=vs.85).aspx
        var cryptKey = GetCookie('roomsession');
      } else {
        var cookieStr = document.cookie;
        var cookiePairs = cookieStr.split(';');
        _.forEach(cookiePairs, (pair) => {
          if (_.trim(pair.split('=')[0]) === 'roomsession') {
            cryptKey = _.trim(pair.split('=')[1])
          };
        })
      }

      socket.emit('init', {crypt: cryptKey});
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.setReconnectionTimer();
    });

    socket.on('roomstate', (roomState) => {
      console.log('On roomstate');
      this.setState({...roomState})
    });
  }

  restoreRoom () {

    service
      .get('/api/state')
      .end((err, response) => {
        var roomState = response.body.data;
        this.makeSocketConnection();
        this.setState({...roomState});
      });
  }

  componentDidMount () {

    this.makeSocketConnection();
  }

  componentWillUnmount () {

    socket.removeAllListeners('roomstate');
  }

  render () {
    return (
      <div className='content-block room-app'>
        <ParticipantTile participants={this.state.participants} />
        <TextField style={{width: '100%'}} floatingLabelText='Share Link' value={'http://' + location.host + '/join/' + this.props.params.roomId} />
      </div>
    );
  }
}
