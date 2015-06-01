var utils      = require('utils')
  , Promise    = require('bluebird');

/**
 * Helper that can be used to ensure that there is a transaction
 * 
 * @param  {String|Boolean|Null} modelName  optional strict name for the model
 * @return {String}                         the final modelName
 */
module.exports = function transactionHelper(queryOptions) {
  queryOptions = queryOptions || {};

  return new Promise(function transaction(resolve, reject) {
    if (queryOptions.transaction) {
      resolve(queryOptions);
    } else {
      this
      .connection
      .transaction({ autocommit: false })
      .then(function(transaction) {
        if (transaction) {
          queryOptions.transaction = transaction;
          resolve(queryOptions);
        } else {
          reject(transaction);
        }
      })
      .catch(reject);
    }
  }
  .bind(this));
};
