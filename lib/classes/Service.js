var injector    = require('injector')
  , exceptions  = require('exceptions')
  , Classes     = require('classes')
  , underscore  = require('underscore')
  , Class       = Classes.Class
  , Model       = Classes.Model
  , Promise     = injector.getInstance('Promise')
  , util        = require('util')
  , utils       = require('utils')
  , debug       = require('debug')('cleverstack:services')
  , services    = {}
  , Service;

/**
 * @classdesc CleverStack Service Class
 * @class     Service
 * @extends   Class
 */
Service = Class.extend(
/** @lends Service **/
{
  model: null,

  db: null
},
/** @lends Service# */
{
  db: false,

  model: false,

  // Currently only supports Sequelize
  // @TODO this needs a serious refactor
  query: function(sql, raw) {
    raw = raw || false;
    this.db.query(sql, null, { raw: raw });
  },

  transaction: function(queryOptions) {
    var service = this;

    queryOptions = queryOptions || {};

    return new Promise(function transaction(resolve, reject) {
      if (queryOptions.transaction) {
        resolve(queryOptions);
      } else {
        service.db.transaction({ autocommit: false }).then(function(transaction) {
          if (transaction) {
            queryOptions.transaction = transaction;
            resolve(queryOptions);
          } else {
            reject(transaction);
          }
        });
      }
    });
  },

  // Create a new model
  create: function(values, queryOptions) {
    var service = this;

    values         = values || {};
    queryOptions = queryOptions || {};

    return new Promise(function create(resolve, reject) {
      if (!service.model) {
        reject(new Error('Model not found, either set ' + service._name + '.model or implement ' + service._name + '.create()'));
        return;
      }

      if (!!values.id) {
        reject(new exceptions.DuplicateModel('Unable to create a new ' + service.model.modelName + ', identity already exists.'));
      }

      service
        .model
        .create(values, queryOptions)
        .then(resolve)
        .catch(reject);
    });
  },

  // Find one record using either id or a where {}
  find: function(idOrFindOptions, queryOptions) {
    idOrFindOptions  = (typeof idOrFindOptions !== 'object') ? {where:{id: idOrFindOptions}} : idOrFindOptions;
    if (!idOrFindOptions.where) {
      idOrFindOptions = {where: idOrFindOptions};
    }
    queryOptions    = queryOptions || {};

    return new Promise(function find(resolve, reject) {
      if (!this.model) {
        reject('Model not found, either set ' + this._name + '.model or implement ' + this._name + '.find()');
        return;
      }

      if (typeof idOrFindOptions === 'object' && this.model.type === 'ORM') {
        Object.keys(idOrFindOptions.where).forEach(function(name) {
          if (idOrFindOptions.where[ name ] === 'null') {
            idOrFindOptions.where[ name ] = null;
          }
        });
      }

      this
        .model
        .find(idOrFindOptions, queryOptions)
        .then(this.callback(function(model) {
          if (model !== null && !!model) {
            resolve(model);
          } else {
            reject(new exceptions.ModelNotFound(this.model.modelName + ' doesn\'t exist.'));
          }
        }))
        .catch(reject);

    }
    .bind(this));
  },

  findOrCreate: function(idOrFindOptions, queryOptions) {
    idOrFindOptions  = (typeof idOrFindOptions !== 'object') ? {where:{id: idOrFindOptions}} : idOrFindOptions;
    queryOptions = queryOptions || {};

    if (!queryOptions.where) {
      queryOptions.where = queryOptions;
    }

    return new Promise(function findOrCreate(resolve, reject) {
      if (!this.model) {
        reject('Model not found, either set ' + this._name + '.model or implement ' + this._name + '.find()');
        return;
      }

      if (typeof idOrFindOptions === 'object' && typeof idOrFindOptions.where === 'object' && this.model.type === 'ORM') {
        Object.keys(idOrFindOptions.where).forEach(function(name) {
          if (idOrFindOptions.where[ name ] === 'null') {
            idOrFindOptions.where[ name ] = null;
          }
        });
      }

      this.model
        .findOrCreate(idOrFindOptions, queryOptions)
        .then(resolve)
        .catch(reject);
    }
    .bind(this));
  },

  // Find more than one record using using a where {}
  findAll: function(idOrFindOptions, queryOptions) {
    idOrFindOptions  = (typeof idOrFindOptions !== 'object') ? {where:{id: idOrFindOptions}} : idOrFindOptions;
    if (!idOrFindOptions.where) {
      idOrFindOptions = {where: idOrFindOptions};
    }
    queryOptions    = queryOptions || {};

    return new Promise(function findAll(resolve, reject) {
      if (!this.model) {
        reject('Model not found, either set ' + this._name + '.model or implement ' + this._name + '.find()');
        return;
      }

      if (typeof idOrFindOptions === 'object' && this.model.type === 'ORM') {
        Object.keys(idOrFindOptions.where).forEach(function(name) {
          if (idOrFindOptions.where[ name ] === 'null') {
            idOrFindOptions.where[ name ] = null;
          }
        });
      }

      this
        .model
        .findAll(idOrFindOptions, queryOptions)
        .then(resolve)
        .catch(reject);
    }
    .bind(this));
  },

  update: function(values, queryOptions) {
    values = (typeof values === 'object') ? values : {};
    queryOptions = (typeof queryOptions !== 'object') ? {where:{id: queryOptions}} : queryOptions;
    if (!queryOptions.where) {
      queryOptions = {where: queryOptions};
    }

    return new Promise(function update(resolve, reject) {
      if (!this.model) {
        reject('Model not found, either set ' + this._name + '.model or implement ' + this._name + '.find()');
        return;
      }

      if (!queryOptions || queryOptions === null || !queryOptions.where) {
        reject(new exceptions.ModelNotFound('Unable to update ' + this.model.modelName + ', unable to determine identity.'));
      }

      if (!values || !Object.keys(values).length) {
        reject(new exceptions.InvalidData('Unable to update ' + this.model.modelName + ', you did not provide any data.'));
      }

      this
        .model
        .update(values, queryOptions)
        .then(this.proxy(function(user) {
          if (!!user) {
            resolve(user);
          } else {
            reject(new exceptions.ModelNotFound(this.model.modelName + ' doesn\'t exist.'));
          }
        }))
        .catch(reject);
    }
    .bind(this));
  },

  // Find one record and update it using either id or a where {}
  findAndUpdate: function(values, queryOptions) {
    var service = this;

    queryOptions = queryOptions || {};
    if (!queryOptions.where) {
      queryOptions.where = {
        id: queryOptions
      };
    }

    return new Promise(function update(resolve, reject) {
      if (!service.model) {
        reject('Model not found, either set ' + service._name + '.model or implement ' + service._name + '.find()');
        return;
      }

      if (!queryOptions || queryOptions === null) {
        reject(new exceptions.ModelNotFound('Unable to update ' + service.model.modelName + ', unable to determine identity.'));
      }

      if (!values) {
        reject(new exceptions.InvalidData('Unable to update ' + service.model.modelName + ', you did not provide any data.'));
      }

      service.model
        .find(underscore.pick(queryOptions, 'where'), values)
        .then(function(user) {
          if (!!user) {
            
            user.save(values, queryOptions)
              .then(resolve)
              .catch(reject);

          } else {
            reject(new exceptions.ModelNotFound(service.model.modelName + ' doesn\'t exist.'));
          }
        })
        .catch(reject);

    });
  },

  // Find one record and delete it using either id or a where {}
  destroy: function(queryOptions) {
    queryOptions = (typeof queryOptions !== 'object') ? {where:{id: queryOptions}} : queryOptions;
    if (!queryOptions.where) {
      queryOptions = {where: queryOptions};
    }

    return new Promise(function destroy(resolve, reject) {
      if (!this.model) {
        reject('Model not found, either set ' + this._name + '.model or implement ' + this._name + '.find()');
        return;
      }

      if (!queryOptions || queryOptions === null || !queryOptions.where) {
        reject(new exceptions.ModelNotFound('Unable to delete ' + this.model.modelName + ', unable to determine identity.'));
      }

      this
        .model
        .destroy(queryOptions)
        .then(resolve)
        .catch(reject);
    }
    .bind(this));
  }
});

