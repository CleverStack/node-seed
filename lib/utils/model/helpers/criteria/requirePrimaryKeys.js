var Exceptions = require('exceptions');

module.exports = function requirePrimaryKeys(findOptions, callback) {
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