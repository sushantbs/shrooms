
var Room = require('./src');

module.exports = function (app) {

  schema: function () {

  },

  create: function (req, res, next) {

    var room = new Room();
    next(room);
    
  }
}
