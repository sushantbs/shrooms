var ObjectId = require('mongodb').ObjectID;
var crypto = require('crypto-js');
var Promise = require('es6-promise').Promise;
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
    console.error('Cannot create a room without a creator');
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
        participant = creator = this.creator;

      do {
        participants.push(participant.getState());
        participant = participant.next;
      } while (participant && (participant !== creator));

      return {
          'info': this.getInfo(),
          'creator': this.creator.getState(),
          'participants': participants,
          '_id': this._id
      }
    },

    initialize: function () {

      this.first = this.creator;
      this.last = this.creator;

      this.last.prev = this.first;
      this.first.next = this.prev;
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

            if (that._created) {
              handleObj.handle.update({_id: state._id}, state, function (err, result) {

                console.log('object updated in DB: ' + JSON.stringify(result, null, 4));
                result._id = state._id.toString();

                handleObj.release();

                if (err) {
                  console.log(error);
                  return reject(err);
                }

                return resolve(result);
              });

            } else {

              handleObj.handle.insertOne(state, function (err, result) {

                console.log('object added to DB: ' + JSON.stringify(result, null, 4));
                result._id = state._id.toString();
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

    hasParticipant: function (participantId) {

      var participant = creator = this.creator;

      do {
        if (participant._id === participantId) {
          return true;
        };

        participant = participant.next;
      } while (participant && (participant !== creator));

      return false;
    },

    dispose: function () {

    }
}

module.exports = Room;
