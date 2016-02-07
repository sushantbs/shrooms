var ObjectId = require('mongodb').ObjectID;
var crypto = require('crypto-js');
var Promise = require('es6-promise').Promise;
var getHandle = require('./dbHandle').getHandle;

var Participant = require('./participant');

var Room = function (creator, options) {

  if (!creator) {
    console.error('Cannot create a room without a creator');
    return null;
  }

  if (creator instanceof Participant) {
    this.creator = creator;
  } else {
    this.creator = new Participant({name: creator});
  }

  this.size = 1;
  this.isFinished = false;
  this.options = {};

  this._id = (options && ObjectId(options._id)) || ObjectId();

  this.initialize();
}

Room.prototype = {

    constructor: Room,

    getState: function () {

      var participants = [],
        context = this.context,
        participant = creator = this.creator;

      do {
        participants.push(participant.getState());
        participant = participant.next;
      } while (participant && (participant !== creator));

      return {
          'creator': this.creator.getState(),
          'participants': participants,
          'context': context,
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

      var np = new Participant(participant);

      np.prev = this.last;
      np.next = null
      this.last.next = np;

      this.last = np;

      this.size += 1;

      connectToDB()
        .then(function (dbhandle) {
          dbhandle.collection('rooms').updateOne({_id: objectId}, {
            $addToSet: {participants: {name: postBody.name, isCreator: false, worth: postBody.buyIn}}
          }, function (err, update) {

            if (err) {
              console.log(err);
              res.status(500).end('Error updating the Room');
              return;
            }

            if (!update.result.n) {
              console.log('No result');
              res.status(500).end('Room not found');
              return;
            }

            dbhandle.collection('rooms').findOne({_id: objectId}, function (err, fetch) {

              if (err) {
                console.log(err);
                res.status(500).send(err);
                return;
              }

              dbhandle.close();
              res.send({status: 'success', data: fetch});
            });
          });
        })
    		.catch(function (err) {
    			console.log(err);
    			res.status(500).send(err);
    		});
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
            handleObj.handle.insertOne(that.getState(), function (err, result) {

              result.id = ObjectId(that._id);
              console.log(JSON.stringify(result));

              handleObj.release();

              if (err) {
                console.log(error);
                return reject(err);
              }

              return resolve(result);
            });
          })
          .catch(function (err) {

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
