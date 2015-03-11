var Exceptions = require('exceptions');

module.exports = function findOptionsAreValid(findOptions, callback) {
  if (!findOptions) {
    callback(new Exceptions.InvalidData('You must specify either an id or an object containing fields to find a %s'));
  } else {
    callback(null);
  }
};