var utils      = require('utils')
  , async      = require('async')
  , Promise    = require('bluebird');

/**
 * Destroy a model using the provided queryOptions's where criteria.
 * @see http://cleverstack.io/documentation/backend/models/#destroying-instances
 * 
 * @param  {Object}       queryOptions={}
 * @param  {Object}       queryOptions.where        Criteria to use for the UPDATE statement
 * @param  {Transaction}  queryOptions.transaction  The transaction (if any) to use in the query
 * @return {Promise}
 */
module.exports = function destroyModels(queryOptions) {
  var utilName       = this.type.toLowerCase() + 'Utils'
    , helpers        = utils.model.helpers
    , driverUtil     = utils[utilName];

  queryOptions   = utils.model.helpers.queryOptions.normalize(queryOptions);

  if (this.debug.enabled) {
    this.debug('destroy where %s', utils.model.helpers.debugInspect(queryOptions ? queryOptions.where : queryOptions));
  }

  return new Promise(function destroy(resolve, reject) {
    async.waterfall([
      this.callback(helpers.isExtendedModel),
      this.callback(helpers.criteria.exists,             'destroy', queryOptions.where, queryOptions),
      this.callback(helpers.events.beforeEvent,          'beforeDestroy', queryOptions.where, queryOptions),
      this.callback(helpers.alias.associations.forQuery, queryOptions.where, true),
      this.callback(helpers.alias.fields.forQuery,       queryOptions.where),
      this.callback(driverUtil.destroy,                  queryOptions),
      this.callback(helpers.events.afterEvent,           'afterDestroy', queryOptions)
    ],
    this.callback(helpers.handleResult.removeReferencedModel, resolve, reject));
  }
  .bind(this));
};
