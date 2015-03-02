var util        = require('util')
  , async       = require('async')
  , inflect     = require('i')()
  , underscore  = require('underscore')
  , inspectUtil = require('util').inspect
  , Exceptions  = require('exceptions')
  , chalk       = require('chalk')
  , debug       = require('debug')('cleverstack:utils:modelUtils');

var modelUtils  = {

  eventNames: [
    'beforeValidate',
    'afterValidate',
    'beforeCreate',
    'beforeUpdate',
    'beforeDestroy',
    'afterCreate',
    'afterUpdate',
    'afterDestroy',
    'beforeAllFindersOptions',
    'beforeFindOptions',
    'beforeFind',
    'afterFind',
    'beforeFindAllOptions',
    'beforeFindAll',
    'afterFindAll'
  ],

  debugInspect: function(obj) {
    return inspectUtil(obj, {showHidden: false, colors: true, customInspect: true, depth: 1}).replace(/\n[\ ]+/igm, ' ');
    // return inspectUtil(obj, {showHidden: false, colors: true, customInspect: true, depth: 0}).replace(/(\n[\ ]+|\{\ )/igm, '\n\ \ \ \ ');
  },

  normalizeFindOptions: function(findOptions) {
    findOptions  = findOptions  || { where: {} };
    if (!findOptions.where) {
      findOptions = {where: findOptions};
    }
    return findOptions;
  },

  normalizeQueryOptions: function(queryOptions) {
    queryOptions = typeof queryOptions === 'object' ? queryOptions : {};
    return queryOptions;
  },

  ensurePrimaryKeyInWhere: function(findOptions, callback) {
    if (/^[0-9a-fA-F]{24}$/.test(findOptions) || !isNaN(findOptions)) {
      if (this.primaryKeys.length === 1) {
        var findOptionsOverride = { where: {} };
        findOptionsOverride.where[this.primaryKey] = findOptions;
        findOptions = findOptionsOverride;
        callback(null);
      } else {
        callback(new Exceptions.InvalidData('You must provide an object when using Model.find() when there are multiple primaryKeys'));
      }
    } else {
      callback(null);
    }
  },

  hasMany: function() {
    if (this.type === 'ODM') {
      return utils.odmUtils.hasMany.apply(this, arguments);
    } else {
      return this.entity.hasMany.apply(this.entity, arguments);
    }
  },

  hasOne: function() {
    if (this.type === 'ODM') {
      return utils.odmUtils.hasOne.apply(this, arguments);
    } else {
      return this.entity.hasOne.apply(this.entity, arguments);
    }
  },

  belongsTo: function() {
    if (this.type === 'ODM') {
      return utils.odmUtils.belongsTo.apply(this, arguments);
    } else {
      return this.entity.belongsTo.apply(this.entity, arguments);
    }
  },

  isValidSchema: function(callback) {
    callback(this.entity.name !== null ? null : 'You cannot call Model.create() directly on the model class.');
  },

  isNewModel: function(modelData, callback) {
    if (debug.enabled) {
      debug(util.format('isNewModel(%s)', modelUtils.debugInspect(modelData)));
    }

    async.each(
      this.primaryKeys || this.Class.primaryKeys || [],
      this.callback(function checkPrimaryKeys(key, checkDone) {
        if (this.fields[key] && !!this.fields[key].autoIncrement) {
          checkDone(!modelData[key] ? null : key);
        } else {
          checkDone(null);
        }
      }),
      this.callback(function(key) {
        callback(!key ? null : new Exceptions.InvalidData(util.format('Invalid modelData provided to %s.create(%s)', (this._name || this.Class._name), key)));
      })
    );
  },

  hasValidWhere: function(type, values, queryOptions, callback) {
    var valid = false;

    if (type === 'update') {
      valid = typeof queryOptions === 'object' && queryOptions.where && Object.keys(queryOptions.where).length >= 1;
    } else if (type === 'destroy') {
      valid = typeof queryOptions === 'object' && queryOptions.where && queryOptions.where.id;
    }

    callback(!!valid ? null : new Exceptions.InvalidData('Unable to update without find criteria.'));
  },

  setDefaultValues: function(modelData, callback) {
    async.each(
      Object.keys(this.fields || this.Class.fields),
      this.callback(modelUtils.setDefaultValue, modelData),
      callback
     );
  },

  setDefaultValue: function(modelData, fieldName, callback) {
    var field           = this.fields[fieldName]
      , value           = modelData[fieldName]
      , defaultValue    = field['default'];

    if (field.type && value === undefined && defaultValue !== undefined) {
      if (debug.enabled) {
        debug(util.format('setDefaultValue(%s=%s)', fieldName, modelUtils.debugInspect(defaultValue)));
      }
      modelData[fieldName] = defaultValue;
    }

    callback(null);
  },

  validateValues: function(validator, modelData, callback) {
    if (debug.enabled) {
      debug(util.format('validateValues(%s)', modelUtils.debugInspect(modelData)));
    }

    validator
    .validate(this, modelData)
    .then(callback)
    .catch(function(err) {
      callback(new Exceptions.ModelValidation(err));
    });
  },

  // @todo move this into the clever-odm module
  timeStampable: function(modelData, callback) {
    if (this.modelType === 'ODM' && !!this.timeStampable) {
      modelData[this.createdAt] = Date.now();
      modelData[this.updatedAt] = Date.now();
    }
    callback(null);
  },

  beforeEvent: function(eventName, modelDataOrFindOptions, queryOptions, callback) {
    var listeners   = this.listeners(eventName).length
      , callbacks   = 0
      , errors      = [];

    if (listeners < 1) {
      return callback(null);
    }

    if (debug.enabled) {
      debug(util.format('Running hook, emitting %s(%s) on %s listeners...', eventName, modelUtils.debugInspect(modelDataOrFindOptions), listeners));
    }

    this.emit(eventName, modelDataOrFindOptions, queryOptions, function(err, updatedModelDataOrFindOptions) {
      if (err) {
        errors.push(err);
      } else if (updatedModelDataOrFindOptions !== undefined) {
        underscore.extend(modelDataOrFindOptions, updatedModelDataOrFindOptions);
      }

      if (++callbacks === listeners) {
        callback(errors.length ? errors.shift() : null);
      }
    });
  },

  afterEvent: function(eventName, modelDataOrFindOptions, queryOptions, model, callback) {
    var listeners   = this.listeners(eventName).length
      , callbacks   = 0
      , errors      = [];

    if (!callback) {
      callback = model;
      model = null;
    }

    modelUtils.aliasFieldsForOutput.apply(this, [modelDataOrFindOptions]);
    if (listeners < 1) {
      return callback(null, model);
    }

    this.emit(eventName, model, modelDataOrFindOptions, queryOptions, function(err, updatedModelDataOrFindOptions) {
      if (err) {
        errors.push(err);
      } else if (updatedModelDataOrFindOptions !== undefined) {
        underscore.extend(modelDataOrFindOptions, updatedModelDataOrFindOptions);
      }

      if (++callbacks === listeners) {
        callback(errors.length ? errors.shift() : null, model);
      }
    });
  },

  setupTimeStampable: function(Static) {
    if (Static.timeStampable === true) {
      Static.fields.createdAt = {
        type        : Date,
        columnName  : Static.createdAt
      };
      if (Static.createdAt !== 'createdAt') {
        Static.aliases.push({
          key         : 'createdAt',
          columnName  : Static.createdAt
        })
      }

      Static.fields.updatedAt = {
        type        : Date,
        columnName  : Static.updatedAt
      };
      if (Static.updatedAt !== 'updatedAt') {
        Static.aliases.push({
          key         : 'updatedAt',
          columnName  : Static.updatedAt
        })
      }
    }
  },
  
  setupSoftDeleteable: function(Static) {
    if (Static.softDeleteable === true) {
      Static.fields.deletedAt = {
        type        : Date,
        columnName  : Static.deletedAt
      };
      if (Static.deletedAt !== 'deletedAt') {
        Static.aliases.push({
          key         : 'deletedAt',
          columnName  : Static.deletedAt
        })
      }
    }
  },

  getSchemaFromProto: function(Proto, Static, key) {
    var prop        = Proto[key]
      , columnName  = !!Static.underscored ? inflect.underscore(key) : key;
     
    if (!!prop.columnName && key !== prop.columnName) {
      Static.aliases.push({ key: key, columnName: prop.columnName });
      columnName = prop.columnName;
    } else if (!!Static.underscored && key !== columnName) {
      Static.aliases.push({ key: key, columnName: columnName });
    }
    
    if (typeof prop === 'function' && [String, Number, Boolean, Date, Buffer, this.Types.ENUM, this.Types.TINYINT, this.Types.BIGINT, this.Types.FLOAT, this.Types.DECIMAL, this.Types.TEXT].indexOf(Proto[key]) === -1 && key !== 'defaults') {
      
      // Allow definition of custom getters and setters for fields, but make sure not to include association accessor functions.
      if (/^(set|get)(.*)$/.test(key)) {
        var getOrSet = RegExp.$1
          , fieldName = RegExp.$2;

        if (fieldName !== false && Static.fields[key] !== undefined && typeof Static.getters[key] === 'function') {
          Static[(getOrSet === 'get' ? 'getters' : 'setters')][key] = function() {
            return prop.apply(this, arguments);
          };
        }
      }
    } else if (key !== 'defaults') {

      if (typeof Static.fields !== 'object') {
        Static.fields = {};
      }

      if (typeof Static.getters !== 'object') {
        Static.getters = {};
      }

      if (typeof Static.setters !== 'object') {
        Static.setters = {};
      }

      Static.fields[key] = prop;
      Static.getters[key] = function() {
        if (key === 'id' && Static.type.toLowerCase() === 'odm') {
          return this.entity._id;
        } else {
          return this.entity.get(columnName);
        }
      };
      Static.setters[key]  = function(val) {
        this.entity.set(columnName, val);

        return this;
      };

      delete Proto[key];
    }
  },

  aliasAssociationsForQuery: function(data, remove, callback) {
    async.each(
      Object.keys(data),
      this.callback(modelUtils.aliasAssociationForQuery, data, remove),
      callback
     );
  },

  aliasAssociationForQuery: function(data, remove, fieldName, callback) {
    var associations    = this.Class ? this.Class.entity.associations : this.entity.associations
      , hasAssociation  = associations ? associations[fieldName] : false
      , isArray         = data[fieldName] instanceof Array;

    if (!!hasAssociation && data[fieldName] !== undefined && data[fieldName] !== null) {
      if (debug.enabled) {
        debug(util.format('aliasAssociationForQuery(%s)', modelUtils.debugInspect(fieldName)));
      }

      if (hasAssociation.associationType === 'BelongsTo') {
        if (!isArray) {
          if (data[fieldName].entity !== undefined) {
            data[hasAssociation.options.foreignKey] = data[fieldName].entity[hasAssociation.foreignKeyAttribute.referencesKey];
          } else {
            data[hasAssociation.options.foreignKey] = data[fieldName];
          }
        } else if (!!isArray) {
          data[fieldName] = data[fieldName].map(function(model) {
            return model.entity !== undefined ? model.entity : model;
          });
        }

        if (remove === true) {
          delete data[fieldName];
        }
      }
    }

    return callback ? callback(null) : true;
  },

  aliasFieldsForQuery: function(fields, callback) {
    if (Object.keys(fields).length > 0) {
      if (debug.enabled) {
        debug(util.format('aliasFieldsForQuery(%s)', modelUtils.debugInspect(fields)));
      }

      Object.keys(fields).forEach(function(key) {
        var val            = fields[key]
          , associations   = this.Class ? this.Class.entity.associations : this.entity.associations
          , hasAssociation = associations ? associations[key] : false
          , newKey;

        if ( !hasAssociation && !!( newKey = underscore.findWhere(this.aliases || this.Class.aliases, { key: key }) )) {
          fields[newKey.columnName] = val;
          delete fields[key];
        }
      }
      .bind(this));
    }

    return callback ? callback(null) : true;
  },

  aliasFieldsForOutput: function(fields, callback) {
    if (debug.enabled && !fields.where) {
      debug(util.format('aliasFieldsForOutput(%s)', modelUtils.debugInspect(Object.keys(fields))));
    }

    (this.aliases || this.Class.aliases).forEach(function(column) {
      var hasAssociation = (this.entity.associations || this.Class.entity.associations)[column.key];

      if (!hasAssociation && fields[column.columnName] !== undefined) {
        fields[column.key] = fields[column.columnName];
        delete fields[column.columnName];
      }
    }
    .bind(this));

    return callback ? callback(null) : fields;
  },

  aliasAssociationsForOutput: function(fields, callback) {
    if (this.entity.associations || this.Class.entity.associations) {
      if (debug.enabled) {
        debug(util.format('aliasAssociationsForOutput(%s)', modelUtils.debugInspect(Object.keys(fields))));
      }

      Object.keys(this.entity.associations || this.Class.entity.associations).forEach(function(includeName) {
        var options = (this.entity.associations || this.Class.entity.associations)[includeName].options;
        if (!!options.as && fields[options.foreignKey] !== undefined) {
          if (!fields[options.as]) {
            fields[options.as] = fields[options.foreignKey];
          }
          delete fields[options.foreignKey];
        }
      }.bind(this));
    }

    return callback ? callback(null) : fields;
  },

  updateReferencedModel: function(resolve, reject, err, model) {
    if ( !err ) {
      this.entity = model;
      resolve( this );
    } else {
      reject( err );
    }
  },

  removeReferencedModel: function(resolve, reject, err) {
    if (!err) {
      delete this.entity;
      resolve({});
    } else {
      if (debug.enabled) {
        debug(util.format('%s (%s) %s %s', chalk.red('Error'), err.parent ? err.parent.message : err.message, util.inspect(err.stack ? err.stack.split('\n') : err)));
      }
      reject(err);
    }
  },

  returnModels: function(resolve, reject, err, models) {
    if (err === undefined || err === null) {
      resolve(models);
    } else {
      if (debug.enabled) {
        debug(util.format('%s (%s) %s %s', chalk.red('Error'), err.parent ? err.parent.message : err.message, util.inspect(err.stack ? err.stack.split('\n') : err)));
      }
      reject(err);
    }
  },

  toJSON: function() {
    var json = {};
    try {

      // Add in getters
      Object.keys(this.Class.getters).forEach(this.proxy(function(getterName) {
        if (this[getterName] !== undefined) {
          json[getterName] = this[getterName];
        }
      }));

      if (this.Class.type === 'ORM') {
        if (this.entity.options.includeNames) {
          json = modelUtils.aliasFieldsForOutput.apply(this, [underscore.omit(underscore.clone(this.entity.values), this.entity.options.includeNames)]);

          this.entity.options.includeNames.forEach(this.proxy(function(includeName) {
            var toJSON  = this.entity[includeName] ? this.entity[includeName].toJSON : false
              , subJSON = toJSON ? toJSON.apply(this.entity[includeName]) : this.entity[includeName];

            json[includeName] = underscore.clone(subJSON);
          }));

          modelUtils.aliasAssociationsForOutput.apply(this, [json]);
        } else {
          json = modelUtils.aliasFieldsForOutput.apply(this, [underscore.clone(this.entity.values)]);
        }
      } else {
        json = this.entity.toObject();
      }
    } catch(e) {
      console.error(e);
      console.error(e.stack);
    }

    return json;
  },

  ensureFindOptionsValid: function(findOptions, callback) {
    callback(!findOptions ? new Exceptions.InvalidData(util.format('You must specify either an id or an object containing fields to find a %s', that._name)) : null);
  }
};

module.exports = modelUtils;