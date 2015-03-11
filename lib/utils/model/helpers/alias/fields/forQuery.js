var util       = require('util')
  , utils      = require('utils')
  , underscore = require('underscore')
  , debug      = require('debug')('cleverstack:utils:model:alias:fields:forQuery');

module.exports = function aliasFieldsForQuery(fields, callback) {
  if (Object.keys(fields).length > 0) {
    if (debug.enabled) {
      debug(util.format('aliasFieldsForQuery(%s)', utils.model.helpers.debugInspect(fields)));
    }

    Object.keys(fields).forEach(function(key) {
      var val            = fields[key]
        , associations   = !this.Class ? this.entity.associations : this.Class.entity.associations
        , hasAssociation = associations ? associations[key] : false
        , newKey;

      if ( !hasAssociation && !!( newKey = underscore.findWhere(!this.Class ? this.aliases : this.Class.aliases, { fieldName: key }) )) {
        fields[newKey.columnName] = val;
        delete fields[key];
      }
    }
    .bind(this));
  }

  return callback ? callback(null) : true;
};