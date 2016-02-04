
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var crypto = require('crypto-js');
var Promise = require('es6-promise').Promise;

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

      //_.extend(this, ruleSet.plays);

      return this;
    },

    setContext: function (context) {

      return this;
    },

    write: function () {

      var promise = new Promise(function (resolve, reject) {

        getDBHandleFromPool()
          .then(function (rooms) {
            rooms.insert(this.getState(), function (err, result) {
              if (err) {
                console.log(error);
                return reject(err);
              }

              resolve(result);
            });
          })
          .catch(function (err) {
            console.log(err);
            return reject(err);
          });
      });

      return promise;
    },

    getParticipantList: function () {

    },

    dispose: function () {

    }
}

module.exports = Room;
