import React, {Component} from 'react';
import {Link} from 'react-router';

require('../less/index.less');

export default class MasterContainer extends Component {

	render () {
		return (
			<div className='content'>
				<div className='header'>
					<h3>Secure Rooms</h3>
					<div className='create-room-link'>
						<Link to='/create'>Create Room</Link>
					</div>
				</div>
				{this.props.children}
			</div>);
	}
}
