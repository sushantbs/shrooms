
function Participant (name) {

	this.name = name;
	this.id = null;

	this.next = null;
	this.prev = null;
}

Participant.prototype = {

	constructor: Participant

}

module.exports = Participant;