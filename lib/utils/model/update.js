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
  var utilName       = this.type.toLowerCase() + 'Utils'
    , helpers        = utils.model.helpers
    , driverUtil     = utils[utilName];

  values         = values || {};
  queryOptions   = utils.model.helpers.findOptions.normalize(queryOptions);

  if (this.debug.enabled) {
    this.debug('update(%s) %s', utils.model.helpers.debugInspect(values), utils.model.helpers.debugInspect(queryOptions));
  }

  return new Promise(function update(resolve, reject) {
    async.waterfall([
      this.callback(helpers.isExtendedModel),
      this.callback(helpers.criteria.exists,             'update', values, queryOptions),
      this.callback(helpers.alias.associations.forOutput,values),
      this.callback(helpers.alias.fields.forOutput,      queryOptions.where),
      this.callback(helpers.events.beforeEvent,          'beforeUpdate', values, queryOptions),
      this.callback(helpers.alias.associations.forQuery, queryOptions.where, false),
      this.callback(helpers.alias.fields.forQuery,       queryOptions.where),
      this.callback(helpers.alias.associations.forQuery, values, false),
      this.callback(helpers.alias.fields.forQuery,       values),
      this.callback(driverUtil.update,                   values, queryOptions),
      this.callback(helpers.events.afterEvent,           'afterUpdate', values, queryOptions)
    ],
    this.callback(helpers.handleResult.returnModels, resolve, reject));
  }
  .bind(this));
};
