var injector   = require('injector')
  , Exceptions = require('exceptions')
  , Promise    = require('bluebird')
  , async      = require('async')
  , util       = require('util')
  , utils      = require('utils')
  , underscore = require('underscore')
  , inflect    = require('i')()
  , debuggr    = require('debug')('cleverstack:models')
  , moduleLdr  = injector.getInstance('moduleLoader')
  , modelUtils = utils.modelUtils
  , defineProp = utils.helpers.defineProperty
  , models     = {};

var Model = module.exports = injector.getInstance('Class').extend(
/* @Class*/
{
    /**
     * Default Options, defined as properties of the Classes default options Object Literal.
     * @see http://cleverstack.io/documentation/backend/models/#options for more information
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
        timeStampable  : false,
        softDeleteable : false
    },

    /**
     * Life Cycle Event Types, An Array listing of all available Events.
     * @see http://cleverstack.io/documentation/backend/models/#options for more information
     */
    eventNames     : modelUtils.eventNames,

    /**
     * Field Types you can use when Native JavaScript Types simply don't cut it...
     * @see http://cleverstack.io/documentation/backend/models/#types for more information
     */
    Types          : utils.modelTypes,

    /**
     * Class Methods that can be used to define Assocations/Relations.
     * @see http://cleverstack.io/documentation/backend/models/#assocations for more information
     */
    hasOne         : modelUtils.hasOne,
    hasMany        : modelUtils.hasMany,
    belongsTo      : modelUtils.belongsTo,

    /**
     * The Validator, used to validate Instance Fields.
     * @see http://cleverstack.io/documentation/backend/models/#validation for more information
     */
    validator      : utils.modelValidator,

    /**
     * Extend the Model base class to create a new Model.
     * @see http://cleverstack.io/documentation/backend/models/#definition for more information
     * @todo refactor this out, and allow extend to be called on existing models, to put partial schema's in different databases
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

        debug = function(msg) {
            debuggr(modelName + 'Model: ' + msg);
        };

        debug('Setting up options, behaviours and properties...');

        Static.type        = modelType;
        Static.modelName   = modelName;
        Static.fields      = {};
        Static.aliases     = [];
        Static.primaryKey  = false;
        Static.primaryKeys = [];
        Static.hasPrimaryKey  = false;
        Static.singlePrimaryKey  = false;

        allowedOptions.forEach(Model.callback(function(optionName) {
            Static[optionName] = Static[optionName] !== undefined ? Static[optionName] : this.defaults[optionName];
        }));

        debug('Checking for defined getters and setters...');

        Static.getters = Proto.getters !== undefined ? Proto.getters : {};
        Static.setters = Proto.setters !== undefined ? Proto.setters : {};
        
        delete Proto.getters;
        delete Proto.setters;

        debug('Defining Fields...');
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
        Static.entity = Static.driver.parseModelSchema(Static, Proto);

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
     * Create a new model using values, then save it in the database
     * @see http://cleverstack.io/documentation/backend/models/#finders-find for more information
     */
    create: function(values, queryOptions) {
        var utilName = this.type.toLowerCase() + 'Utils';

        queryOptions = queryOptions || {};

        return new Promise(function(resolve, reject) {
            if (this.debug.enabled) {
                this.debug(util.format('create(%s)', modelUtils.debugInspect(values)));
            }

            async.waterfall([
                this.callback(modelUtils.isValidSchema),
                this.callback(modelUtils.isNewModel, values),
                this.callback(modelUtils.setDefaultValues, values),
                this.callback(modelUtils.aliasFieldsForOutput, values),
                this.callback(modelUtils.validateValues, this.validator, values),
                this.callback(modelUtils.timeStampable, values),
                this.callback(modelUtils.beforeEvent, 'beforeCreate', values, queryOptions),
                this.callback(modelUtils.aliasAssociationsForQuery, values),
                this.callback(modelUtils.aliasFieldsForQuery, values),
                this.callback(utils[utilName].create, values, queryOptions),
                this.callback(modelUtils.afterEvent, 'afterCreate', values, queryOptions)
            ],
            this.callback(modelUtils.returnModels, resolve, reject));
        }
        .bind(this));
    },

    /**
     * Default Finder that will query the database, and return the first model that matches the provided findOptions.where criteria.
     * @see http://cleverstack.io/documentation/backend/models/#finders-find for more information
     */
    find: function(findOptions, queryOptions) {
        var utilName = this.type.toLowerCase() + 'Utils';

        findOptions  = findOptions  || { where: {} };
        queryOptions = typeof queryOptions === 'object' ? queryOptions : {};

        return new Promise(function(resolve, reject) {
            if (this.debug.enabled) {
                this.debug(util.format('find(%s)', modelUtils.debugInspect(findOptions)));
            }

            if (/^[0-9a-fA-F]{24}$/.test(findOptions) || !isNaN(findOptions)) {
                if (this.primaryKeys.length === 1) {
                    var findOptionsOverride = { where: {} };
                    findOptionsOverride.where[this.primaryKey] = findOptions;
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

    /**
     * Default Finder that will query the database, and return every model that matches the provided findOptions.where criteria.
     * @see http://cleverstack.io/documentation/backend/models/#finders-find for more information
     */
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

    /**
     * Update a model using the provided values, and with where criteria supplied in queryOptions
     * @see http://cleverstack.io/documentation/backend/models/#updating-models for more information
     */
    update: function(values, queryOptions) {
        var utilName = this.type.toLowerCase() + 'Utils';

        queryOptions = queryOptions || {};

        return new Promise(function(resolve, reject) {
            if (this.debug.enabled) {
                this.debug(util.format('update(%s) where %s', modelUtils.debugInspect(values), modelUtils.debugInspect(queryOptions ? queryOptions.where : queryOptions)));
            }

            async.waterfall([
                this.callback(modelUtils.isValidSchema),
                this.callback(modelUtils.hasValidWhere, 'update', values, queryOptions),
                this.callback(modelUtils.aliasFieldsForOutput, values),
                // @todo implement the validator for updating instances
                // this.callback(modelUtils.validateValues, this.validator, values),
                this.callback(modelUtils.beforeEvent, 'beforeUpdate', values, queryOptions),
                this.callback(modelUtils.aliasAssociationsForQuery, values),
                this.callback(modelUtils.aliasFieldsForQuery, values),
                this.callback(utils[utilName].update, values, queryOptions),
                this.callback(modelUtils.afterEvent, 'afterUpdate', values, queryOptions)
            ],
            this.callback(modelUtils.returnModels, resolve, reject));
        }
        .bind(this));
    },

    /**
     * Update a model using the provided queryOptions's where criteria
     * @see http://cleverstack.io/documentation/backend/models/#destroying-models for more information
     */
    destroy: function(queryOptions) {
        var utilName = this.type.toLowerCase() + 'Utils';

        queryOptions = queryOptions || {};

        return new Promise(function(resolve, reject) {
            if (this.debug.enabled) {
                this.debug(util.format('destroy where %s', modelUtils.debugInspect(queryOptions ? queryOptions.where : queryOptions)));
            }

            async.waterfall([
                this.callback(modelUtils.isValidSchema),
                this.callback(modelUtils.beforeEvent, 'beforeDestroy', queryOptions.where, queryOptions),
                this.callback(modelUtils.aliasAssociationsForQuery, queryOptions.where),
                this.callback(modelUtils.aliasFieldsForQuery, queryOptions.where),
                this.callback(utils[utilName].destroy, queryOptions),
                this.callback(modelUtils.afterEvent, 'afterDestroy', queryOptions)
            ],
            this.callback(modelUtils.returnModels, resolve, reject));
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
/* @Instance */
{
    // @todo refactor
    setup: function(model) {
        // @todo refactor - move this out into the ORM module!?
        if (!(model instanceof this.Class.entity.Instance)) {
            model = this.Class.entity.build(model);
        }
        defineProp(this, 'entity', {value: model});
        defineProp(this, 'isDirty', this.proxy(function() {
            return this.entity.isDirty; 
        }));
        defineProp(this, 'isDeleted', this.proxy(function() {
            return this.entity.isDeleted; 
        }));
        defineProp(this, 'isNewRecord', this.proxy(function() {
            return this.entity.isNewRecord;
        }));

        defineProp(this, 'values', this.proxy(function() {
            return this.entity.values;
        }));
        defineProp(this, 'attributes', this.proxy(function() {
            return this.entity.attributes;
        }));
        defineProp(this, 'changed', this.proxy(function() {
            return this.entity.changed();
        }));

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

    // @todo refactor
    // @todo handle all 3 available sequelizejs arguments in save()
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
                // this.Class.callback(modelUtils.validateValues, this.Class.validator, this),
                this.Class.callback(modelUtils.beforeEvent, 'beforeUpdate', values, queryOptions),
                this.callback(utils[utilName].save, values, queryOptions),
                this.Class.callback(modelUtils.afterEvent, 'afterUpdate', values, queryOptions)
            ],
            this.callback(modelUtils.updateReferencedModel, resolve, reject));
        }
        .bind(this));
    },

    // @todo review this vs the static/class destroy
    // @todo refactor
    destroy: function(queryOptions) {
        var utilName  = this.Class.type.toLowerCase() + 'Utils';

        queryOptions  = queryOptions || {};

        return new Promise(function(resolve, reject) {
            if (this.debug.enabled) {
                this.debug('destroy(queryOptions)');
            }

            async.waterfall([
                this.Class.callback(modelUtils.beforeEvent, 'beforeDestroy', this, queryOptions),
                this.callback(utils[utilName].destroy, queryOptions),
                this.Class.callback(modelUtils.afterEvent, 'afterDestroy', this, queryOptions)
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