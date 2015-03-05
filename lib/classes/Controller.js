var Exceptions       = require('exceptions')
  , models           = require('models')
  , injector         = require('injector')
  , underscore       = require('underscore')
  , CleverController = require('clever-controller')
  , Controller;

/**
 * @class    Controller
 * @extends  CleverController
 */
Controller = CleverController.extend(
/**
 * @lends Controller
 */
{
  /**
   * Express Application reference for Controller to autoRoute with
   * @type {Express}
   */
  app: injector.getInstance('app'),

  /**
   * A Reference to a service to use with this Controller, to provide automatic CRUD.
   * @type {Service}
   */
  service: null
},
/**
 * @lends Controller#
 */
{
  /**
   * Helper function that can be used to get the findOptions object for a Service to use with its Model.
   * 
   * @function Controller#getOptionsForService
   * @return {Object} containing where, limit, offset and includes.
   */
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

  /**
   * Helper function that can be used to get a param by name first from req.params, then req.body or lastly req.query
   *
   * @function Controller#param
   * @param  {String} name the name of the param you want the value for
   * @return {Mixed}
   */
  param: function(name) {
    return this.req.params[name] || this.req.body[name] || this.req.query[name];
  },

  /**
   * Helper function that can be used to pre-process includes for findOptions
   *
   * @function Controller#processIncludes
   * @param  {Object} findOptions typically the result of Controller#getOptionsForService
   * @return {Object} the findOptions
   */
  processIncludes: function(findOptions) {
    if (!!this.req.query._include) {
      findOptions.include = [];

      this.req.query._include.split(',').forEach(function(include) {
        include = include.split('|');
        var queryInclude = { model: models[include[0]] };
        if (include.length > 1) {
          queryInclude.as = include[1];
        }
        findOptions.include.push(queryInclude);
      });
    }
    return findOptions;
  },

  /**
   * Helper function to check the response for Exceptions, Errors and the like.
   *
   * @function Controller#handleServiceMessage
   * @param  {Mixed} response   the response that need's to be sent to the user
   */
  handleServiceMessage: function(response) {
    if (!!this.responseSent) {
      return;
    }
    
    if (response.statusCode) {
      this.send(response.message, response.statusCode);
    } else if (response instanceof Exceptions.DuplicateModel || response instanceof Exceptions.InvalidData || response instanceof Exceptions.ModelValidation) {
      this.send({ statusCode: 400, message: response.message }, 400);
    } else if (response instanceof Exceptions.ModelNotFound) {
      this.send({ statusCode: 404, message: response.message }, 404);
    } else if (response instanceof Error) {
      this.send({ statusCode: 500, message: response.message, stack: response.stack ? response.stack.replace(new RegExp(injector.getInstance('appRoot'), 'ig'), '.').split('\n') : response.stack }, 500);
    } else {
      this.send(response, 200);
    }
  },

  /**
   * Default Read List CRUD Action, only works if you set Controller.service
   * @function Controller#listAction
   */
  listAction: function() {
    var service     = this.Class.service !== null ? this.Class.service : false
      , model       = service && service.model !== undefined ? service.model : false;

    if (!!service && !!model) {
      return this.Class.service.findAll(this.getOptionsForService());
    } else {
      this.next();
    }
  },

  /**
   * Default Read CRUD Action, only works if you set Controller.service
   * @function Controller#getAction
   */
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

  /**
   * Default Create CRUD Action, only works if you set Controller.service
   * @function Controller#postAction
   */
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

  /**
   * Default Update CRUD Action, only works if you set Controller.service
   * @function Controller#putAction
   */
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

  /**
   * Default Delete CRUD Action, only works if you set Controller.service
   * @function Controller#deleteAction
   */
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

module.exports = Controller;
