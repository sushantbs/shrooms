var Promise = require('es6-promise').Promise;
var ObjectId = require('mongodb').ObjectID;
var _ = require('lodash');

var SocketManager = require('./socket');
var Participant = require('./participant');
var Room = require('./room');

var dbHandle = require('./dbHandle');

function RoomManager (io) {

  this.rooms = {};
  this.socketMgr = new SocketManager(io)
  dbHandle.connect();
}

RoomManager.prototype = {

  constructor: RoomManager,

  fetchRoom: function (roomId) {

    var rooms = this.rooms,
      socketMgr = this.socketMgr;

    var p = new Promise(function (resolve, reject) {

      if (rooms[roomId]) {

        console.log('RoomManager#fetchRoom: room found in cache');

        setTimeout(function () {
          resolve(rooms[roomId]);
        }, 10);
      } else {

        console.log('RoomManager#fetchRoom: reading room from db');

        dbHandle
          .getHandle()
          .then(function (handleObj) {
            var findQuery = {'_id': ObjectId(roomId)}
            var cursor = handleObj.handle.find(findQuery, {'activityLog': {$slice: -100}});

            console.log('RoomManager#fetchRoom: read from db complete');

            cursor.each(function (err, result) {
              if (result) {
                var creator = new Participant({name: result.creator.name, _id: result.creator._id});
                roomObj = new Room(creator, {name: result.info.name, rule: result.info.rule, context: result.info.context, _id: result._id.toString()});

                _.forEach(result.participants, function (participant) {
                  if (participant._id !== result.creator._id) {
                    roomObj.joinRoom(participant);
                  }
                });

                socketMgr.manageRoomSocketNS(roomObj);
                rooms[roomId] = roomObj;

                roomObj.activityLog = result.activityLog;

                resolve(roomObj);

              } else {
                console.log('ERROR: RoomManager#fetchRoom: room not found in db');
                reject('Room not found in DB');
              }
            });
          })
          .catch(function (err) {
            console.log('ERROR: RoomManager#fetchRoom: error reading from db: ' + JSON.stringify(err));
            reject(err);
          });
      }
    });

    return p;
  },

  createRoom: function (postBody) {

    var rule = postBody.rule,
      context = postBody.context,
      name = postBody.name,
      creator = postBody.creator,
      roomCreator = new Participant({name: creator}),
      roomObj = new Room(roomCreator, {name: name, rule: rule, context: context});

    var p = new Promise(function (resolve, reject) {
      roomObj
        .setRules(rule)
        .setContext(context)
        .write()
        .then(function (result) {
          resolve(roomObj);
        })
        .catch(function (err) {
          reject(err);
        })
    });

    return p;
  }
}

module.exports = RoomManager;
