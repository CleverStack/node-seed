var util       = require('util')
  , utils      = require('utils')
  , injector   = require('injector')
  , Exceptions = require('exceptions');

/**
 * The Validator Class, used to validate Instance Fields.
 * @see http://cleverstack.io/documentation/backend/models/#validation
 */
function validator(modelData, callback) {
  if (this.debug.enabled) {
    this.debug(util.format('validateValues(%s)', utils.model.helpers.debugInspect(modelData)));
  }

  injector
    .getInstance('Validator')
    .validate(this, modelData)
    .then(callback)
    .catch(function(err) {
      callback(new Exceptions.ModelValidation(err));
    });
}

module.exports = validator;