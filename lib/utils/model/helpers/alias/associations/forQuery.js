var util  = require('util')
  , utils = require('utils')
  , async = require('async')
  , debug = require('debug')('cleverstack:utils:model:alias:associations:forQuery');

function aliasAssociationForQuery(data, remove, fieldName, callback) {
  var associations    = this.Class ? this.Class.entity.associations : this.entity.associations
    , hasAssociation  = associations ? associations[fieldName] : false
    , isArray         = data[fieldName] instanceof Array;

  if (!!hasAssociation && data[fieldName] !== undefined && data[fieldName] !== null) {
    if (debug.enabled) {
      debug(util.format('aliasAssociationForQuery(%s)', utils.model.helpers.debugInspect(fieldName)));
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
}

module.exports = function aliasAssociationsForQuery(data, remove, callback) {
  async.each(
    Object.keys(data),
    this.callback(aliasAssociationForQuery, data, remove),
    callback
   );
};