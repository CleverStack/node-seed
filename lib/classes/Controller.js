var Exceptions = require('exceptions')
  , models     = require('models')
  , injector   = require('injector')
  , underscore = require('underscore')
  , Controller = require('clever-controller');

module.exports = Controller.extend(
/* @Static */
{
  app     : injector.getInstance('app'),
  service : null
},
/* @Prototype */
{
  getOptionsForService: function() {
    var options = {
      where: underscore.extend(underscore.omit(this.req.params, 'action'), underscore.omit(this.req.query, '_include', '_limit', '_offset')),
    };
    if (this.req.query._limit) {
      options.limit = this.req.query._limit;
    }
    if (this.req.query._offset) {
      options.offset = this.req.query._offset;
    }
    return this.processIncludes(options);
  },

  param: function(name) {
    return this.req.params[name] || this.req.body[name] || this.req.query[name];
  },

  processIncludes: function(options) {
    if (!!this.req.query._include) {
      options.include = [];

      this.req.query._include.split(',').forEach(function(include) {
        include = include.split('|');
        var queryInclude = { model: models[include[0]] };
        if (include.length > 1) {
          queryInclude.as = include[1];
        }
        options.include.push(queryInclude);
      });
    }
    return options;
  },

  handleServiceMessage: function(obj) {
    if (!!this.responseSent) {
      return;
    }
    
    if (obj.statusCode) {
      this.send(obj.message, obj.statusCode);
    } else if (obj instanceof Exceptions.DuplicateModel || obj instanceof Exceptions.InvalidData || obj instanceof Exceptions.ModelValidation) {
      this.send({ statusCode: 400, message: obj.message }, 400);
    } else if (obj instanceof Exceptions.ModelNotFound) {
      this.send({ statusCode: 404, message: obj.message }, 404);
    } else if (obj instanceof Error) {
      this.send({ statusCode: 500, message: obj.message, stack: obj.stack ? obj.stack.replace(new RegExp(injector.getInstance('appRoot'), 'ig'), '.').split('\n') : obj.stack }, 500);
    } else {
      this.send(obj, 200);
    }
  },

  listAction: function() {
    var service     = this.Class.service !== null ? this.Class.service : false
      , model       = service && service.model !== undefined ? service.model : false;

    if (!!service && !!model) {
      return this.Class.service.findAll(this.getOptionsForService());
    } else {
      this.next();
    }
  },

  getAction: function() {
    var service     = this.Class.service !== null ? this.Class.service : false
      , model       = service && service.model !== undefined ? service.model : false
      , findOptions;

    if (!!service && !!model) {
      if ((findOptions = this.getOptionsForService()) && typeof this.param('id') === 'undefined') {
        this.action = 'listAction';
        return this.listAction.apply(this, arguments);
      } else {
        return this.Class.service.find(findOptions);
      }
    } else {
      this.next();
    }
  },

  postAction: function() {
    var service     = this.Class.service !== null ? this.Class.service : false
      , model       = service && service.model !== undefined ? service.model : false
      , findOptions;

    if (!!service && !!model) {
      if (!!this.param('id')) {
        this.action = 'putAction';
        return this.putAction.apply(this, arguments);
      }

      if ((findOptions = this.getOptionsForService()) && Object.keys(findOptions.where).length) {
        return this.Class.service.findOrCreate(findOptions, this.req.body, {});
      } else {
        return this.Class.service.create(this.req.body, {});
      }
    } else {
      this.next();
    }
  },

  putAction: function() {
    var service     = this.Class.service !== null ? this.Class.service : false
      , model       = service && service.model !== undefined ? service.model : false
      , findOptions;

    if (!!service && !!model) {
      if (!this.param('id')) {
        this.action = 'postAction';
        return this.postAction.apply(this, arguments);
      }

      if ((findOptions = this.getOptionsForService()) && Object.keys(underscore.omit(findOptions.where, 'id')).length) {
        return this.Class.service.findAndUpdate(findOptions, underscore.omit(this.req.body, 'id', 'createdAt', 'updatedAt'), {});
      } else {
        findOptions.where.id = this.param('id');
        return this.Class.service.update(underscore.omit(this.req.body, 'id', 'createdAt', 'updatedAt'), findOptions);
      }
    } else {
      this.next();
    }
  },

  deleteAction: function() {
    var service     = this.Class.service !== null ? this.Class.service : false
      , model       = service && service.model !== undefined ? service.model : false
      , findOptions;

    if (!!service && !!model) {
      findOptions = this.getOptionsForService();

      if (underscore.omit(Object.keys(findOptions.where), 'id').length) {
        return this.Class.service.findAndDestroy(findOptions);
      } else {
        findOptions.where.id = this.param('id');
        return this.Class.service.destroy(findOptions);
      }
    } else {
      this.next();
    }
  }
});