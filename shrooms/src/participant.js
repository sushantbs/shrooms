var crypto = require('crypto');
var moment = require('moment');

var getSHA1 = function (str) {

  var crypt = crypto.createHash('sha1');
  crypt.end(str);
  return crypt.read().toString('hex');
}

function Participant (options) {

  if (!options.name && typeof options.name !== 'string') {
    console.error('Participant name has to be a non-empty string');
    return null;
  }

  this.name = options.name;
  this.createdOn = moment(new Date());
  this._id = getSHA1(this.createOn.unix().toString() + this.name);
}

Participant.prototype = {

  constructor: Participant,

  getName: function () {
    return this.name;
  }
}

module.exports = Participant;
