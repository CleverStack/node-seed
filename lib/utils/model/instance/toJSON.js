var utils      = require('utils')
  , underscore = require('underscore');

/**
 * Convert the model into a JSON ready format (Object literal)
 * 
 * @see http://cleverstack.io/documentation/backend/models/#instance-methods-toJSON
 * @return {Object}
 */
module.exports = function toJSON() {
  var json    = {}
    , helpers = utils.model.helpers;

  try {

    // Add in getters
    Object.keys(this.Class.getters).forEach(this.proxy(function(getterName) {
      if (this[getterName] !== undefined) {
        json[getterName] = this[getterName];
      }
    }));

    if (this.Class.type === 'ORM') {
      if (this.entity.options.includeNames) {
        json = helpers.alias.fields.forOutput.apply(this, [underscore.omit(underscore.clone(this.entity.values), this.entity.options.includeNames)]);

        this.entity.options.includeNames.forEach(this.proxy(function(includeName) {
          var toJSON  = this.entity[includeName] ? this.entity[includeName].toJSON : false
            , subJSON = toJSON ? toJSON.apply(this.entity[includeName]) : this.entity[includeName];

          json[includeName] = underscore.clone(subJSON);
        }));

        helpers.alias.associations.forOutput.apply(this, [json]);
      } else {
        json = helpers.alias.fields.forOutput.apply(this, [underscore.clone(this.entity.values)]);
      }
    } else {
      json = helpers.alias.fields.forOutput.apply(this, [underscore.clone(underscore.omit(this.values, '__v'))]);
    }
  } catch(e) {
    console.error(e);
    console.error(e.stack);
  }

  return json;
};
