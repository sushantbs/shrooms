var Participant = require('./participant');

var Room = function (roomOptions, creator) {

  if (!this.creator) {
    console.error('Cannot create a room without a creator');
    return null;
  }

  if (!this.roomOptions) {
    console.error('Cannot create a room without room options');
    return null;
  }

  this.creator = new Participant(creator);
  this.size = 1;
  this.isFinished = false;
}

Room.prototype = {

    constructor: Room,

    initialize: function () {
      this.first = this.creator;
      this.last = this.creator;

      this.creator.prev = null;
      this.creator.next = null;
    },

    joinRoom: function (participant) {
      var np = new Participant(participant);

      np.prev = this.last;
      np.next = null
      this.last.next = np;

      this.last = np;

      this.size += 1;
    },

    leaveRoom: function (participant) {

      if (!this.isFinished) {
        if (this.size ===  1) {
          console.error('The last person cannot leave the room without closing it');
          return;
        }

        if (this.cretor === participant) {
          console.error('The room creator cannot leave the room without closing it');
          return;
        }
      }

      if (participant.prev) {
        participant.prev.next = participant.next;
      }

      if (participant.next) {
        participant.next.prev = participant.prev;
      }

      participant.remove();
      this.size -= 1;
    },

    closeRoom: function (roomId) {
      this.isFinished = true;
      var pr = this.start;

      while(pr) {
        this.leaveRoom(pr);
        pr = pr.next;
      }

      this.dispose();
    },

    getParticipantList: function () {

    },

    dispose: function () {

    }
}

module.exports = Room;