module.exports.Class  = Service;

module.exports.extend = function() {
  var extendingArgs   = [].slice.call(arguments)
    , serviceName     = (typeof extendingArgs[ 0 ] === 'string') ? extendingArgs.shift() : false
    , Static          = (extendingArgs.length === 2) ? extendingArgs.shift() : {}
    , Proto           = extendingArgs.shift();
  
  if (!serviceName) {
    if ((serviceName = utils.helpers.getClassName(3)) === false) {
      throw new Error('Unable to determine services location and name.');
    }
  }

  if (services[ serviceName ] !== undefined) {
    debug('Returning previously defined service ' + serviceName + '...');
    return services[ serviceName ];
  }

  debug('Setting up ' + serviceName + '...');

  Proto._name = Static._name = serviceName;

  if (!!Proto.model) {
    if (Proto.model.extend === Model.extend) {
      debug('Using the ' + Proto.model.modelName + ' model for default (restful) CRUD on this service...');

      Proto.db = Proto.model.connection;
      Static.db = Proto.db;
      Static.model = Proto.model;

    } else {
      debug(util.inspect(Proto));
      throw new Error('Unknown model type passed to Service.extend(), set environment variable DEBUG=Services for more information.');
    }
  } else if (!!Proto.db) {
    debug('Setting db adapter for service...');
    Static.db = Proto.db;
  }

  debug('Creating service class...');
  var Klass = Service.callback('extend')(Static, Proto)
    , instance = Klass.callback('newInstance')();

  debug('Parsing templated event handlers...');
  Object.keys(Proto).forEach(function(propName) {
    if (propName.indexOf(' ') !== -1) {
      var parts       = propName.split(' ')
        , resource    = parts.shift()
        , eventName   = parts.shift();

      injector.getInstance(resource).on(eventName, instance.proxy(propName));
    }
  });

  services[ serviceName ] = instance;

  return instance;
};

module.exports.getDefinedServices = function() {
  return services;
};
