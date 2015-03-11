var Exceptions = require('exceptions');

module.exports.exists = function(type, values, queryOptions, callback) {
  var valid = false;

  if (type === 'update') {
    valid = typeof queryOptions === 'object' && queryOptions.where && Object.keys(queryOptions.where).length >= 1;
  } else if (type === 'destroy') {
    valid = typeof queryOptions === 'object' && queryOptions.where && queryOptions.where.id;
  }

  callback(!!valid ? null : new Exceptions.InvalidData('Unable to ' + type + ' without find criteria.'));
};

module.exports.requirePrimaryKeys = function(findOptions, callback) {
  if (/^[0-9a-fA-F]{24}$/.test(findOptions) || !isNaN(findOptions)) {
    if (this.primaryKeys.length === 1) {
      var findOptionsOverride = { where: {} };
      findOptionsOverride.where[this.primaryKey] = findOptions;
      findOptions = findOptionsOverride;
      callback(null);
    } else {
      callback(new Exceptions.InvalidData('You must provide an object when using Model.find() when there are multiple primaryKeys'));
    }
  } else {
    callback(null);
  }
};