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
  utils.model.helpers.defineModelFields.apply(this, [Klass, Proto, modelName, modelType, debug]);

  Proto.setup  = utils[modelType.toLowerCase() + 'Utils'].setup;

  debug('Creating model class...');
  model = this._super.apply(this, [Klass, Proto]);

  // Lock things down!
  ['entity', 'defaults', 'connection', 'type', 'modelName', 'fields', 'aliases','primaryKey', 'primaryKeys','hasPrimaryKey', 'hasSinglePrimaryKey'].forEach(function(key) {
    defineProp(model, key, { value: model[key] });
  });
  defineProp(model, 'associations', { value: model.entity.associations });

  // Setup the dynamic finders
  utils.model.helpers.dynamicFinders(model);

  // Cache the model
  this.models[modelName] = model;

  // Bind for nestedOperations
  utils.model.helpers.nestedOperations.apply(this, [Klass, modelName, model, debug]);

  return model;
};