var utils      = require('utils')
  , injector   = require('injector')
  , moduleLdr  = injector.getInstance('moduleLoader')
  , defineProp = utils.helpers.defineProperty
  , debuggr    = require('debug')('cleverstack:models');

/**
 * Creates a new Model that extends from this one
 * @see http://cleverstack.io/documentation/backend/models/#definition
 * 
 * @todo refactor this out, and allow extend to be called on existing models, to put partial schema's in different databases
 * 
 * @override
 * @param  {String}   tableName     optionally define the name of the table/collection
 * @param  {Object}   Static={}     Class Static
 * @param  {Object}   Proto         Class Prototype
 * @return {Model}
 */
module.exports = function extendModel() {
  var extendingArgs = [].slice.call(arguments)
    , modelName     = utils.model.helpers.resolveName((typeof extendingArgs[0] === 'string') ? extendingArgs.shift() : false)
    , Klass         = (extendingArgs.length === 2) ? extendingArgs.shift() : {}
    , Proto         = extendingArgs.shift()
    , modelType     = (Klass.type !== undefined ? Klass.type : this.defaults.type).toUpperCase()
    , moduleName    = 'clever-' + modelType.toLowerCase()
    , model         = null
    , debug         = null;

  // Return the cached (already built) model if we have it
  if (this.models[modelName] !== undefined) {
    debuggr(modelName + 'Model: Returning model class from the cache...');
    return this.models[modelName];
  }

  // Ensure that there is a driver loaded and available (clever-orm or clever-odm)
  utils.model.helpers.driver(moduleLdr, Klass, modelType, moduleName, modelName, debuggr);

  // Create a unique debugger for the new model
  debug = require('debug')('cleverstack:models:' + modelName);
  utils.model.helpers.defineFields.apply(this, [Klass, Proto, modelName, modelType, debug]);

  Proto.setup  = utils[modelType.toLowerCase() + 'Utils'].setup;

  debug('Creating model class...');
  model = this._super.apply(this, [Klass, Proto]);

  utils.model.helpers.afterExtend.apply(this, [utils, defineProp, model, Klass, modelName, debug]);

  // Cache the model
  this.models[modelName] = model;

  return model;
};
