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
      var socket = io.connect('/' + roomId);

      socket.on('error', (error) => {
        if (error === 'Invalid namespace') {
          this.restoreRoom();
        }
      });

      socket.on('connect', () => {

        if (typeof GetCookie !== 'undefined') {
          var rediskey = GetCookie('roomsession'); //http://msdn.microsoft.com/en-us/library/ms533693(v=vs.85).aspx
        } else {
          var cookieStr = document.cookie;
          var cookiePairs = cookieStr.split(';');
          _.forEach(cookiePairs, (pair) => {
            if (_.trim(pair.split('=')[0]) === 'roomsession') {
              rediskey = _.trim(pair.split('=')[1])
            };
          })
        }

        socket.emit('init', {crypt: rediskey});
      });

      socket.on('roomstate', (roomState) => {
        debugger;
        this.setState({...roomState})
      });
    }
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

    socket.off('roomstate', function () {

    });
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
