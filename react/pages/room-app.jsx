import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import service from 'superagent';
import _ from 'lodash';
import TextField from 'material-ui/lib/text-field';
import ParticipantTile from '../components/participant-tile.jsx';

export default class Shroom extends Component {

  state = {
    participants: [],
    user: {me: null, isCreator: false},
    socket: null
  }

  constructor () {
    super();
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

  makeSocketConnection () {

    var roomId = this.props.params.roomId;
    if (roomId) {

      console.log('connecting to ' + roomId);
      this.state.socket = io.connect('/' + roomId);
      this.addSocketListeners();
    }
  }

  setReconnectionTimer () {
    //setTimeout(() => (this.makeSocketConnection()), 3000);
  }

  addSocketListeners () {

    var socket = this.state.socket;

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

    socket.on('mystate', (myState) => {
      this.setState({user: myState});
    });

    socket.on('leave', () => {
      this.eraseCookieFromAllPaths('roomsession');
      browserHistory.push({
        pathname: '/thankyou'
      })
    });
  }

  restoreRoom () {

    service
      .get('/api/state')
      .end((err, response) => {

        if (err) {
          return;
        }
        
        var roomState = response.body.data;
        this.makeSocketConnection();
        this.setState({...roomState});
      });
  }

  componentDidMount () {

    this.makeSocketConnection();
  }

  componentWillUnmount () {

    var socket = this.state.socket;

    socket.removeAllListeners('roomstate');
  }

  render () {
    return (
      <div className='content-block room-app'>
        <ParticipantTile participants={this.state.participants} user={this.state.user} socket={this.state.socket} />
        <TextField style={{width: '100%'}} floatingLabelText='Share Link' value={'http://' + location.host + '/join/' + this.props.params.roomId} />
      </div>
    );
  }
}
