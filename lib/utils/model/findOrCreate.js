var utils      = require('utils')
  , async      = require('async')
  , Promise    = require('bluebird');

/**
 * Find the first model that matches the provided findOptions.where or create it using findOptions.defaults and return it
 * @see http://cleverstack.io/documentation/backend/models/#finders-findOrCreate
 * 
 * @function Model.find
 * @param  {Object}       findOptions={}
 * @param  {Object}       findOptions.where         Criteria for the query.
 * @param  {Object}       findOptions.defaults      Values to use if the model is not found. (and has to be created).
 * @param  {Array}        findOptions.include       Lazy/Eager Loading including Nested.
 * @param  {Object}       queryOptions={}
 * @param  {Transaction}  queryOptions.transaction  The transaction (if any) to use in the query
 * @return {Promise}
 */
module.exports = function findOrCreateModel(findOptions, queryOptions) {
  var utilName       = this.type.toLowerCase() + 'Utils'
    , helpers        = utils.model.helpers
    , driver         = utils[utilName]
    , events         = helpers.events
    , alias          = helpers.alias
    , softDeleteable = utils.model.behaviours.softDeleteable.beforeCreate;

  findOptions  = helpers.findOptions.normalize(findOptions);
  queryOptions = helpers.queryOptions.normalize(queryOptions);

  if (this.debug.enabled) {
    this.debug('findOrCreate({where: %s, defaults: %s)', helpers.debugInspect(findOptions.where), helpers.debugInspect(findOptions.defaults));
  }

  return new Promise(function find(resolve, reject) {
    async.waterfall([
      this.callback(helpers.isExtendedModel),
      this.callback(events.beforeEvent,   'beforeAllFindersOptions', findOptions, queryOptions),
      this.callback(events.beforeEvent,   'beforeFindOptions',       findOptions, queryOptions),
      this.callback(alias.fields.forQuery,                           findOptions.where),
      this.callback(alias.associations.forQuery,                     findOptions.where, true),
      this.callback(softDeleteable,                                  findOptions, queryOptions),
      this.callback(events.beforeEvent,   'beforeFindOrCreate',      findOptions, queryOptions),
      this.callback(driver.findOrCreate,                             findOptions, queryOptions),
      this.callback(events.afterEvent,    'afterFindOrCreate',       findOptions, queryOptions)
    ],
    this.callback(helpers.handleResult.returnModels, resolve, reject));
  }
  .bind(this));
};
