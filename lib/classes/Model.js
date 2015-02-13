var injector   = require('injector')
  , Exceptions = require('exceptions')
  , Promise    = require('bluebird')
  , async      = require('async')
  , util       = require('util')
  , utils      = require('utils')
  , underscore = require('underscore')
  , inflect    = require('i')()
  , debuggr    = require('debug')('cleverstack:models')
  , Class      = injector.getInstance('Class')
  , moduleLdr  = injector.getInstance('moduleLoader')
  , modelUtils = utils.modelUtils
  , validator  = utils.modelValidator
  , defineProp = utils.helpers.defineProperty
  , eventNames = ['beforeAllFindersOptions', 'beforeFindOptions', 'beforeFindAllOptions', 'beforeFind', 'beforeFindAll', 'beforeCreate', 'beforeUpdate', 'beforeDestroy', 'afterFind', 'afterFindAll', 'afterCreate', 'afterUpdate', 'afterDestroy']
  , models     = {};

var Model = Class.extend(
/* @Static */
{   
    /**
     * Defines if this model will be powered by the 'ORM' or 'ODM' modules. (clever-orm and clever-odm respectively)
     * @type {String}
     */
    type: 'ORM',

    /**
     * If set to a String this will be the tableName (ORM) or collectionName (ODM).
     * @type {Boolean|String}
     */
    dbName: false,

    /**
     * By default table (ORM) and collection (ODM) names are pluralized, if you don't want this behaviour set freezeDbName to "true"
     * @type {Boolean}
     */
    freezeDbName: false,

    /**
     * If you want your field names to be underscored instead of camelCased set this option to "true"
     * @type {Boolean}
     */
    underscored: false,

    /**
     * ORM ONLY: Allows you to set the mysql engine to use on the table that is created for this model (example: MyISAM)
     * @type {Boolean|String}
     */
    engine: false,

    /**
     * ORM ONLY: Allows you to set the charset for the table that will be created for this model
     * @type {Boolean|String}
     */
    charset: false,

    /**
     * ORM ONLY: Allows you to set a comment to be added to the SQL Table
     * @type {Boolean}
     */
    comment: false,

    /**
     * ORM ONLY: Allows you to set the collate option for the table created for this model
     * @type {Boolean}
     */
    collate: false,

    indexes: false,

    versionable: false,
    
    /**
     * The "softDeleteable" behaviour, no records will ever be deleted from the database
     * but rather the column "deletedAt" (or the value of Model.deleteAt as the column name) will be NULL for records
     * that have not been deleted and will be the Date & Time of when they were deleted for deleted records.
     * @type {Boolean}
     */
    softDeleteable: false,

    /**
     * Allows you to override the column name of the softDeleteable behaviour, default is "deletedAt"
     * @type {String}
     */
    deletedAt: 'deletedAt',

    /**
     * The "timeStampable" behaviour, this means that when a record is created it will
     * have a datetime stored in the "createdAt" column and when updated will have a datetime stored in updatedAt.
     * 
     * You can override the column names of createdAt and updatedAt by setting Model.createdAt or Model.deletedAt
     * when using the Model.extend() method
     * @type {Boolean}
     */
    timeStampable: false,

    /**
     * Allows you to override the column name of the "timeStampable" behaviours createdAt field
     * @type {String}
     */
    createdAt: 'createdAt',

    /**
     * Allows you to override the column name of the "timeStampable" behaviours updatedAt field
     * @type {String}
     */
    updatedAt: 'updatedAt',

    extend: function() {
        var extendingArgs   = [].slice.call(arguments)
          , modelName       = (typeof extendingArgs[0] === 'string') ? extendingArgs.shift() : false
          , Static          = (extendingArgs.length === 2) ? extendingArgs.shift() : {}
          , Proto           = extendingArgs.shift()
          , modelType       = ( Static.type !== undefined ? Static.type : this.type ).toUpperCase()
          , moduleName      = 'clever-' + modelType.toLowerCase()
          , model           = null
          , debug           = null
          , allowedOptions  = ['dbName', 'freezeDbName', 'underscored', 'engine', 'charset', 'comment', 'collate',
              'softDeleteable', 'deletedAt', 'versionable', 'indexes', 'timeStampable', 'createdAt', 'updatedAt' 
           ];

        extendingArgs       = [Static, Proto];

        // Make sure we have a model name to assign
        if (!modelName) {
            if ((modelName = utils.helpers.getClassName(4)) !== false) {
                modelName = modelName.replace('Model', '');
            } else {
                throw new Error('Unable to determine model name.');
            }
        }

        // Return any cached models
        if (models[modelName] !== undefined) {
            debuggr(modelName + 'Model: Returning model class from the cache...');
            return models[modelName];
        }

        // Check to see if the clever-orm OR clever-odm module is installed and enabled (depending on what Model.type this is)
        debuggr(modelName + 'Model: Defining model, checking to see if the driver (' + modelType + ') is installed and enabled...');
        if (moduleLdr.moduleIsEnabled(moduleName) !== true) {
            throw new Error(['To use type', modelType, 'on your', modelName, 'model you need to enable the', moduleName, 'module!'].join(' '));
        } else {
            defineProp(Static, 'driver', injector.getInstance(inflect.camelize(moduleName.replace(/-/g, '_'), false)));
        }

        // Define a debugger function for the model
        debug = function(msg) {
            debuggr(modelName + 'Model: ' + msg);
        };

        Static.type       = modelType;
        Static._name      = modelName;
        Static._aliases   = [];
        Static.primaryKey = [];

        // Define our options
        debug('Setting up options and behaviours...');
        allowedOptions.forEach(function(behaviour) {
            Static[behaviour] = Static[behaviour] !== undefined ? Static[behaviour] : this[behaviour];
        }.bind(this));

        debug('Checking for defined getters and setters...');

        Static._getters = Proto.getters !== undefined ? Proto.getters : {};
        Static._setters = Proto.setters !== undefined ? Proto.setters : {};
        
        delete Proto.getters;
        delete Proto.setters;

        debug('Defining schema...');
        Static._schema = {};
        Object.keys(Proto).forEach(this.callback(utils.modelUtils.getSchemaFromProto, Proto, Static));

        debug('Defining models this.debug() helper...');
        Proto.debug = Static.debug = function(msg) {
            Static.driver.debug(modelName + 'Model: ' + msg);
        };
        Proto.debug.enabled = Static.debug.enabled = Static.driver.debug.enabled;

        debug('Defining timeStampable behaviour schema fields...');
        utils.modelUtils.setupTimeStampable.apply(this, [Static]);

        debug('Defining softDeleteable behaviour schema fields...');
        utils.modelUtils.setupSoftDeleteable.apply(this, [Static]);

        debug('Generating native model using driver.parseModelSchema()...');
        Static._model = Static.driver.parseModelSchema(Static, Proto);

        debug('Creating model class...');
        model = this._super.apply(this, extendingArgs);

        // Lock things down!
        defineProp(model, '_name', model._name, {enumerable: true});
        defineProp(model, '_aliases', model._aliases, {enumerable: true});
        defineProp(model, '_schema', model._schema, {enumerable: true});
        defineProp(model, '_model', model._model );
        defineProp(Static, '_getters', Static._getters);
        defineProp(Static, '_setters', Static._setters);
        defineProp(model, '_db', model._db);
        defineProp(model, 'type', model.type, {enumerable: true});
        defineProp(model, 'primaryKey', model.primaryKey, {enumerable: true});

        models[modelName] = model;

        moduleLdr.on('routesInitialized', function() {
            debug( 'Parsing templated event handlers...' );
            Object.keys( Static ).forEach( function( propName ) {
                if ( propName.indexOf( ' ' ) !== -1 || eventNames.indexOf( propName ) !== -1 ) {
                    var parts       = propName.split( ' ' )
                      , resource    = parts.length === 2 ? parts.shift() : modelName + 'Model'
                      , eventName   = parts.shift();

                    injector.getInstance( resource ).on( eventName, model.callback( propName ) );
                }
            });
        });


        return model;
    },

    find: function(findOptions, queryOptions) {
        var utilName = this.type.toLowerCase() + 'Utils';

        if (typeof findOptions !== 'object') {
            var findBy = findOptions;

            findOptions = {where:{}};
            findOptions.where[this.primaryKey[0]] = findBy;
        }
        queryOptions = typeof queryOptions === 'object' ? queryOptions : {};

        return new Promise(function(resolve, reject) {
            if (this.debug.enabled) {
                this.debug(util.format('find(%s)', modelUtils.debugInspect(findOptions)));
            }

            if (/^[0-9a-fA-F]{24}$/.test(findOptions) || !isNaN(findOptions)) {
                if (this.primaryKey.length === 1) {
                    var findOptionsOverride = { where: {} };
                    findOptionsOverride.where[this.primaryKey[0]] = findOptions;
                    findOptions = findOptionsOverride;
                } else {
                    return reject(new Exceptions.InvalidData('You must provide an object when using Model.find() when there are multiple primaryKeys'));
                }
            }

            async.waterfall([
                this.callback(modelUtils.isValidSchema),
                this.callback(modelUtils.beforeEvent, 'beforeAllFindersOptions', findOptions, queryOptions),
                this.callback(modelUtils.beforeEvent, 'beforeFindOptions', findOptions, queryOptions),
                this.callback(modelUtils.ensureFindOptionsValid, findOptions),
                this.callback(modelUtils.aliasFieldsForQuery, findOptions.where),
                this.callback(modelUtils.aliasAssociationsForQuery, findOptions.where),
                this.callback(utils[utilName].softDeleteable, findOptions, queryOptions),
                this.callback(modelUtils.beforeEvent, 'beforeFind', findOptions, queryOptions),
                this.callback(utils[utilName].find, findOptions, queryOptions),
                this.callback(modelUtils.afterEvent, 'afterFind', findOptions, queryOptions)
            ],
            this.callback(modelUtils.returnModels, resolve, reject));
        }
        .bind(this));
    },

    findById: function(findOptions, queryOptions) {
        return this.find(findOptions, queryOptions);
    },

    findOne: function(findOptions, queryOptions) {
        return this.find(findOptions, queryOptions);
    },

    findOrCreate: function(findOptions, data, queryOptions) {
        var that = this;

        return new Promise(function(resolve, reject) {
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

    findAll: function(findOptions, queryOptions) {
        var utilName = this.type.toLowerCase() + 'Utils';

        findOptions  = findOptions  || { where: {} };
        queryOptions = queryOptions || {};

        return new Promise(function(resolve, reject) {
            if (this.debug.enabled) {
                this.debug(util.format('findAll(%s)', modelUtils.debugInspect(findOptions)));
            }

            async.waterfall([
                this.callback(modelUtils.isValidSchema),
                this.callback(modelUtils.beforeEvent, 'beforeAllFindersOptions', findOptions, queryOptions),
                this.callback(modelUtils.beforeEvent, 'beforeFindAllOptions', findOptions, queryOptions),
                this.callback(modelUtils.aliasFieldsForQuery, findOptions.where),
                this.callback(modelUtils.aliasAssociationsForQuery, findOptions.where),
                this.callback(utils[utilName].softDeleteable, findOptions, queryOptions),
                this.callback(modelUtils.beforeEvent, 'beforeFindAll', findOptions, queryOptions),
                this.callback(utils[utilName].findAll, findOptions, queryOptions),
                this.callback(modelUtils.afterEvent, 'afterFindAll', findOptions, queryOptions)
            ],
            this.callback(modelUtils.returnModels, resolve, reject));
        }
        .bind(this));
    },

    create: function(modelData, queryOptions) {
        var utilName = this.type.toLowerCase() + 'Utils';

        queryOptions = queryOptions || {};

        return new Promise(function(resolve, reject) {
            if (this.debug.enabled) {
                this.debug(util.format('create(%s)', modelUtils.debugInspect(modelData)));
            }

            async.waterfall([
                this.callback(modelUtils.isValidSchema),
                this.callback(modelUtils.isNewModel, modelData),
                this.callback(modelUtils.setDefaultValues, modelData),
                this.callback(modelUtils.aliasFieldsForOutput, modelData),
                this.callback(modelUtils.validateValues, validator, modelData),
                this.callback(modelUtils.timeStampable, modelData),
                this.callback(modelUtils.beforeEvent, 'beforeCreate', modelData, queryOptions),
                this.callback(modelUtils.aliasAssociationsForQuery, modelData),
                this.callback(modelUtils.aliasFieldsForQuery, modelData),
                this.callback(utils[utilName].create, modelData, queryOptions),
                this.callback(modelUtils.afterEvent, 'afterCreate', modelData, queryOptions)
            ],
            this.callback(modelUtils.returnModels, resolve, reject));
        }
        .bind(this));
    },

    hasMany: function() {
        if (this.type === 'ODM') {
            return utils.odmUtils.hasMany.apply(this, arguments);
        } else {
            return this._model.hasMany.apply(this._model, arguments);
        }
    },

    hasOne: function() {
        if (this.type === 'ODM') {
            return utils.odmUtils.hasOne.apply(this, arguments);
        } else {
            return this._model.hasOne.apply(this._model, arguments);
        }
    },

    belongsTo: function() {
        if (this.type === 'ODM') {
            return utils.odmUtils.belongsTo.apply(this, arguments);
        } else {
            return this._model.belongsTo.apply(this._model, arguments);
        }
    },

    getDefinedModels: function() {
        return models;
    },

    Types: utils.modelTypes
},
/* @Prototype */
{
    _model: null,

    _dirty: false,

    _changed: [],

    setup: function(model) {
        defineProp(this, '_dirty', false, {writable: true});
        defineProp(this, '_changed', [], {writable: true});
        defineProp(this, '_model', model, {writable: true});

        Object.keys(this.Class._getters).forEach(this.proxy('_setupProperty'));

        if (this.Class.timeStampable) {
            Object.defineProperty(this, this.Class.createdAt, {
                get: function() { return this._model.createdAt },
                set: function(val) { this._model.createdAt = val; },
                enumerable: true,
                configurable: false
            });
            Object.defineProperty(this, this.Class.updatedAt, {
                get: function() { return this._model.updatedAt },
                set: function(val) { this._model.updatedAt = val; },
                enumerable: true,
                configurable: false
            });
        }

        if (this.Class.softDeleteable) {
            this._setupProperty(this.Class.softDeleteable);
            Object.defineProperty(this, this.Class.deletedAt, {
                get: function() { return this._model.deletedAt },
                set: function(val) { this._model.deletedAt = val; },
                enumerable: true,
                configurable: false
            });
        }
    },

    _setupProperty: function(propName) {
        Object.defineProperty(this, propName, {
            get: this.proxy(this.Class._getters[propName]),
            set: this.proxy(this.Class._setters[propName]),
            enumerable: true,
            configurable: false
        });
    },

    _setModel: function(_model) {
        this._dirty = false;
        this._changed = [];
        this._model = _model;
    },

    map: function() {
        return this._model.map.apply(this, arguments);
    },

    // @todo handle all 3 available sequelizejs arguments in save()
    save: function(modelData, queryOptions) {
        var utilName  = this.Class.type.toLowerCase() + 'Utils'
          , omitFields;

        queryOptions  = queryOptions || {};

        return new Promise(function(resolve, reject) {
            if (this.debug.enabled) {
                this.debug(util.format('save(%s)', modelUtils.debugInspect(modelData)));
            }

            if (typeof modelData === 'object') {
                omitFields = []//.concat(this.primaryKey);
                if (!!this.Class.timeStampable) {
                    omitFields.push('createdAt');
                    omitFields.push('updatedAt');
                }
                if (!!this.Class.softDeleteable) {
                    omitFields.push('deletedAt');
                }

                Object.keys( modelData ).forEach(this.callback(function( i ) {
                    if (omitFields.indexOf(i) === -1 && typeof this.Class._setters[i] === 'function') {
                        this.Class._setters[i].apply(this, [modelData[i]]);
                    }
                }));
            }

            modelData = underscore.pick(this._model.values, this._changed);
            if (Object.keys(modelData).length === 0 && !queryOptions.force) {
                return resolve(this);
            }

            async.waterfall([
                // this.Class.callback(modelUtils.validateValues, validator, this),
                this.Class.callback(modelUtils.beforeEvent, 'beforeUpdate', modelData, queryOptions),
                this.callback(utils[utilName].save, modelData, queryOptions),
                this.Class.callback(modelUtils.afterEvent, 'afterUpdate', modelData, queryOptions)
            ],
            this.callback(modelUtils.updateReferencedModel, resolve, reject));
        }
        .bind(this));
    },

    destroy: function(queryOptions) {
        var utilName  = this.Class.type.toLowerCase() + 'Utils'
          , modelData = this.toJSON();

        queryOptions  = queryOptions || {};

        return new Promise(function(resolve, reject) {
            if (this.debug.enabled) {
                this.debug('destroy(queryOptions)');
            }

            async.waterfall([
                this.Class.callback(modelUtils.beforeEvent, 'beforeDestroy', modelData, queryOptions),
                this.callback(utils[utilName].destroy, queryOptions),
                this.Class.callback(modelUtils.afterEvent, 'afterDestroy', modelData, queryOptions)
            ],
            this.callback(modelUtils.removeReferencedModel, resolve, reject));
        }
        .bind(this));
    },

    toJSON: function() {
        return modelUtils.toJSON.apply(this, arguments);
    },

    inspect: function() {
        return JSON.stringify(this.toJSON(), null, '  ');
    }
});

module.exports = Model;