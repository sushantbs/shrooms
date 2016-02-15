var crypto = require('crypto');
var moment = require('moment');
var _ = require('lodash');

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
  this.isCreator = false;
  this.socket = null;
  this._id = options._id || getSHA1(this.createdOn.unix().toString() + this.name);
}

Participant.prototype = {

  constructor: Participant,

  markAsCreator: function () {
    this.isCreator = true;
  },

  getState: function () {
    return _.extend({name: this.name, _id: this._id}, this.context);
  },

  setContext: function (context) {

    this.context = context;

    return this;
  },

  setRules: function (ruleSet) {

    return this;
  },

  setSocket: function (socket) {
    this.socket = socket;
    this.pushPrivate();
  },

  pushPrivate: function () {
    console.log('emiting prvate state for ' + this._id);
    this.socket.emit('mystate', {me: this._id, amcreator: this.isCreator});
  }
}

module.exports = Participant;
