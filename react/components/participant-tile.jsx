import React from 'react';

export default class ParticipantTile extends React.Component {

  render () {
    return (<div>{this.props.list.length}</div>);
  }
}
