var utils      = require('utils')
  , async      = require('async')
  , Promise    = require('bluebird');

/**
 * Find and return all models that match the provided findOptions.
 * @see http://cleverstack.io/documentation/backend/models/#finders-findAll
 * 
 * @function Model.findAll
 * @param  {Object}       findOptions={}
 * @param  {Object}       findOptions.where         Criteria for the query
 * @param  {Number}       findOptions.limit         Result Limiting (Paging)
 * @param  {Number}       findOptions.offset        Result Offset (Paging)
 * @param  {Array}        findOptions.include       Lazy/Eager Loading including Nested
 * @param  {Object}       queryOptions={}
 * @param  {Transaction}  queryOptions.transaction  The transaction (if any) to use in the query
 * @return {Promise}
 */
module.exports = function findModels(findOptions, queryOptions) {
  var utilName       = this.type.toLowerCase() + 'Utils'
    , helpers        = utils.model.helpers
    , driverUtil     = utils[utilName]
    , softDeleteable = utils.model.behaviours.softDeleteable.criteria;

  findOptions        = helpers.findOptions.normalize(findOptions);
  queryOptions       = helpers.queryOptions.normalize(queryOptions);

  if (this.debug.enabled) {
    this.debug('findAll(%s)', helpers.debugInspect(findOptions));
  }

  return new Promise(function findAll(resolve, reject) {
    async.waterfall([
      this.callback(helpers.isExtendedModel),
      this.callback(helpers.events.beforeEvent,          'beforeAllFindersOptions', findOptions, queryOptions),
      this.callback(helpers.events.beforeEvent,          'beforeFindAllOptions', findOptions, queryOptions),
      this.callback(helpers.alias.fields.forQuery,       findOptions.where),
      this.callback(helpers.alias.associations.forQuery, findOptions.where, true),
      this.callback(softDeleteable,                      findOptions, queryOptions),
      this.callback(helpers.events.beforeEvent,          'beforeFindAll', findOptions, queryOptions),
      this.callback(driverUtil.findAll,                  findOptions, queryOptions),
      this.callback(helpers.events.afterEvent,           'afterFindAll', findOptions, queryOptions)
    ],
    this.callback(helpers.handleResult.returnModels, resolve, reject));
  }
  .bind(this));
};
