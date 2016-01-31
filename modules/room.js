var Participant = require('./participant');

function Room (type, creator) {

	if (!type) {
		console.error('Cannot create room without type');
		return null;
	}

	if (!creator || !(creator instanceof Participant)) {
		console.error('Cannot create room without a valid creator');
		return null;
	}

	this.type = type;
	this.creator = creator;

	this.first = creator;
	this.last = creator;
}

Room.prototype = {

	constructor: Room,

	initialize: function () {

	},

	setRoomType: function () {

	},

	addParticipant: function (participant) {

		this.last.next = participant;
		participant.prev = this.last;
		participant.next = this.first;

		this.last = participant;
	},

	removeParticipant: function (participant) {

		var lookup = this.first;

		while (lookup !== participant) {

			if (lookup === this.last) {
				console.error('Could find the participant to remove');
				return null;
			}

			lookup = lookup.next;
		}

		lookup.next.prev = lookup.prev;
		lookup.prev.next = lookup.next;

		if (this.first === lookup) {
			this.first = lookup.next;
		}

		if (this.last === lookup) {
			this.last = lookup.prev;
		}

		return lookup;
	},

	getRoomState: function () {

	},

	destroy: function () {

	}
}

module.exports = Room;

