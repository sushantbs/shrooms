var crypto = require('crypto');
var moment = require('moment');
var _ = require('lodash');

var getSHA1 = function (str) {

  var crypt = crypto.createHash('sha1');
  crypt.end(str);
  return crypt.read().toString('hex');
}

function Participant (options) {

  if (!options.name && typeof options.name !== 'string') {
    console.log('ERROR: Participant name has to be a non-empty string');
    return null;
  }

  this.name = options.name;
  this.createdOn = moment(new Date());
  this.isCreator = false;
  this.socket = null;
  this._id = options._id || getSHA1(this.createdOn.unix().toString() + this.name);
}

Participant.prototype = {

  constructor: Participant,

  markAsCreator: function () {
    this.isCreator = true;
  },

  getId: function () {
    return this._id;
  },

  getState: function () {
    return _.extend({name: this.name, _id: this._id}, this.context);
  },

  setContext: function (context) {

    this.context = context;

    return this;
  },

  setRules: function (ruleSet) {

    return this;
  },

  setSocket: function (socket) {

    var that = this;
    this.socket = socket;

    socket.on('removeParticipant', function (participantObj) {

      if (participantObj._id === that._id) {
        that.room
          .leaveRoom(that)
          .write()
          .then(function () {
            that.remove();
          });
      } else {
        if (that.isCreator) {
          var p = that.room.getParticipant(participantObj._id);
          that.room
            .leaveRoom(p)
            .write()
            .then(function () {
              p.remove();
            });
        }
      }
    });

    socket.on('activity', function (activityObj) {
      that.room.addActivity(activityObj);
    });

    this.pushPrivate();
  },

  setRoom: function (room) {
    if (!this.room || (this.room.getId() === room.getId())) {
      this.room = room;
    } else {
      console.log('Error: There is already a room associated with this participant - ' + this.room.getId());
    }
  },

  pushPrivate: function () {
    console.log('emiting prvate state for ' + this._id);
    this.socket.emit('mystate', {id: this.getId(), name: this.name, isCreator: this.isCreator});
  },

  remove: function () {
    var socket = this.socket;
    socket.emit('leave');
  }
}

module.exports = Participant;
