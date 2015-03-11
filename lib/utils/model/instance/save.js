var utils      = require('utils')
  , async      = require('async')
  , underscore = require('underscore')
  , Promise    = require('bluebird');

/**
 * Update the current model using the provided values (optional, defaults to this.changed())
 * @see http://cleverstack.io/documentation/backend/models/#updating-or-saving-instances
 * 
 * @param  {Object}       values=this.changed()     The values that will be used to create a model instance
 * @param  {Object}       queryOptions={}
 * @param  {Transaction}  queryOptions.transaction  The transaction (if any) to use in the query
 * @return {Promise}
 */
module.exports = function saveModelInstance(values, queryOptions) {
  var utilName   = this.Class.type.toLowerCase() + 'Utils'
    , helpers    = utils.model.helpers
    , driverUtil = utils[utilName]
    , omitFields;

  queryOptions  = queryOptions || {};

  return new Promise(function(resolve, reject) {
    if (typeof values === 'object') {
      omitFields = [];//.concat(this.primaryKey);
      if (!!this.Class.timeStampable) {
        omitFields.push('createdAt');
        omitFields.push('updatedAt');
      }
      if (!!this.Class.softDeleteable) {
        omitFields.push('deletedAt');
      }

      Object.keys( values ).forEach(this.callback(function( i ) {
        if (omitFields.indexOf(i) === -1 && typeof this.Class.setters[i] === 'function') {
          this.Class.setters[i].apply(this, [values[i]]);
        }
      }));
    }

    values = underscore.pick(this.values, this.changed);
    if (this.debug.enabled) {
      this.debug('save(%s)', helpers.debugInspect(values));
    }
    if (Object.keys(values).length === 0 && !queryOptions.force) {
      return resolve(this);
    }

    async.waterfall([
      // @todo fix validator
      // this.Class.callback(modelUtils.validateValues, this.Class.validator, this),
      this.Class.callback(helpers.events.beforeEvent, 'beforeSave', values, queryOptions),
      this.callback(driverUtil.save,                  values, queryOptions),
      this.Class.callback(helpers.events.afterEvent,  'afterSave', values, queryOptions)
    ],
    this.callback(helpers.handleResult.updateReferencedModel, resolve, reject));
  }
  .bind(this));
};