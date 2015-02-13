var util        = require('util')
  , async       = require('async')
  , inflect     = require('i')()
  , underscore  = require('underscore')
  , inspectUtil = require('util').inspect
  , Exceptions  = require('exceptions')
  , chalk       = require('chalk');

var modelUtils  = {

    debugInspect: function(obj) {
        return inspectUtil(obj, {showHidden: false, colors: true, customInspect: true, depth: 0}).replace(/\n[\ ]+/igm, ' ');
        // return inspectUtil(obj, {showHidden: false, colors: true, customInspect: true, depth: 0}).replace(/(\n[\ ]+|\{\ )/igm, '\n\ \ \ \ ');
    },

    isValidSchema: function(callback) {
        callback(this._model.name !== null ? null : 'You cannot call Model.create() directly on the model class.');
    },

    isNewModel: function(modelData, callback) {
        if (this.debug.enabled) {
            this.debug(util.format('isNewModel(%s)', modelUtils.debugInspect(modelData)));
        }

        async.each(
            this.primaryKey || this.Class.primaryKey || [],
            this.callback(function checkPrimaryKeys(key, checkDone) {
                if (this._schema[key] && !!this._schema[key].autoIncrement) {
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

    setDefaultValues: function(modelData, callback) {
        async.each(
            Object.keys(this._schema || this.Class._schema),
            this.callback(modelUtils.setDefaultValue, modelData),
            callback
       );
    },

    setDefaultValue: function(modelData, fieldName, callback) {
        var field           = this._schema[fieldName]
          , value           = modelData[fieldName]
          , defaultValue    = field['default'];

        if (field.type && value === undefined && defaultValue !== undefined) {
            if (this.debug.enabled) {
                this.debug(util.format('setDefaultValue(%s=%s)', fieldName, modelUtils.debugInspect(defaultValue)));
            }
            modelData[fieldName] = defaultValue;
        }

        callback(null);
    },

    validateValues: function(validator, modelData, callback) {
        if (this.debug.enabled) {
            this.debug(util.format('validateValues(%s)', modelUtils.debugInspect(modelData)));
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

        if (this.debug.enabled) {
            this.debug(util.format('Running hook, emitting %s(%s) on %s listeners...', eventName, modelUtils.debugInspect(modelDataOrFindOptions), listeners));
        }

        this.emit(eventName, modelDataOrFindOptions, queryOptions, function(err) {
            if (err) {
                errors.push(err);
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
            Static._schema.createdAt = {
                type        : Date,
                columnName  : Static.createdAt
            };
            if (Static.createdAt !== 'createdAt') {
                Static._aliases.push({
                    key         : 'createdAt',
                    columnName  : Static.createdAt
                })
            }

            Static._schema.updatedAt = {
                type        : Date,
                columnName  : Static.updatedAt
            };
            if (Static.updatedAt !== 'updatedAt') {
                Static._aliases.push({
                    key         : 'updatedAt',
                    columnName  : Static.updatedAt
                })
            }
        }
    },
    
    setupSoftDeleteable: function(Static) {
        if (Static.softDeleteable === true) {
            Static._schema.deletedAt = {
                type        : Date,
                columnName  : Static.deletedAt
            };
            if (Static.deletedAt !== 'deletedAt') {
                Static._aliases.push({
                    key         : 'deletedAt',
                    columnName  : Static.deletedAt
                })
            }
        }
    },

    getSchemaFromProto: function(Proto, Static, key) {
        var prop        = Proto[key]
          , columnName  = !!this.underscored ? inflect.underscore(key) : key;
         
        if (!!prop.columnName && key !== prop.columnName) {
            Static._aliases.push({ key: key, columnName: prop.columnName });
            columnName = prop.columnName;
        } else if (!!Static.underscored && key !== columnName) {
            Static._aliases.push({ key: key, columnName: columnName });
        }
        
        if (typeof prop === 'function' && [String, Number, Boolean, Date, Buffer, this.Types.ENUM, this.Types.TINYINT, this.Types.BIGINT, this.Types.FLOAT, this.Types.DECIMAL, this.Types.TEXT].indexOf(Proto[key]) === -1 && key !== 'defaults') {

        } else if (key !== 'defaults') {

            if (typeof Static._schema !== 'object') {
                Static._schema = {};
            }

            if (typeof Static._getters !== 'object') {
                Static._getters = {};
            }

            if (typeof Static._setters !== 'object') {
                Static._setters = {};
            }

            Static._schema[key] = prop;
            Static._getters[key] = function() {
                if (key === 'id' && Static.type.toLowerCase() === 'odm') {
                    return this._model._id;
                } else {
                    return this._model.get(columnName);
                }
            };
            Static._setters[key]  = function(val) {
                this._dirty         = true;
                this._model.set(columnName, val);
                this._changed.push(key);

                return this;
            };

            delete Proto[key];
        }
    },

    aliasAssociationsForQuery: function(data, callback) {
        async.each(
            Object.keys(data),
            this.callback(modelUtils.aliasAssociationForQuery, data),
            callback
       );
    },

    aliasAssociationForQuery: function(data, fieldName, callback) {
        var hasAssociation  = (this._model.associations || this.Class._model.associations)[fieldName]
          , isArray         = data[fieldName] instanceof Array;

        if (!!hasAssociation && data[fieldName] !== undefined && data[fieldName] !== null) {
            if (this.debug.enabled) {
                this.debug(util.format('aliasAssociationForQuery(%s)', modelUtils.debugInspect(fieldName)));
            }

            if (hasAssociation.associationType === 'BelongsTo') {
                if (!isArray) {
                    if (data[fieldName]._model !== undefined) {
                        data[hasAssociation.options.foreignKey] = data[fieldName]._model[hasAssociation.foreignKeyAttribute.referencesKey];
                    } else {
                        data[hasAssociation.options.foreignKey] = data[fieldName];
                    }
                    // delete data[fieldName];
                } else if (!!isArray) {
                    data[fieldName] = data[fieldName].map(function(model) {
                        return model._model !== undefined ? model._model : model;
                    });
                }
            } else {
                // delete data[fieldName];
            }
        }

        return callback ? callback(null) : true;
    },

    aliasFieldsForQuery: function(fields, callback) {
        if (Object.keys(fields).length > 0) {
            if (this.debug.enabled) {
                this.debug(util.format('aliasFieldsForQuery(%s)', modelUtils.debugInspect(fields)));
            }

            Object.keys(fields).forEach(function(key) {
                var val            = fields[key]
                  , hasAssociation = (this._model.associations || this.Class._model.associations)[key]
                  , newKey;

                if ( !hasAssociation && !!( newKey = underscore.findWhere(this._aliases || this.Class._aliases, { key: key }) )) {
                    fields[newKey.columnName] = val;
                    delete fields[key];
                }
            }
            .bind(this));
        }

        return callback ? callback(null) : true;
    },

    aliasFieldsForOutput: function(fields, callback) {
        if (this.debug.enabled && !fields.where) {
            this.debug(util.format('aliasFieldsForOutput(%s)', modelUtils.debugInspect(fields)));
        }

        (this._aliases || this.Class._aliases).forEach(function(column) {
            var hasAssociation = (this._model.associations || this.Class._model.associations)[column.key];

            if (!hasAssociation && fields[column.columnName] !== undefined) {
                fields[column.key] = fields[column.columnName];
                delete fields[column.columnName];
            }
        }
        .bind(this));

        return callback ? callback(null) : fields;
    },

    aliasAssociationsForOutput: function(fields, callback) {
        if (this._model.associations || this.Class._model.associations) {
            if (this.debug.enabled) {
                this.debug(util.format('aliasAssociationsForOutput(%s)', modelUtils.debugInspect(fields)));
            }

            Object.keys(this._model.associations || this.Class._model.associations).forEach(function(includeName) {
                var options = (this._model.associations || this.Class._model.associations)[includeName].options;
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
            this._setModel(model);
            resolve( this );
        } else {
            reject( err );
        }
    },

    removeReferencedModel: function(resolve, reject, err /*, model*/) {
        if ( !err ) {
            delete this._model;
            resolve({});
        } else {
            reject( err );
        }
    },

    returnModels: function(resolve, reject, err, models) {
        if (err === undefined || err === null) {
            resolve(models);
        } else {
            if (this.debug.enabled) {
                this.debug(util.format('%s (%s) %s', chalk.red('Error'), util.inspect(err.stack.split('\n'))));
            }

            reject(err);
        }
    },

    toJSON: function() {
        var json;
        try {
            if (this.Class.type === 'ORM') {
                if (this._model.options.includeNames) {
                    json = underscore.omit(this._model.values, this._model.options.includeNames);

                    this._model.options.includeNames.forEach(function(includeName) {
                        json[includeName] = JSON.parse(JSON.stringify(this._model[includeName]));
                    }.bind(this));
                } else {
                    json = underscore.clone(this._model.values);
                }
            } else {
                json = this._model.toObject();

                // Add in the id if we have it defined
                if (!!json._id) {
                    json.id = json._id;
                    delete json._id;
                }
            }

            // Add in getters
            Object.keys(this.Class._getters).forEach(function(getterName) {
                if (json[getterName] === undefined && this[getterName] !== undefined) {
                    json[getterName] = this[getterName];
                }
            }.bind(this));

            modelUtils.aliasFieldsForOutput.apply(this, [json]);
            modelUtils.aliasAssociationsForOutput.apply(this, [json]);
        } catch(e) {
            console.error(e);
        }

        return json;
    },

    ensureFindOptionsValid: function(findOptions, callback) {
        callback(!findOptions ? new Exceptions.InvalidData(util.format('You must specify either an id or an object containing fields to find a %s', that._name)) : null);
    },

    reload: function(modelData, queryOptions, model, callback) {
        model._model.reload(queryOptions).then(function(m) {
            console.dir(arguments);
        })
    }
};

module.exports = modelUtils;