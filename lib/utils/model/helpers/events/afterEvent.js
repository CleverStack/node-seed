var util        = require('util')
  , utils       = require('utils')
  , underscore  = require('underscore')
  , debug       = require('debug')('cleverstack:utils:model');

module.exports  = function emitAfterEvent(eventName, modelDataOrFindOptions, queryOptions, model, callback) {
  var listeners = this.listeners(eventName).length
    , callbacks = 0
    , errors    = [];

  if (!callback) {
    callback    = model;
    model       = null;
  }

  utils.model.helpers.alias.fields.forOutput.apply(this, [modelDataOrFindOptions]);
  if (listeners < 1) {
    return callback(null, model);
  }

  if (debug.enabled) {
    debug(util.format('Running hook, emitting %s(%s) on %s listeners...', eventName, utils.model.helpers.debugInspect(modelDataOrFindOptions), listeners));
  }

  this.emit(eventName, model, modelDataOrFindOptions, queryOptions, function(err, updatedModelDataOrFindOptions) {
    if (err) {
      errors.push(err);
    } else if (updatedModelDataOrFindOptions !== undefined) {
      underscore.extend(modelDataOrFindOptions, updatedModelDataOrFindOptions);
    }

    if (++callbacks === listeners) {
      callback(errors.length ? errors.shift() : null, model);
    }
  });
};