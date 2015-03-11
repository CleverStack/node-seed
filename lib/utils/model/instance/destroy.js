var utils      = require('utils')
  , async      = require('async')
  , Promise    = require('bluebird');

/**
 * Destroy the current instance
 * @see http://cleverstack.io/documentation/backend/models/#destroying-instances
 *
 * @param  {Object}       queryOptions={}
 * @param  {Transaction}  queryOptions.transaction  The transaction (if any) to use in the query
 * @return {Promise}
 */
module.exports = function destroyModelInstance(queryOptions) {
  var utilName   = this.Class.type.toLowerCase() + 'Utils'
    , helpers    = utils.model.helpers
    , driverUtil = utils[utilName];

  queryOptions   = utils.model.helpers.findOptions.normalize(queryOptions);

  if (this.debug.enabled) {
    this.debug('destroy(queryOptions)');
  }

  return new Promise(function(resolve, reject) {
    async.waterfall([
      this.Class.callback(helpers.events.beforeEvent, 'beforeDestroy', this, queryOptions),
      this.callback(driverUtil.destroyInstance,       queryOptions),
      this.Class.callback(helpers.events.afterEvent,  'afterDestroy', this, queryOptions)
    ],
    this.callback(helpers.handleResult.removeReferencedModel, resolve, reject));
  }
  .bind(this));
};