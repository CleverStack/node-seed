var util        = require('util')
  , utils       = require('utils')
  , underscore  = require('underscore')
  , debug       = require('debug')('cleverstack:utils:model');

module.exports = function emitBeforeEvent(eventName, modelDataOrFindOptions, queryOptions, callback) {
  var listeners   = this.listeners(eventName).length
    , callbacks   = 0
    , errors      = [];

  if (listeners < 1) {
    return callback(null);
  }

  if (debug.enabled) {
    debug(util.format('Running hook, emitting %s %s(%s) on %s listeners...', this.modelName, eventName, utils.model.helpers.debugInspect(modelDataOrFindOptions), listeners));
  }

  this.emit(eventName, modelDataOrFindOptions, queryOptions, function(err, updatedModelDataOrFindOptions) {
    if (err) {
      errors.push(err);
    } else if (updatedModelDataOrFindOptions !== undefined) {
      underscore.extend(modelDataOrFindOptions, updatedModelDataOrFindOptions);
    }

    if (++callbacks === listeners) {
      callback(errors.length ? errors.shift() : null);
    }
  });
};