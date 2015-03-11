var underscore = require('underscore')
  , inflect    = require('i')();

module.exports = function setupOptions(Klass, modelName, modelType, defaults) {
  Klass.type             = modelType;
  Klass.modelName        = modelName;
  Klass.fields           = {};
  Klass.aliases          = [];
  Klass.primaryKey       = false;
  Klass.primaryKeys      = [];
  Klass.hasPrimaryKey    = false;
  Klass.singlePrimaryKey = false;

  // Setup the defaults
  underscore.without(Object.keys(defaults), 'type').forEach(this.callback(function(optionName) {
    Klass[optionName]    = Klass[optionName] !== undefined ? Klass[optionName] : this.defaults[optionName];
  }));

  // Provide the database name
  Klass.dbName           = Klass.dbName !== false ? Klass.dbName : modelName;

  // Pluralize the dbName if not frozen
  if (false === Klass.freezeDbName) {
    Klass.dbName         = inflect.pluralize(Klass.dbName);
  }

  // Underscore the dbName if we have been told to
  if (Klass.underscored === true) {
    Klass.dbName         = inflect.underscore(Klass.dbName);
  }
};