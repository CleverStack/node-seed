var utils      = require('utils')
  , async      = require('async')
  , Promise    = require('bluebird');

/**
 * Find and return the first model that matches the provided findOptions.
 * @see http://cleverstack.io/documentation/backend/models/#finders-find
 * 
 * @function Model.find
 * @param  {Object}       findOptions={}
 * @param  {Object}       findOptions.where         Criteria for the query
 * @param  {Number}       findOptions.limit         Result Limiting (Paging)
 * @param  {Number}       findOptions.offset        Result Offset (Paging)
 * @param  {Array}        findOptions.include       Lazy/Eager Loading including Nested
 * @param  {Object}       queryOptions={}
 * @param  {Transaction}  queryOptions.transaction  The transaction (if any) to use in the query
 * @return {Promise}
 */
module.exports = function findModel(findOptions, queryOptions) {
  var utilName       = this.type.toLowerCase() + 'Utils'
    , helpers        = utils.model.helpers
    , driverUtil     = utils[utilName]
    , softDeleteable = utils.model.behaviours.softDeleteable.criteria;

  findOptions        = helpers.findOptions.normalize(findOptions);
  queryOptions       = helpers.queryOptions.normalize(queryOptions);

  if (this.debug.enabled) {
    this.debug('find(%s)', helpers.debugInspect(findOptions));
  }

  return new Promise(function find(resolve, reject) {
    async.waterfall([
      this.callback(helpers.isExtendedModel),
      this.callback(helpers.criteria.requirePrimaryKeys, findOptions),
      this.callback(helpers.events.beforeEvent,          'beforeAllFindersOptions', findOptions, queryOptions),
      this.callback(helpers.events.beforeEvent,          'beforeFindOptions', findOptions, queryOptions),
      this.callback(helpers.findOptions.valid,           findOptions), // @todo needed anymore?
      this.callback(helpers.alias.fields.forQuery,       findOptions.where),
      this.callback(helpers.alias.associations.forQuery, findOptions.where, true),
      this.callback(softDeleteable,                      findOptions, queryOptions),
      this.callback(helpers.events.beforeEvent,          'beforeFind', findOptions, queryOptions),
      this.callback(driverUtil.find,                     findOptions, queryOptions),
      this.callback(helpers.events.afterEvent,           'afterFind', findOptions, queryOptions)
    ],
    this.callback(helpers.handleResult.returnModels, resolve, reject));
  }
  .bind(this));
};
