var csession = require('client-sessions');
var sockets = {};

function Socket (io, roomId) {
  this.io = io;
  this.roomId = roomId;

  this.initialize();
}

Socket.prototype.initialize = function (app) {

  sockets[this.roomId] = this;

  this.socketNS = this.io.of('/' + this.roomId);
  this.socketNS.on('connection', function (socket) {

    socket.on('init', function (message) {
      var sessionObj = csession.util.decode({
        cookieName: 'roomsession',
        secret: 'N501tgoe$4newL!fe'
      }, message.crypt);

      sockets[socket.id] = sessionObj;
      socket.join(sessionObj.roomId);
    });

    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
  });
}

Socket.prototype.getSocket = function () {
  return this.socketNS;
}

Socket.prototype.emitState = function (roomId, state) {
  this.socketNS.emit('state', state);
}


module.exports = function (io, roomId) {

  if (sockets[roomId]) {
    return sockets[roomId];
  }

  if (!(this instanceof Socket)) {
    return new Socket(io, roomId);
  } else {
    return this;
  }
};
