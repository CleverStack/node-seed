var utils      = require('utils')
  , inflect    = require('i')()
  , injector   = require('injector');

module.exports = function linkDriver(moduleLdr, Klass, modelType, moduleName, modelName, debuggr) {
  debuggr(modelName + 'Model: Defining model, checking to see if the driver (' + modelType + ') is installed and enabled...');
  if (moduleLdr.moduleIsEnabled(moduleName) !== true) {
    throw new Error(['To use type', modelType, 'on your', modelName, 'model you need to enable the', moduleName, 'module!'].join(' '));
  } else {
    utils.helpers.defineProperty(Klass, 'driver', { value: injector.getInstance(inflect.camelize(moduleName.replace(/-/g, '_'), false)) });
  }
};