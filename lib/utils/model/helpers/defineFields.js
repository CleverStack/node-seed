var utils = require('utils');

module.exports = function defineModelFields(Klass, Proto, modelName, modelType, debug) {
  debug('Setting up models this.debug() helper...');
  Proto.debug         = Klass.debug = debug;
  Proto.debug.enabled = Klass.debug.enabled = Klass.driver.debug.enabled;

  debug('Setting up options, behaviours and properties...');
  utils.model.helpers.options.setup.apply(this, [Klass, modelName, modelType, this.defaults]);

  debug('Checking for defined getters and setters...');
  utils.model.helpers.gettersAndSetters.apply(this, [Klass, Proto]);

  debug('Defining Fields...');
  Object.keys(Proto).forEach(this.callback(utils.model.helpers.defineField, Proto, Klass));

  debug('Defaultining timeStampable behaviour schema fields...');
  utils.model.behaviours.timeStampable.setup.apply(this, [Klass]);

  debug('Defining softDeleteable behaviour schema fields...');
  utils.model.behaviours.softDeleteable.setup.apply(this, [Klass]);

  debug('Generating native model using driver.parseModelSchema()...');
  Klass.entity = Klass.driver.parseModelSchema(Klass, Proto);
};
