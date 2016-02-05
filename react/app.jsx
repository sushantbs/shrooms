import domready from 'domready';
import ReactDOM from 'react-dom';
import React from 'react';
import {Router, Route, browserHistory, Redirect, IndexRoute, Link} from 'react-router';

import Master from './master.jsx';
import CreateRoom from './pages/create-room.jsx';
import JoinRoom from './pages/join-room.jsx';
import Shroom from './pages/room-app.jsx';

domready(function () {

  //window.myDebug = require('debug');

  //Needed for React Developer Tools
  window.React = React;

  var injectTapEventPlugin = require("react-tap-event-plugin");
  injectTapEventPlugin();

  ReactDOM.render(
    (<Router history={browserHistory}>
  		<Route path='/' component={Master} >
  			<Route path='create' component={CreateRoom} />
  			<Route path='join/:roomId' component={JoinRoom} />
        <Route path='room/:roomId' component={Shroom} />
  		</Route>
  	</Router>), document.getElementById('content-section'));
});
