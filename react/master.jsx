import React, {Component} from 'react';
import {Link} from 'react-router';

import ThemeManager from 'material-ui/lib/styles/theme-manager';
import DarkTheme from 'material-ui/lib/styles/raw-themes/light-raw-theme';
import AppBar from 'material-ui/lib/app-bar';
import AppCanvas from 'material-ui/lib/app-canvas';

require('../less/index2.less');

export default class MasterContainer extends Component {

	static childContextTypes = {
			muiTheme: React.PropTypes.object
	}

	getChildContext () {
		return {
			muiTheme: ThemeManager.getMuiTheme(DarkTheme)
		}
	}

	render () {

		var style = {
			fontSize: '2.5em',
			lineHeight: '2em'
		};

		return (
			<AppCanvas className='content'>
				<div className='header'>
					<AppBar titleStyle={style} title="Shroom Rule" showMenuIconButton={false} />
				</div>
				{this.props.children}
			</AppCanvas>);
	}
}
