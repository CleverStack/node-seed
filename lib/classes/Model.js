var injector     = require('injector')
  , utils        = require('utils')
  , Class        = injector.getInstance('Class')
  , modelUtils   = utils.model
  , helpers      = modelUtils.helpers
  , instance     = modelUtils.instance
  , models       = {}
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
  Types         : helpers.types,

  defaults      : helpers.options.defaults,
  validator     : helpers.validator,
  eventNames    : helpers.eventNames,

  hasOne        : helpers.associateModel('hasOne'),
  hasMany       : helpers.associateModel('hasMany'),
  belongsTo     : helpers.associateModel('belongsTo'),

  extend        : modelUtils.extend,

  create        : modelUtils.create,
  find          : modelUtils.find,
  findAll       : modelUtils.findAll,
  findOrCreate  : modelUtils.findOrCreate,
  findAndUpdate : modelUtils.findAndUpdate,
  update        : modelUtils.update,
  destroy       : modelUtils.destroy,

  // @todo make it a non-enumerable property
  models        : models,

  // @todo findAllJoin
  // @todo findOrInitialize
  // @todo findOrBuild
  // @todo build

  // @todo refactor
  getDefinedModels: function() {
    return models;
  }
},
/**
 * @lends Model#
 */
{
  setup   : instance.setup,
  map     : instance.map,
  save    : instance.save,
  destroy : instance.destroy,
  toJSON  : instance.toJSON,
  inspect : instance.customInspect

  // @todo restore/revert
  // @todo refresh/reload
});

module.exports = Model;
