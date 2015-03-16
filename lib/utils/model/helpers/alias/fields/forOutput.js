var util       = require('util')
  , utils      = require('utils')
  , debug      = require('debug')('cleverstack:utils:model:alias:fields:forOutput');

module.exports = function aliasFieldsForOutput(fields, callback) {
  if (debug.enabled && !fields.where) {
    debug(util.format('aliasFieldsForOutput(%s)', utils.model.helpers.debugInspect(Object.keys(fields))));
  }

  (!this.Class ? this.aliases : this.Class.aliases).forEach(function(column) {
    var hasAssociation = (!this.Class ? this.associations : this.Class.associations)[column.fieldName];

    if (!hasAssociation && fields[column.columnName] !== undefined) {
      fields[column.fieldName] = fields[column.columnName];
      delete fields[column.columnName];
    }
  }
  .bind(this));

  return callback ? callback(null) : fields;
};
