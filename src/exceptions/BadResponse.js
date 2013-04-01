function BadResponse(message) {
	this.message = message;
}

BadResponse.prototype = new Error;

module.exports = BadResponse;