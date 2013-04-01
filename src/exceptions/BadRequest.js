function BadRequest(message) {
	this.message = message;
}

BadRequest.prototype = new Error;

module.exports = BadRequest;