var util        = require('util')
  , utils       = require('utils')
  , async       = require('async')
  , Exceptions  = require('exceptions');

/**
 * Ensures that for the given data, it will result in a new model instance upon Model.create() . (aka no primaryKeys set!)
 * 
 * @param  {Object}   data     the data that will be used to create a model
 * @param  {Function} callback
 * @return {undefined}
 */
module.exports = function isNewModel(data, callback) {
  if (this.debug.enabled) {
    this.debug(util.format('isNewModel(%s)', utils.model.helpers.debugInspect(data)));
  }

  async.each(
    this.primaryKeys || this.Class.primaryKeys || [],
    this.callback(function checkPrimaryKeys(key, checkDone) {
      if (this.fields[key] && !!this.fields[key].autoIncrement) {
        checkDone(!data[key] ? null : key);
      } else {
        checkDone(null);
      }
    }),
    this.callback(function(key) {
      callback(!key ? null : new Exceptions.InvalidData(util.format('Invalid data provided to %s.create(%s)', (this.modelName || this.Class.modelName), key)));
    })
  );
};