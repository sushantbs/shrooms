import React from 'react';
import {Route, Redirect, DefaultRoute, Link} from 'react-router';

import Master from './master.jsx';

var AppRoutes = [];

AppRoutes.push(
	<Route name="root" path="/" handler={Master} />);

export default AppRoutes;
