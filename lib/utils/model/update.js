var utils      = require('utils')
  , async      = require('async')
  , Promise    = require('bluebird');

/**
 * Update a model using the provided values, and with where criteria supplied in queryOptions.
 * @see http://cleverstack.io/documentation/backend/models/#updating-or-saving-instances
 * 
 * @function Model.update
 * @param  {Object}       values                    The values that will be used to create a model instance
 * @param  {Object}       queryOptions={}
 * @param  {Object}       queryOptions.where        Criteria to use for the UPDATE statement
 * @param  {Transaction}  queryOptions.transaction  The transaction (if any) to use in the query
 * @return {Promise}
 */
module.exports = function updateModels(values, queryOptions) {
  var utilName   = this.type.toLowerCase() + 'Utils'
    , driverUtil = utils[utilName];

  values         = values || {};
  queryOptions   = utils.model.helpers.findOptions.normalize(queryOptions);

  if (this.debug.enabled) {
    this.debug('update(%s) %s', utils.model.helpers.debugInspect(values), utils.model.helpers.debugInspect(queryOptions));
  }

  return new Promise(function update(resolve, reject) {
    async.waterfall([
      this.callback(utils.model.helpers.isExtendedModel),
      this.callback(utils.model.helpers.where.exists, 'update', values, queryOptions),
      this.callback(utils.model.helpers.normalizeAssociations.aliasAssociationsForOutput, values),
      this.callback(utils.model.helpers.normalizeFields.aliasFieldsForOutput, queryOptions.where),
      this.callback(utils.model.events.beforeEvent, 'beforeUpdate', values, queryOptions),
      this.callback(utils.model.helpers.normalizeAssociations.aliasAssociationsForQuery, queryOptions.where, false),
      this.callback(utils.model.helpers.normalizeFields.aliasFieldsForQuery, queryOptions.where),
      this.callback(utils.model.helpers.normalizeAssociations.aliasAssociationsForQuery, values, false),
      this.callback(utils.model.helpers.normalizeFields.aliasFieldsForQuery, values),
      this.callback(driverUtil.update, values, queryOptions),
      this.callback(utils.model.events.afterEvent, 'afterUpdate', values, queryOptions)
    ],
    this.callback(utils.model.helpers.handleResult.returnModels, resolve, reject));
  }
  .bind(this));
};