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
  var utilName      = this.type.toLowerCase() + 'Utils'
    , helpers       = utils.model.helpers
    , driverUtil    = utils[utilName]
    , timeStampable = utils.model.behaviours.timeStampable.beforeCreate;
  
  queryOptions      = utils.model.helpers.queryOptions.normalize(queryOptions);

  if (this.debug.enabled) {
    this.debug('create(%s)', utils.model.helpers.debugInspect(values));
  }

  return new Promise(function create(resolve, reject) {
    async.waterfall([
      this.callback(helpers.isExtendedModel),
      this.callback(helpers.isNewModel,                  values),
      this.callback(helpers.defaultValues,               values),
      this.callback(helpers.alias.fields.forOutput,      values),
      this.callback(helpers.validator,                   values),
      this.callback(timeStampable,                       values),
      this.callback(helpers.events.beforeEvent,          'beforeCreate', values, queryOptions),
      this.callback(helpers.alias.associations.forQuery, values, false),
      this.callback(helpers.alias.fields.forQuery,       values),
      this.callback(driverUtil.create,                   values, queryOptions),
      this.callback(helpers.events.afterEvent,           'afterCreate', values, queryOptions)
    ],
    this.callback(helpers.handleResult.returnModels, resolve, reject));
  }
  .bind(this));
};