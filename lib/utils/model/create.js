var utils      = require('utils')
  , async      = require('async')
  , Promise    = require('bluebird');

/**
 * Create a new model using the values provided and persist/save it to the database.
 * @see http://cleverstack.io/documentation/backend/models/#creating-instances
 * 
 * @function Model.create
 * @param  {Object}       values                    The values that will be used to create a model instance
 * @param  {Object}       queryOptions={}
 * @param  {Transaction}  queryOptions.transaction  The transaction (if any) to use in the query
 * @return {Promise}
 */
module.exports = function createModel(values, queryOptions) {
  var utilName   = this.type.toLowerCase() + 'Utils'
    , driverUtil = utils[utilName];
  
  queryOptions   = utils.model.helpers.queryOptions.normalize(queryOptions);

  if (this.debug.enabled) {
    this.debug('create(%s)', utils.model.helpers.debugInspect(values));
  }

  return new Promise(function create(resolve, reject) {
    async.waterfall([
      this.callback(utils.model.helpers.isExtendedModel),
      this.callback(utils.model.helpers.isNewModel, values),
      this.callback(utils.model.helpers.defaultValues, values),
      this.callback(utils.model.helpers.normalizeFields.aliasFieldsForOutput, values),
      this.callback(utils.model.helpers.validator, values),
      this.callback(utils.model.behaviours.timeStampable.beforeCreate, values),
      this.callback(utils.model.events.beforeEvent, 'beforeCreate', values, queryOptions),
      this.callback(utils.model.helpers.normalizeAssociations.aliasAssociationsForQuery, values, false),
      this.callback(utils.model.helpers.normalizeFields.aliasFieldsForQuery, values),
      this.callback(driverUtil.create, values, queryOptions),
      this.callback(utils.model.events.afterEvent, 'afterCreate', values, queryOptions)
    ],
    this.callback(utils.model.helpers.handleResult.returnModels, resolve, reject));
  }
  .bind(this));
};