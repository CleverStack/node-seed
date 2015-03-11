var util       = require('util')
  , utils      = require('utils')
  , debug      = require('debug')('cleverstack:utils:model:alias:associations:forOutput');

module.exports = function aliasAssociationsForOutput(fields, callback) {
  if (this.entity.associations || this.Class.entity.associations) {
    if (debug.enabled) {
      debug(util.format('aliasAssociationsForOutput(%s)', utils.model.helpers.debugInspect(Object.keys(fields))));
    }

    Object.keys(this.entity.associations || this.Class.entity.associations).forEach(function(includeName) {
      var options = (this.entity.associations || this.Class.entity.associations)[includeName].options;
      if (!!options.as && fields[options.foreignKey] !== undefined) {
        if (!fields[options.as]) {
          fields[options.as] = fields[options.foreignKey];
        }
        delete fields[options.foreignKey];
      }
    }.bind(this));
  }

  return callback ? callback(null) : fields;
};