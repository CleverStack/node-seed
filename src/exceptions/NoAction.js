function NoAction(message) {
  this.message = message;
}

NoAction.prototype = new Error;

module.exports = NoAction;