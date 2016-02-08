var csession = require('client-sessions');
var sockets = {};

function Socket (io, roomObj) {
  this.io = io;
  this.roomId = roomObj.getId();
  this.roomObj = roomObj;

  this.initialize();
}

Socket.prototype.initialize = function (app) {

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

      sockets[socket.id] = sessionObj;
      socket.emit('roomstate', that.roomObj.getState());
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
