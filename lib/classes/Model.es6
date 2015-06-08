import injector from 'injector';
import utils    from 'utils';
import {Class}  from 'classes';
import _        from 'underscore';

export default class Model extends Class {
  static Types         = utils.model.helpers.types;
  static defaults      = utils.model.helpers.options.default;
  static validator     = utils.model.helpers.validator;
  static eventNames    = utils.model.helpers.eventNames;
  static hasOne        = utils.model.helpers.associateModel('hasOne');
  static hasMany       = utils.model.helpers.associateModel('hasMany');
  static belongsTo     = utils.model.helpers.associateModel('belongsTo');
  static extend        = utils.model.extend;
  static transaction   = utils.model.helpers.transaction;

  static create(values, queryOptions) {
    var utilName      = this.type.toLowerCase() + 'Utils'
      , helpers       = utils.model.helpers
      , driverUtil    = utils[utilName]
      , timeStampable = utils.model.behaviours.timeStampable.beforeCreate;
    
    queryOptions      = utils.model.helpers.queryOptions.normalize(queryOptions);

    if (this.debug.enabled) {
      this.debug('create(%s)', utils.model.helpers.debugInspect(values));
    }

    return new Promise((resolve, reject) => {
      async.waterfall([
        this.proxy(helpers.isExtendedModel),
        this.proxy(helpers.isNewModel,                  values),
        this.proxy(helpers.defaultValues,               values),
        this.proxy(helpers.alias.fields.forOutput,      values),
        this.proxy(helpers.validator,                   values),
        this.proxy(timeStampable,                       values),
        this.proxy(helpers.events.beforeEvent,          'beforeCreate', values, queryOptions),
        this.proxy(helpers.alias.associations.forQuery, values, false),
        this.proxy(helpers.alias.fields.forQuery,       values),
        this.proxy(driverUtil.create,                   values, queryOptions),
        this.proxy(helpers.events.afterEvent,           'afterCreate', values, queryOptions)
      ],
      this.proxy(helpers.handleResult.returnModels, resolve, reject));
    });
  }

  static find(findOptions, queryOptions = {}) {
    var utilName       = this.type.toLowerCase() + 'Utils'
      , helpers        = utils.model.helpers
      , driverUtil     = utils[utilName]
      , softDeleteable = utils.model.behaviours.softDeleteable.criteria;

    findOptions        = helpers.findOptions.normalize(findOptions);
    queryOptions       = helpers.queryOptions.normalize(queryOptions);

    if (this.debug.enabled) {
      this.debug('find(%s)', helpers.debugInspect(findOptions));
    }

    return new Promise((resolve, reject) => {
      async.waterfall([
        this.proxy(helpers.isExtendedModel),
        this.proxy(helpers.criteria.requirePrimaryKeys, findOptions),
        this.proxy(helpers.events.beforeEvent,          'beforeAllFindersOptions', findOptions, queryOptions),
        this.proxy(helpers.events.beforeEvent,          'beforeFindOptions', findOptions, queryOptions),
        this.proxy(helpers.findOptions.valid,           findOptions), // @todo needed anymore?
        this.proxy(helpers.alias.fields.forQuery,       findOptions.where),
        this.proxy(helpers.alias.associations.forQuery, findOptions.where, true),
        this.proxy(softDeleteable,                      findOptions, queryOptions),
        this.proxy(helpers.events.beforeEvent,          'beforeFind', findOptions, queryOptions),
        this.proxy(driverUtil.find,                     findOptions, queryOptions),
        this.proxy(helpers.events.afterEvent,           'afterFind', findOptions, queryOptions)
      ],
      this.proxy(helpers.handleResult.returnModels, resolve, reject));
    });
  }


  static findAll       = utils.model.findAll;
  static findOrCreate  = utils.model.findOrCreate;
  static findAndUpdate = utils.model.findAndUpdate;
  static update        = utils.model.update;
  static destroy       = utils.model.destroy;
  static models        = {};

  static getDefinedModels() {
    return this.models;
  }

  constructor(...args) {
    super(args);

    // Somewhere here we will need a "Relfection" to find out the Super/Parent Class
    utils.model.instance.setup.apply(this, args);
  }

  map     = utils.model.instance.map;
  save    = utils.model.instance.save;
  destroy = utils.model.instance.destroy;
  toJSON  = utils.model.instance.toJSON;
  inspect = utils.model.instance.customInspect;

  // @todo restore/revert
  // @todo refresh/reload
}
