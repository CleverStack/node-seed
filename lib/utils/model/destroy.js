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
  var utilName   = this.type.toLowerCase() + 'Utils'
    , driverUtil = utils[utilName];

  queryOptions   = utils.model.helpers.queryOptions.normalize(queryOptions);

  if (this.debug.enabled) {
    this.debug('destroy where %s', utils.model.helpers.debugInspect(queryOptions ? queryOptions.where : queryOptions));
  }

  return new Promise(function destroy(resolve, reject) {
    async.waterfall([
      this.callback(utils.model.helpers.isExtendedModel),
      this.callback(utils.model.helpers.where.exists, 'destroy', queryOptions.where, queryOptions),
      this.callback(utils.model.events.beforeEvent, 'beforeDestroy', queryOptions.where, queryOptions),
      this.callback(utils.model.helpers.normalizeAssociations.aliasAssociationsForQuery, queryOptions.where, true),
      this.callback(utils.model.helpers.normalizeFields.aliasFieldsForQuery, queryOptions.where),
      this.callback(driverUtil.destroy, queryOptions),
      this.callback(utils.model.events.afterEvent, 'afterDestroy', queryOptions)
    ],
    this.callback(utils.model.helpers.handleResult.removeReferencedModel, resolve, reject));
  }
  .bind(this));
};