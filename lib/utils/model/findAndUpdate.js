'use strict';

// @todo refactor
module.exports = function findAndUpdateModels(findOptions, data, queryOptions) {
  var that = this;

  return new Promise(function(resolve, reject) {
    that
    .find(findOptions, queryOptions)
    .then(function(model) {
      return model.update(data, queryOptions).then(resolve);
    })
    .catch(reject);
  })
};