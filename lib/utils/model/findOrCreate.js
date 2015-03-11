var Promise      = require('bluebird');

// @todo refactor
module.exports = function findOrCreateModel(findOptions, data, queryOptions) {
  return new Promise(function findOrCreate(resolve, reject) {
    this
    .find(findOptions, queryOptions)
    .then(this.callback(function(model) {
      if (model === null) {
        this
          .create(data, queryOptions)
          .then(resolve)
          .catch(reject);
      } else {
        resolve(model);
      }
    }))
    .catch(function(err) {
      reject(err instanceof Error ? err : new Error(err));
    });
  }
  .bind(this));
};