'use strict';

// @todo refactor
module.exports = function findOrCreateModel(findOptions, data, queryOptions) {
  var that = this;

  return new Promise(function findOrCreate(resolve, reject) {
    this
    .find(findOptions, queryOptions)
    .then(function(model) {
      if (model === null) {
        that.create(data, queryOptions)
          .then(resolve)
          .catch(reject);
      } else {
        resolve(model);
      }
    }.bind(this))
    .catch(function(err) {
      reject(err instanceof Error ? err : new Error(err));
    });
  }
  .bind(this));
}