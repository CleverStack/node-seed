var util       = require('util')
  , utils      = require('utils')
  , underscore = require('underscore')
  , debug      = require('debug')('cleverstack:utils:model:normalizeAssociations');

function aliasFieldsForQuery(fields, callback) {
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
}

function aliasFieldsForOutput(fields, callback) {
  if (debug.enabled && !fields.where) {
    debug(util.format('aliasFieldsForOutput(%s)', utils.model.helpers.debugInspect(Object.keys(fields))));
  }

  (!this.Class ? this.aliases : this.Class.aliases).forEach(function(column) {
    var hasAssociation = (!this.Class ? this.entity.associations : this.Class.entity.associations)[column.fieldName];

    if (!hasAssociation && fields[column.columnName] !== undefined) {
      fields[column.fieldName] = fields[column.columnName];
      delete fields[column.columnName];
    }
  }
  .bind(this));

  return callback ? callback(null) : fields;
}

module.exports.aliasFieldsForQuery  = aliasFieldsForQuery;
module.exports.aliasFieldsForOutput = aliasFieldsForOutput;