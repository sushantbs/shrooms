import React from 'react';
import Card from 'material-ui/lib/card/card';
import CardHeader from 'material-ui/lib/card/card-header';
import CardText from 'material-ui/lib/card/card-text';
import Avatar from 'material-ui/lib/avatar';
import FontIcon from 'material-ui/lib/font-icon';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';


export default class ParticipantTile extends React.Component {
  state = {
    collapsed: true
  }

  constructor (props) {
    super(props);
  }

  onRemoveClick (participant) {

    let {user, socket} = this.props;

    if (user.isCreator) {
      socket.emit('removeParticipant', participant);
    } else {
      if (user.me === participant._id) {
        socket.emit('removeParticipant', participant);
      }
    }
  }

  render () {

    var {participants, user} = this.props,
      plength = participants.length,
      hasParticipants = Boolean(plength),
      cardTitle = (plength > 1) ? 'participants' : 'participant',
      end;

    return (
      <Card>
        <CardHeader
          title={plength}
          subtitle={cardTitle}
          avatar={<Avatar icon={<FontIcon className="material-icons">perm_identity</FontIcon>} />}
          actAsExpander={hasParticipants}
          showExpandableButton={hasParticipants} />

        <CardText expandable={true}>
          <List>
          {
            (user.isCreator) ? (
              _.map(participants, (participant, index) => (
                <ListItem
                  key={'participant' + index}
                  rightIcon={<FontIcon onClick={this.onRemoveClick.bind(this, participant)} className="material-icons">highlight_off</FontIcon>}
                  primaryText={participant.name} />
              ))
            ) : (
              _.map(participants, (participant, index) => (
                <ListItem
                  key={'participant' + index}
                  rightIcon={
                    (user.me === participant._id) ?
                      (<FontIcon onClick={this.onRemoveClick.bind(this, participant)} className="material-icons">highlight_off</FontIcon>)
                      : null}
                  primaryText={participant.name} />
              ))
            )
          }
          </List>
        </CardText>
      </Card>
    );
  }
}
