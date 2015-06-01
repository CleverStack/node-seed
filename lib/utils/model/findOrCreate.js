var utils      = require('utils')
  , async      = require('async')
  , Promise    = require('bluebird')
  , underscore = require('underscore');

/**
 * Find and return the first model that matches the provided findOptions, or create one if there is no matches.
 * @see http://cleverstack.io/documentation/backend/models/#finders-findOrCreate
 *
 * @function Model.findOrCreate
 * @param  {Object}       findOptions={}
 * @param  {Object}       findOptions.where         Criteria for the query
 * @param  {Number}       findOptions.limit         Result Limiting (Paging)
 * @param  {Number}       findOptions.offset        Result Offset (Paging)
 * @param  {Array}        findOptions.include       Lazy/Eager Loading including Nested
 * @param  {Object}       queryOptions={}
 * @param  {Object}       queryOptions.defaults={}  Default values to be merged with the where condition values on creation
 * @param  {Transaction}  queryOptions.transaction  The transaction (if any) to use in the query
 * @return {Promise}
 */
module.exports = function findOrCreateModel(findOptions, queryOptions) {
  var utilName       = this.type.toLowerCase() + 'Utils'
    , helpers        = utils.model.helpers
    , cxtTransaction = false;

  findOptions        = helpers.findOptions.normalize(findOptions);
  queryOptions       = helpers.queryOptions.normalize(queryOptions);

  if (this.debug.enabled) {
    this.debug('findOrCreate({where: %s, defaults: %s)', helpers.debugInspect(findOptions.where), helpers.debugInspect(findOptions.defaults));
  }

  if (!queryOptions.transaction) {
    cxtTransaction   = true;
  }

  return new Promise(function findOrCreate(resolve, reject) {
    this
      .transaction(queryOptions)
      .then(this.callback('find', findOptions))
      .then(this.callback(function createIfNotFound(instance) {
        if ( instance === null ) {
          this
            .create(underscore.extend({}, findOptions.where, queryOptions.defaults), queryOptions)
            .then(function handleTransaction(instance) {
              if (!!cxtTransaction) {
                queryOptions.transaction.commit().then(function() {
                  resolve(instance);
                })
                .catch(reject);
              } else {
                resolve(instance);
              }
            })
            .catch(reject);
        } else {
          resolve(instance);
        }
      }))
      .catch(reject);
  }
  .bind(this));
};
