var util        = require('util')
  , Exceptions  = require('exceptions');

// @todo refactor
module.exports.isValid = function(findOptions, callback) {
  if (!findOptions) {
    callback(new Exceptions.InvalidData(util.format('You must specify either an id or an object containing fields to find a %s', this.modelName)));
  } else {
    callback(null);
  }
};

// @todo refactor
module.exports.normalize = function(findOptions) {
  findOptions   = findOptions || { where: {} };

  if (!findOptions.where) {
    findOptions = {where: findOptions};
  }
  return findOptions;
};