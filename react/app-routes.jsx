import React from 'react';
import {Route, Redirect, DefaultRoute, Link} from 'react-router';

import Master from './master.jsx';
import CreateRoom from './pages/create-room.jsx';
import JoinRoom from './pages/join-room.jsx';

var AppRoutes = [];

AppRoutes.push(
	<Route name='root' path='/' handler={Master} >
		<Route name='create' handler={CreateRoom} />
		<Route name='join' path='join/:roomId' handler={JoinRoom} />
	</Route>);

export default AppRoutes;
