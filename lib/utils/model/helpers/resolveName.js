var utils = require('utils');

/**
 * If no modelName is provided, or its not truthy, work out the modelName
 * based on the filename where extend was called.
 * Additionally, get rid of any superfluous 'Model' at the end of the modelName.
 * 
 * @param  {String|Boolean|Null} modelName  optional strict name for the model
 * @return {String}                         the final modelName
 */
module.exports = function resolveModelName(modelName) {
  if (modelName === false && (modelName = utils.helpers.getClassName(5)) === false) {
    throw new Error('Unable to determine the models name based on filename.');
  } else {
    modelName = modelName.replace('Model', '');
  }
  return modelName;
};
