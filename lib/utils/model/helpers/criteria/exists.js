var Exceptions = require('exceptions');

module.exports = function exists(type, values, queryOptions, callback) {
  var valid = false;

  if (type === 'update') {
    valid = typeof queryOptions === 'object' && queryOptions.where && Object.keys(queryOptions.where).length >= 1;
  } else if (type === 'destroy') {
    valid = typeof queryOptions === 'object' && queryOptions.where && queryOptions.where.id;
  }

  callback(!!valid ? null : new Exceptions.InvalidData('Unable to ' + type + ' without find criteria.'));
};