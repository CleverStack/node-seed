var utils        = require('utils')
  , async        = require('async')
  , Promise      = require('bluebird');

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
module.exports   = function findModel(findOptions, queryOptions) {
  var utilName   = this.type.toLowerCase() + 'Utils'
    , driverUtil = utils[utilName];

  findOptions    = utils.model.helpers.findOptions.normalize(findOptions);
  queryOptions   = utils.model.helpers.queryOptions.normalize(queryOptions);

  if (this.debug.enabled) {
    this.debug('find(%s)', utils.model.helpers.debugInspect(findOptions));
  }

  return new Promise(function find(resolve, reject) {
    async.waterfall([
      this.callback(utils.model.helpers.isExtendedModel),
      this.callback(utils.model.helpers.where.requirePrimaryKeys, findOptions),
      this.callback(utils.model.events.beforeEvent, 'beforeAllFindersOptions', findOptions, queryOptions),
      this.callback(utils.model.events.beforeEvent, 'beforeFindOptions', findOptions, queryOptions),
      this.callback(utils.model.helpers.findOptions.isValid, findOptions), // needed anymore?
      this.callback(utils.model.helpers.normalizeFields.aliasFieldsForQuery, findOptions.where),
      this.callback(utils.model.helpers.normalizeAssociations.aliasAssociationsForQuery, findOptions.where, true),
      this.callback(driverUtil.softDeleteable, findOptions, queryOptions),
      this.callback(utils.model.events.beforeEvent, 'beforeFind', findOptions, queryOptions),
      this.callback(driverUtil.find, findOptions, queryOptions),
      this.callback(utils.model.events.afterEvent, 'afterFind', findOptions, queryOptions)
    ],
    this.callback(utils.model.helpers.handleResult.returnModels, resolve, reject));
  }
  .bind(this));
};