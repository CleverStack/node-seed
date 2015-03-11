var Promise      = require('bluebird');

// @todo refactor
module.exports = function findAndUpdateModels(findOptions, data, queryOptions) {
  return new Promise(function(resolve, reject) {
    this
      .find(findOptions, queryOptions)
      .then(function(model) {
        return model.update(data, queryOptions).then(resolve);
      })
      .catch(reject);
  }
  .bind(this));
};