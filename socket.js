var csession = require('client-sessions');
var sockets = {};

function SocketNamespace (io, roomObj) {

  this.io = io;
  this.roomId = roomObj.getId();
  this.roomObj = roomObj;
}

SocketNamespace.prototype.initialize = function (app) {

  var that = this;

  sockets[this.roomId] = this;

  console.log('Creating socket namespace for ' + this.roomId);
  this.socketNS = this.io.of('/' + this.roomId);

  this.socketNS.on('connection', function (socket) {
    console.log('connected');

    socket.on('init', function (message) {

      console.log('on init');

      var sessionObj = csession.util.decode({
        cookieName: 'roomsession',
        secret: 'N501tgoe$4newL!fe'
      }, message.crypt);


      if (sessionObj && sessionObj.content) {
        var roomId = sessionObj.content.roomId,
          participantId = sessionObj.content.participantId;

        if (roomId === that.roomId) {
          that.roomObj.bindSocketToParticipant(socket, participantId);
        }
      }
    });

    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
  });
}

SocketNamespace.prototype.getSocket = function () {
  return this.socketNS;
}

SocketNamespace.prototype.emitState = function () {
  this.socketNS.emit('roomstate', this.roomObj.getState());
}


function SocketManager (io) {
  this.io = io;
  this.ns = {};
}

SocketManager.prototype.manageRoomSocketNS = function (roomObj) {

  var roomId = roomObj.getId();

  if (roomId) {

    if (!this.ns[roomId]) {
      this.ns[roomId] = new SocketNamespace(this.io, roomObj);
      roomObj.setSocketNS(this.ns[roomId]);
    }

    return this.ns[roomId];
  }
}

module.exports = SocketManager;
