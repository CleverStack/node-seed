var util  = require('util')
  , utils = require('utils')
  , async = require('async');

function setDefaultValue(data, fieldName, callback) {
  var field           = this.fields[fieldName]
    , value           = data[fieldName]
    , defaultValue    = field['default'];

  if (field.type && value === undefined && defaultValue !== undefined) {
    if (this.debug.enabled) {
      this.debug(util.format('setDefaultValue(%s=%s)', fieldName, utils.model.helpers.debugInspect(defaultValue)));
    }
    data[fieldName] = defaultValue;
  }

  callback(null);
}

module.exports = function setDefaultValues(data, callback) {
  async.each(
    Object.keys(this.fields || this.Class.fields),
    this.callback(setDefaultValue, data),
    callback
   );
};