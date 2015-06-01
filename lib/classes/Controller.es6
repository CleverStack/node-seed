import Exceptions       from 'Exceptions';
import models           from 'models';
import injector         from 'injector';
import underscore       from 'underscore';
import CleverController from 'CleverController';

exports class Controller extends CleverController {
  static app     = injector.getInstance('app');
  static service = null;
  
  getOptionsForService() {
    let options = {
      where: underscore.extend(
        underscore.omit(this.req.params, 'action'),
        underscore.omit(this.req.query, '_include', '_limit', '_offset')
      )
    }
    
    if (this.req.query._limit) {
      options.limit = this.req.query._limit;
    }
    if (this.req.query._offset) {
      options.offset = this.req.query._offset;
    }

    return this.processIncludes(options);
  }

  param(name) {
    return this.req.params[name] || this.req.body[name] || this.req.query[name];
  }

  processIncludes(findOptions) {
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
  }

  handleServiceMessage(response) {
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
  }

  listAction() {
    var service     = Controller.service !== null ? Controller.service : false
      , model       = service && service.model !== undefined ? service.model : false;

    if (!!service && !!model) {
      return service.findAll(this.getOptionsForService());
    } else {
      this.next();
    }
  }

  getAction() {
    var service     = Controller.service !== null ? Controller.service : false
      , model       = service && service.model !== undefined ? service.model : false
      , findOptions;

    if (!!service && !!model) {
      if ((findOptions = this.getOptionsForService()) && typeof this.param('id') === 'undefined') {
        this.action = 'listAction';
        return this.listAction.apply(this, arguments);
      } else {
        return service.find(findOptions);
      }
    } else {
      this.next();
    }
  }

  postAction() {
    var service     = Controller.service !== null ? Controller.service : false
      , model       = service && service.model !== undefined ? service.model : false
      , findOptions;

    if (!!service && !!model) {
      if (!!this.param('id')) {
        this.action = 'putAction';
        return this.putAction.apply(this, arguments);
      }

      if ((findOptions = this.getOptionsForService()) && Object.keys(findOptions.where).length) {
        return service.findOrCreate(findOptions, {defaults: this.req.body});
      } else {
        return service.create(this.req.body, {});
      }
    } else {
      this.next();
    }
  }

  putAction() {
    var service     = Controller.service !== null ? Controller.service : false
      , model       = service && service.model !== undefined ? service.model : false
      , findOptions;

    if (!!service && !!model) {
      if (!this.param('id')) {
        this.action = 'postAction';
        return this.postAction.apply(this, arguments);
      }

      if ((findOptions = this.getOptionsForService()) && Object.keys(underscore.omit(findOptions.where, 'id')).length) {
        return service.findAndUpdate(findOptions, underscore.omit(this.req.body, 'id', 'createdAt', 'updatedAt'), {});
      } else {
        findOptions.where.id = this.param('id');
        return service.update(underscore.omit(this.req.body, 'id', 'createdAt', 'updatedAt'), findOptions);
      }
    } else {
      this.next();
    }
  }

  deleteAction() {
    var service   = Controller.service !== null ? Controller.service : false
      , model     = service && service.model !== undefined ? service.model : false
      , findOptions;

    if (!!service && !!model) {
      findOptions = this.getOptionsForService();

      if (underscore.omit(Object.keys(findOptions.where), 'id').length) {
        return service.findAndDestroy(findOptions);
      } else {
        findOptions.where.id = this.param('id');
        return service.destroy(findOptions);
      }
    } else {
      this.next();
    }
  }
}