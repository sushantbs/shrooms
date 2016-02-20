var ObjectId = require('mongodb').ObjectID;
var crypto = require('crypto-js');
var Promise = require('es6-promise').Promise;
var _ = require('lodash');

var getHandle = require('./dbHandle').getHandle;
var Participant = require('./participant');

var Room = function (creator, options) {

  if (options._id) {
    this._id = ObjectId(options._id);
    this._created = true;
  }
  else {
    this._id = ObjectId();
    this._created = false;
  }

  if (!creator) {
    console.log('ERROR: Cannot create a room without a creator');
    return null;
  }

  if (creator instanceof Participant) {
    this.creator = creator;
  } else {
    this.creator = new Participant({name: creator});
  }

  this.name = options.name;
  this.rule = options.rule;
  this.context = options.context;

  this.initialize();
}

Room.prototype = {

    constructor: Room,

    getId: function () {
      return this._id.toString();
    },

    getInfo: function () {
      return {
        name: this.name,
        rule: this.rule,
        context: this.context
      }
    },

    getState: function () {

      var participants = [],
        participant = first = this.first;

      console.log('getting state');
      do {
        participants.push(participant.getState());
        participant = participant.next;
      } while (participant && (participant !== first));

      return {
          'info': this.getInfo(),
          'creator': this.creator.getState(),
          'participants': participants,
          '_id': this.getId()
      }
    },

    initialize: function () {

      this.first = this.creator;
      this.last = this.creator;

      this.last.prev = this.first;
      this.last.next = this.first;

      this.first.next = this.last;
      this.first.prev = this.last;

      this.creator.markAsCreator();
    },

    joinRoom: function (participant) {

      var np;

      if (!(participant instanceof Participant)) {
        np = new Participant(participant);
      } else {
        np = participant;
      }

      np.prev = this.last;
      np.next = this.first;

      this.first.prev = np;
      this.last.next = np;

      this.last = np;

      return this;
    },

    pushRoomState: function () {
      this.socketNS.emitState();
    },

    pushPrivateStates: function () {
      var participant = first = this.first;

      do {
        if (participant._id === participantId) {
          participant.pushPrivate();
        };

        participant = participant.next;
      } while (participant && (participant !== first));
    },

    leaveRoom: function (participant) {

      if (typeof participant === 'string') {
        // id has been passed
        participant = this.getParticipant(participant);
      }

      if (!this.isFinished) {

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

      if (participant === this.last) {
        this.last = participant.prev;
      }

      if (participant === this.first) {
        this.first = participant.next;
      }

      _.remove(this.participants, function (p) {
        return (p._id === participant._id);
      });

      return this;
    },

    closeRoom: function (roomId) {
      this.isFinished = true;
      var pr = this.first;

      while(pr) {
        this.leaveRoom(pr);
        pr = pr.next;
      }

      this.dispose();
    },

    setSocketNS: function (socketNS) {
      this.socketNS = socketNS;
      socketNS.initialize();
    },

    bindSocketToParticipant: function (socket, participantId) {

      console.log('binding socket to ' + participantId);
      var participant = this.getParticipant(participantId);

      if (participant) {
        participant.setRoom(this);
        participant.setSocket(socket);
        console.log('socket binding successfull');

        this.pushRoomState();
      } else {
        console.log('ERROR: participant not found');
      }
    },

    setRules: function (ruleSet) {

      var participant = creator = this.creator;

      do {
        participant.setRules(ruleSet);
        participant = participant.next;
      } while (participant && (participant !== creator));

      return this;
    },

    setContext: function (context) {

      var participant = creator = this.creator;

      do {
        participant.setContext(context);
        participant = participant.next;
      } while (participant && (participant !== creator));

      this.context = context;

      return this;
    },

    write: function () {
      var that = this;
      var promise = new Promise(function (resolve, reject) {
        getHandle()
          .then(function (handleObj) {
            // handleObj is an object that is too complicated to document
            // at the time of writing. (it could be the beer)
            // TODO: simplify the handleObj. (or not)
            var state = that.getState();

            delete state._id;
            console.log('state that will be written: ' + JSON.stringify(state, null, 4));

            if (that._created) {
              handleObj.handle.update({_id: that._id}, state, function (err, result) {

                console.log('room updated in db');

                result._id = that._id.toString();

                handleObj.release();

                if (err) {
                  console.log(error);
                  return reject(err);
                }

                return resolve(result);
              });

            } else {

              state._id = that._id;
              console.log(state);
              handleObj.handle.insertOne(state, function (err, result) {

                console.log('room added to db');
                that._created = true;

                handleObj.release();

                if (err) {
                  console.log(error);
                  return reject(err);
                }

                return resolve(result);
              });
            }
          })
          .catch(function (err) {
            return reject(err);
          })

      });

      return promise;
    },

    read: function () {

    },

    getParticipant: function (participantId) {

      var participant = first = this.first;

      do {
        if (participant._id === participantId) {
          return participant;
        };

        participant = participant.next;
      } while (participant && (participant !== first));

      return false;
    },

    hasParticipant: function (participantId) {

      var participant = first = this.first;

      do {
        if (participant._id === participantId) {
          return true;
        };

        participant = participant.next;
      } while (participant && (participant !== first));

      return false;
    },

    dispose: function () {

    }
}

module.exports = Room;
