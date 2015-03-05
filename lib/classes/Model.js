'use strict';

var injector   = require('injector')
  , Promise    = require('bluebird')
  , async      = require('async')
  , util       = require('util')
  , utils      = require('utils')
  , underscore = require('underscore')
  , inflect    = require('i')()
  , debuggr    = require('debug')('cleverstack:models')
  , moduleLdr  = injector.getInstance('moduleLoader')
  , Class      = injector.getInstance('Class')
  , Validator  = injector.getInstance('Validator')
  , modelUtils = utils.modelUtils
  , defineProp = utils.helpers.defineProperty
  , models     = {}
  , Model;

/**
 * @classdesc CleverStack Model Class
 * @class     Model
 * @extends   Class
 * @param     {Object|Entity}   entity  Either an object containing data for this model, or a native sequelize or mongoose entity
 * @example
 * var model = new Model({
 *   firstName: 'Richard'
 * });
 * // or
 * var model = Model.create(sequelizeInstance);
 */
Model = Class.extend(
/**
 * @lends   Model
 */
{
  /**
   * Default Options, defined as properties of the Classes default options Object Literal.
   * @see http://cleverstack.io/documentation/backend/models/#options
   * 
   * @property {String} type=ORM              the default model type, either 'ORM' or 'ODM'
   * @property {String} dbName=false          the name of the database table
   * @property {String} engine=false          the database engine to use for this model (ORM ONLY)
   * @property {String} charset=false         the database charset to use for this model (ORM ONLY)
   * @property {String} comment=false         the database comment to use for this model (ORM ONLY)
   * @property {String} collate=false         the database collate to use for this model (ORM ONLY)
   * @property {Object} indexes=false         custom definition of indexes for this model
   * @property {String} createdAt=createdAt   for use with the timeStampable behaviour
   * @property {String} updatedAt=updatedAt   for use with the timeStampable behaviour
   * @property {String} deletedAt=deletedAt   for use with the softDeleteable behaviour
   * @property {Boolean} underscored=false    the database underscored to use for this model
   * @property {Boolean} versionable=false    the versionable behaviour
   * @property {Boolean} freezeDbName=false   if set to true your models tableName(dbName) won't be plural or camelized
   * @property {Boolean} timeStampable=true  the timeStampable behaviour
   * @property {Boolean} softDeleteable=true the softDeleteable behaviour
   */
  defaults: {
    type           : 'ORM',
    dbName         : false,
    engine         : false,
    charset        : false,
    comment        : false,
    collate        : false,
    indexes        : false,
    createdAt      : 'createdAt',
    updatedAt      : 'updatedAt',
    deletedAt      : 'deletedAt',
    underscored    : false,
    versionable    : false,
    freezeDbName   : false,
    timeStampable  : true,
    softDeleteable : true
  },

  /**
   * Field Types you can use when Native JavaScript Types simply don't cut it...
   * @see http://cleverstack.io/documentation/backend/models/#field-types
   *
   * @property {ENUM}    ENUM    custom type
   * @property {TINYINT} TINYINT custom type
   * @property {BIGINT}  BIGINT  custom type
   * @property {FLOAT}   FLOAT   custom type
   * @property {DECIMAL} DECIMAL custom type
   * @property {TEXT}    TEXT    custom type
   */
  Types            : utils.modelTypes,

  /**
   * Helper function to setup an association where SourceModel.hasOne(TargetModel), with optional options for the association.
   * @see http://cleverstack.io/documentation/backend/models/#assocations
   * 
   * @function Model.hasOne
   * @param   {Model}  targetModel the TargetModel that this SourceModel belongsTo.
   * @param   {Array}  options     the optional options for this association
   * @returns {Object} the association object
   */
  hasOne           : modelUtils.hasOne,

  /**
   * Helper function to setup an association where SourceModel.hasMany(TargetModel), with optional options for the association.
   * @see http://cleverstack.io/documentation/backend/models/#assocations
   *     
   * @function Model.hasMany
   * @param   {Model}  targetModel the TargetModel that this SourceModel belongsTo.
   * @param   {Array}  options     the optional options for this association
   * @returns {Object} the association object
   */
  hasMany          : modelUtils.hasMany,

  /**
   * Helper function to setup an association where SourceModel.belongsTo(TargetModel), with optional options for the association.
   * @see http://cleverstack.io/documentation/backend/models/#assocations
   *     
   * @function Model.belongsTo
   * @param   {Model}  targetModel the TargetModel that this SourceModel belongsTo.
   * @param   {Array}  options     the optional options for this association
   * @returns {Object} the association object
   */
  belongsTo        : modelUtils.belongsTo,

  /**
   * The Validator Class, used to validate Instance Fields.
   * @see http://cleverstack.io/documentation/backend/models/#validation
   */
  validator        : Validator,

  /**
   * Life Cycle Event Types, An Array listing of all available Events.
   * @see http://cleverstack.io/documentation/backend/models/#events
   */
  eventNames       : modelUtils.eventNames,

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
  extend: function() {
    var extendingArgs   = [].slice.call(arguments)
      , modelName       = (typeof extendingArgs[0] === 'string') ? extendingArgs.shift() : false
      , Static          = (extendingArgs.length === 2) ? extendingArgs.shift() : {}
      , Proto           = extendingArgs.shift()
      , modelType       = ( Static.type !== undefined ? Static.type : this.defaults.type ).toUpperCase()
      , moduleName      = 'clever-' + modelType.toLowerCase()
      , model           = null
      , debug           = null
      , allowedOptions  = underscore.without(Object.keys(this.defaults), 'type');

    extendingArgs       = [Static, Proto];

    if (!modelName) {
      if ((modelName = utils.helpers.getClassName(4)) !== false) {
        modelName = modelName.replace('Model', '');
      } else {
        throw new Error('Unable to determine model name.');
      }
    }

    if (models[modelName] !== undefined) {
      debuggr(modelName + 'Model: Returning model class from the cache...');
      return models[modelName];
    }

    debuggr(modelName + 'Model: Defining model, checking to see if the driver (' + modelType + ') is installed and enabled...');
    if (moduleLdr.moduleIsEnabled(moduleName) !== true) {
      throw new Error(['To use type', modelType, 'on your', modelName, 'model you need to enable the', moduleName, 'module!'].join(' '));
    } else {
      defineProp(Static, 'driver', { value: injector.getInstance(inflect.camelize(moduleName.replace(/-/g, '_'), false)) });
    }

    debug = require('debug')('cleverstack:models:'+modelName);

    debug('Setting up options, behaviours and properties...');

    Static.type              = modelType;
    Static.modelName         = modelName;
    Static.fields            = {};
    Static.aliases           = [];
    Static.primaryKey        = false;
    Static.primaryKeys       = [];
    Static.hasPrimaryKey     = false;
    Static.singlePrimaryKey  = false;

    allowedOptions.forEach(Model.callback(function(optionName) {
      Static[optionName]     = Static[optionName] !== undefined ? Static[optionName] : this.defaults[optionName];
    }));

    debug('Checking for defined getters and setters...');

    Static.getters = Proto.getters !== undefined ? Proto.getters : {};
    Static.setters = Proto.setters !== undefined ? Proto.setters : {};
    
    delete Proto.getters;
    delete Proto.setters;

    debug('Defining Fields...');
    Object.keys(Proto).forEach(this.callback(utils.modelUtils.getSchemaFromProto, Proto, Static));

    debug('Defining models this.debug() helper...');
    Proto.debug         = Static.debug = debug;
    Proto.debug.enabled = Static.debug.enabled = Static.driver.debug.enabled;

    debug('Defining timeStampable behaviour schema fields...');
    utils.modelUtils.setupTimeStampable.apply(this, [Static]);

    debug('Defining softDeleteable behaviour schema fields...');
    utils.modelUtils.setupSoftDeleteable.apply(this, [Static]);

    debug('Generating native model using driver.parseModelSchema()...');
    Static.entity = Static.driver.parseModelSchema(Static, Proto);

    Proto.setup  = utils[modelType.toLowerCase() + 'Utils'].setup;

    debug('Creating model class...');
    model = this._super.apply(this, extendingArgs);

    // Lock things down!
    ['entity', 'defaults', 'connection', 'type', 'modelName', 'fields', 'aliases','primaryKey', 'primaryKeys','hasPrimaryKey', 'hasSinglePrimaryKey']
    .forEach(function(key) {
      defineProp(model, key, { value: model[key] });
    })
    defineProp(model, 'associations',      { value: model.entity.associations });

    utils.modelDynamicFinders(model)        

    models[modelName] = model;

    moduleLdr.on('routesInitialized', function() {
      debug( 'Parsing templated event handlers...' );
      Object.keys( Static ).forEach( function( propName ) {
        if ( propName.indexOf( ' ' ) !== -1 || modelUtils.eventNames.indexOf( propName ) !== -1 ) {
          var parts       = propName.split( ' ' )
            , resource    = parts.length === 2 ? parts.shift() : modelName + 'Model'
            , eventName   = parts.shift();

          injector.getInstance( resource ).on( eventName, model.callback( propName ) );
        }
      });
    });

    return model;
  },

  /**
   * Create a new model using the values provided and persist/save it to the database.
   * @see http://cleverstack.io/documentation/backend/models/#creating-instances
   * 
   * @function Model.create
   * @param  {Object}       values                    The values that will be used to create a model instance
   * @param  {Object}       queryOptions={}
   * @param  {Transaction}  queryOptions.transaction  The transaction (if any) to use in the query
   * @return {Promise}
   */
  create: function(values, queryOptions) {
    var utilName = this.type.toLowerCase() + 'Utils';
    
    queryOptions = modelUtils.normalizeQueryOptions(queryOptions);

    if (this.debug.enabled) {
      this.debug(util.format('create(%s)', modelUtils.debugInspect(values)));
    }

    return new Promise(function create(resolve, reject) {
      async.waterfall([
        this.callback(modelUtils.isValidSchema),
        this.callback(modelUtils.isNewModel, values),
        this.callback(modelUtils.setDefaultValues, values),
        this.callback(modelUtils.aliasFieldsForOutput, values),
        this.callback(modelUtils.validateValues, this.validator, values),
        this.callback(modelUtils.timeStampable, values),
        /**
         * beforeCreate event.
         *
         * @event Model.beforeCreate
         * @type {Object}
         */
        this.callback(modelUtils.beforeEvent, 'beforeCreate', values, queryOptions),
        this.callback(modelUtils.aliasAssociationsForQuery, values, false),
        this.callback(modelUtils.aliasFieldsForQuery, values),
        this.callback(utils[utilName].create, values, queryOptions),
        /**
         * afterCreate event.
         *
         * @event Model.afterCreate
         * @type {Object}
         */
        this.callback(modelUtils.afterEvent, 'afterCreate', values, queryOptions)
      ],
      this.callback(modelUtils.returnModels, resolve, reject));
    }
    .bind(this));
  },

  // @todo refactor
  findOrCreate: function(findOptions, data, queryOptions) {
    var that = this;

    return new Promise(function findOrCreate(resolve, reject) {
      this
      .find(findOptions, queryOptions)
      .then(function(model) {
        if (model === null) {
          that.create(data, queryOptions)
            .then(resolve)
            .catch(reject);
        } else {
          resolve(model);
        }
      }.bind(this))
      .catch(function(err) {
        reject(err instanceof Error ? err : new Error(err));
      });
    }
    .bind(this));
  },

  /**
   * Find and return the first model that matches the provided findOptions.
   * @see http://cleverstack.io/documentation/backend/models/#finders-find
   * 
   * @function Model.find
   * @param  {Object}       findOptions={}
   * @param  {Object}       findOptions.where         Criteria for the query
   * @param  {Number}       findOptions.limit         Result Limiting (Paging)
   * @param  {Number}       findOptions.offset        Result Offset (Paging)
   * @param  {Array}        findOptions.include       Lazy/Eager Loading including Nested
   * @param  {Object}       queryOptions={}
   * @param  {Transaction}  queryOptions.transaction  The transaction (if any) to use in the query
   * @return {Promise}
   */
  find: function(findOptions, queryOptions) {
    var utilName = this.type.toLowerCase() + 'Utils';

    findOptions  = modelUtils.normalizeFindOptions(findOptions);
    queryOptions = modelUtils.normalizeQueryOptions(queryOptions);

    if (this.debug.enabled) {
      this.debug(util.format('find(%s)', modelUtils.debugInspect(findOptions)));
    }

    return new Promise(function find(resolve, reject) {
      async.waterfall([
        this.callback(modelUtils.isValidSchema),
        this.callback(modelUtils.ensurePrimaryKeyInWhere, findOptions),
        /**
         * beforeAllFindersOptions event.
         *
         * @event Model.beforeAllFindersOptions
         * @type {Object}
         */
        this.callback(modelUtils.beforeEvent, 'beforeAllFindersOptions', findOptions, queryOptions),
        /**
         * beforeFindOptions event.
         *
         * @event Model.beforeFindOptions
         * @type {Object}
         */
        this.callback(modelUtils.beforeEvent, 'beforeFindOptions', findOptions, queryOptions),
        this.callback(modelUtils.ensureFindOptionsValid, findOptions), // needed anymore?
        this.callback(modelUtils.aliasFieldsForQuery, findOptions.where),
        this.callback(modelUtils.aliasAssociationsForQuery, findOptions.where, true),
        this.callback(utils[utilName].softDeleteable, findOptions, queryOptions),
        /**
         * afterFind event.
         *
         * @event Model.beforeFind
         * @type {Object}
         */
        this.callback(modelUtils.beforeEvent, 'beforeFind', findOptions, queryOptions),
        this.callback(utils[utilName].find, findOptions, queryOptions),
        /**
         * afterFind event.
         *
         * @event Model.afterFind
         * @type {Object}
         */
        this.callback(modelUtils.afterEvent, 'afterFind', findOptions, queryOptions)
      ],
      this.callback(modelUtils.returnModels, resolve, reject));
    }
    .bind(this));
  },

  /**
   * Find and return all models that match the provided findOptions.
   * @see http://cleverstack.io/documentation/backend/models/#finders-findAll
   * 
   * @function Model.findAll
   * @param  {Object}       findOptions={}
   * @param  {Object}       findOptions.where         Criteria for the query
   * @param  {Number}       findOptions.limit         Result Limiting (Paging)
   * @param  {Number}       findOptions.offset        Result Offset (Paging)
   * @param  {Array}        findOptions.include       Lazy/Eager Loading including Nested
   * @param  {Object}       queryOptions={}
   * @param  {Transaction}  queryOptions.transaction  The transaction (if any) to use in the query
   * @return {Promise}
   */
  findAll: function(findOptions, queryOptions) {
    var utilName = this.type.toLowerCase() + 'Utils';

    findOptions  = modelUtils.normalizeFindOptions(findOptions);
    queryOptions = modelUtils.normalizeQueryOptions(queryOptions);

    if (this.debug.enabled) {
      this.debug(util.format('findAll(%s)', modelUtils.debugInspect(findOptions)));
    }

    return new Promise(function findAll(resolve, reject) {
      async.waterfall([
        this.callback(modelUtils.isValidSchema),
        this.callback(modelUtils.beforeEvent, 'beforeAllFindersOptions', findOptions, queryOptions),
        /**
         * beforeFindAllOptions event.
         *
         * @event Model.beforeFindAllOptions
         * @type {Object}
         */
        this.callback(modelUtils.beforeEvent, 'beforeFindAllOptions', findOptions, queryOptions),
        this.callback(modelUtils.aliasFieldsForQuery, findOptions.where),
        this.callback(modelUtils.aliasAssociationsForQuery, findOptions.where, true),
        this.callback(utils[utilName].softDeleteable, findOptions, queryOptions),
        /**
         * beforeFindAll event.
         *
         * @event Model.beforeFindAll
         * @type {Object}
         */
        this.callback(modelUtils.beforeEvent, 'beforeFindAll', findOptions, queryOptions),
        this.callback(utils[utilName].findAll, findOptions, queryOptions),
        /**
         * afterFindAll event.
         *
         * @event Model.afterFindAll
         * @type {Object}
         */
        this.callback(modelUtils.afterEvent, 'afterFindAll', findOptions, queryOptions)
      ],
      this.callback(modelUtils.returnModels, resolve, reject));
    }
    .bind(this));
  },

  /**
   * Update a model using the provided values, and with where criteria supplied in queryOptions.
   * @see http://cleverstack.io/documentation/backend/models/#updating-or-saving-instances
   * 
   * @function Model.update
   * @param  {Object}       values                    The values that will be used to create a model instance
   * @param  {Object}       queryOptions={}
   * @param  {Object}       queryOptions.where        Criteria to use for the UPDATE statement
   * @param  {Transaction}  queryOptions.transaction  The transaction (if any) to use in the query
   * @return {Promise}
   */
  update: function(values, queryOptions) {
    var utilName = this.type.toLowerCase() + 'Utils';

    values       = values || {};
    queryOptions = modelUtils.normalizeFindOptions(queryOptions);

    if (this.debug.enabled) {
      this.debug(util.format('update(%s) %s', modelUtils.debugInspect(values), modelUtils.debugInspect(queryOptions)));
    }

    return new Promise(function update(resolve, reject) {
      async.waterfall([
        this.callback(modelUtils.isValidSchema),
        this.callback(modelUtils.hasValidWhere, 'update', values, queryOptions),
        this.callback(modelUtils.aliasFieldsForOutput, values),
        this.callback(modelUtils.aliasFieldsForOutput, queryOptions.where),
        // @todo implement the validator for updating instances
        // this.callback(modelUtils.validateValues, this.validator, values),
        /**
         * beforeUpdate event.
         *
         * @event Model.beforeUpdate
         * @type {Object}
         */
        this.callback(modelUtils.beforeEvent, 'beforeUpdate', values, queryOptions),
        this.callback(modelUtils.aliasAssociationsForQuery, queryOptions.where, false),
        this.callback(modelUtils.aliasFieldsForQuery, queryOptions.where),
        this.callback(modelUtils.aliasAssociationsForQuery, values, false),
        this.callback(modelUtils.aliasFieldsForQuery, values),
        this.callback(utils[utilName].update, values, queryOptions),

        /**
         * afterUpdate event.
         *
         * @event Model.afterUpdate
         * @type {Object}
         */
        this.callback(modelUtils.afterEvent, 'afterUpdate', values, queryOptions)
      ],
      this.callback(modelUtils.returnModels, resolve, reject));
    }
    .bind(this));
  },

  /**
   * Destroy a model using the provided queryOptions's where criteria.
   * @see http://cleverstack.io/documentation/backend/models/#destroying-instances
   * 
   * @param  {Object}       queryOptions={}
   * @param  {Object}       queryOptions.where        Criteria to use for the UPDATE statement
   * @param  {Transaction}  queryOptions.transaction  The transaction (if any) to use in the query
   * @return {Promise}
   */
  destroy: function(queryOptions) {
    var utilName = this.type.toLowerCase() + 'Utils';

    queryOptions = modelUtils.normalizeFindOptions(queryOptions);

    if (this.debug.enabled) {
      this.debug(util.format('destroy where %s', modelUtils.debugInspect(queryOptions ? queryOptions.where : queryOptions)));
    }

    return new Promise(function destroy(resolve, reject) {
      async.waterfall([
        this.callback(modelUtils.isValidSchema),
        this.callback(modelUtils.hasValidWhere, 'destroy', queryOptions.where, queryOptions),
        /**
         * beforeDestroy event.
         *
         * @event Model.beforeDestroy
         * @type {Object}
         */
        this.callback(modelUtils.beforeEvent, 'beforeDestroy', queryOptions.where, queryOptions),
        this.callback(modelUtils.aliasAssociationsForQuery, queryOptions.where, true),
        this.callback(modelUtils.aliasFieldsForQuery, queryOptions.where),
        this.callback(utils[utilName].destroy, queryOptions),
        /**
         * afterDestroy event.
         *
         * @event Model.afterDestroy
         * @type {Object}
         */
        this.callback(modelUtils.afterEvent, 'afterDestroy', queryOptions)
      ],
      this.callback(modelUtils.removeReferencedModel, resolve, reject));
    }
    .bind(this));
  },

  // @todo all
  // @todo describe
  // @todo findAndCountAll
  // @todo findAllJoin
  // @todo findOrInitialize
  // @todo findOrBuild
  // @todo bulkCreate
  // @todo aggregate
  // @todo build
  // @todo count
  // @todo min
  // @todo max

  // @todo refactor
  findAndUpdate: function(findOptions, data, queryOptions) {
    var that = this;

    return new Promise(function(resolve, reject) {
      that
      .find(findOptions, queryOptions)
      .then(function(model) {
        return model.update(data, queryOptions).then(resolve);
      })
      .catch(reject);
    });
  },

  // @todo refactor
  getDefinedModels: function() {
    return models;
  }
},
/**
 * @lends Model#
 */
{
  setup: function() {
    Object.keys(this.Class.getters).forEach(this.proxy('_setupProperty'));

    if (this.Class.timeStampable) {
      Object.defineProperty(this, this.Class.createdAt, {
        get: function() { return this.entity.createdAt },
        set: function(val) { this.entity.createdAt = val; },
        enumerable: true,
        configurable: false
      });
      Object.defineProperty(this, this.Class.updatedAt, {
        get: function() { return this.entity.updatedAt },
        set: function(val) { this.entity.updatedAt = val; },
        enumerable: true,
        configurable: false
      });
    }

    if (this.Class.softDeleteable) {
      this._setupProperty(this.Class.softDeleteable);
      Object.defineProperty(this, this.Class.deletedAt, {
        get: function() { return this.entity.deletedAt },
        set: function(val) { this.entity.deletedAt = val; },
        enumerable: true,
        configurable: false
      });
    }
  },

  // @todo refactor
  _setupProperty: function(propName) {
    Object.defineProperty(this, propName, {
      get: this.proxy(this.Class.getters[propName]),
      set: this.proxy(this.Class.setters[propName]),
      enumerable: true,
      configurable: false
    });
  },

  // @todo refactor
  map: function() {
    return this.entity.map.apply(this, arguments);
  },

  /**
   * Update the current model using the provided values (optional, defaults to this.changed())
   * @see http://cleverstack.io/documentation/backend/models/#updating-or-saving-instances
   * 
   * @param  {Object}       values=this.changed()     The values that will be used to create a model instance
   * @param  {Object}       queryOptions={}
   * @param  {Transaction}  queryOptions.transaction  The transaction (if any) to use in the query
   * @return {Promise}
   */
  save: function(values, queryOptions) {
    var utilName  = this.Class.type.toLowerCase() + 'Utils'
      , omitFields;

    queryOptions  = queryOptions || {};

    return new Promise(function(resolve, reject) {
      if (this.debug.enabled) {
        this.debug(util.format('save(%s)', modelUtils.debugInspect(values)));
      }

      if (typeof values === 'object') {
        omitFields = []//.concat(this.primaryKey);
        if (!!this.Class.timeStampable) {
          omitFields.push('createdAt');
          omitFields.push('updatedAt');
        }
        if (!!this.Class.softDeleteable) {
          omitFields.push('deletedAt');
        }

        Object.keys( values ).forEach(this.callback(function( i ) {
          if (omitFields.indexOf(i) === -1 && typeof this.Class.setters[i] === 'function') {
            this.Class.setters[i].apply(this, [values[i]]);
          }
        }));
      }

      values = underscore.pick(this.values, this.changed);
      if (Object.keys(values).length === 0 && !queryOptions.force) {
        return resolve(this);
      }

      async.waterfall([
        // @todo fix validator
        // this.Class.callback(modelUtils.validateValues, this.Class.validator, this),
        
        /**
         * beforeSave event.
         *
         * @todo fix update/create hook, make it work with the current afterSave event
         * @event Model#beforeSave
         * @type {Object}
         */
        this.Class.callback(modelUtils.beforeEvent, 'beforeSave', values, queryOptions),
        this.callback(utils[utilName].save, values, queryOptions),

        /**
         * afterSave event.
         *
         * @todo fix destroy hook, make it work with the current afterSave event
         * @event Model#afterSave
         * @type {Object}
         */
        this.Class.callback(modelUtils.afterEvent, 'afterSave', values, queryOptions)
      ],
      this.callback(modelUtils.updateReferencedModel, resolve, reject));
    }
    .bind(this));
  },

   /**
    * Destroy the current instance
    * @see http://cleverstack.io/documentation/backend/models/#destroying-instances
    *
    * @param  {Object}       queryOptions={}
    * @param  {Transaction}  queryOptions.transaction  The transaction (if any) to use in the query
    * @return {Promise}
    */
  destroy: function(queryOptions) {
    var utilName  = this.Class.type.toLowerCase() + 'Utils';

    queryOptions  = queryOptions || {};

    if (this.debug.enabled) {
      this.debug('destroy(queryOptions)');
    }

    return new Promise(function(resolve, reject) {
      async.waterfall([
        /**
         * beforeDestroy event.
         *
         * @event Model#beforeDestroy
         * @type {Object}
         */
        this.Class.callback(modelUtils.beforeEvent, 'beforeDestroy', this, queryOptions),
        this.callback(utils[utilName].destroyInstance, queryOptions),
        /**
         * afterDestroy event.
         *
         * @event Model#afterDestroy
         * @type {Object}
         */
        this.Class.callback(modelUtils.afterEvent, 'afterDestroy', this, queryOptions)
      ],
      this.callback(modelUtils.removeReferencedModel, resolve, reject));
    }
    .bind(this));
  },

  /**
   * Convert the model into a JSON ready format (Object literal)
   * 
   * @see http://cleverstack.io/documentation/backend/models/#instance-methods-toJSON
   * @return {Object}
   */
  toJSON: function() {
    return modelUtils.toJSON.apply(this, arguments);
  },

  /**
   * Special handler for util.inspect to use Model#toJSON
   * 
   * @see http://cleverstack.io/documentation/backend/models/#instance-methods-inspect
   * @return {Object}
   */
  inspect: function() {
    return JSON.stringify(this.toJSON(), null, '  ');
  }
});

module.exports = Model;
