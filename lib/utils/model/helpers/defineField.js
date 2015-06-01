var inflect    = require('i')();

module.exports = function defineField(Proto, Klass, fieldName) {
  var prop        = Proto[fieldName]
    , columnName  = !!Klass.underscored ? inflect.underscore(fieldName) : fieldName;
   
  if (!!prop.columnName && fieldName !== prop.columnName) {
    Klass.aliases.push({ fieldName: fieldName, columnName: prop.columnName });
    columnName = prop.columnName;
  } else if (!!Klass.underscored && fieldName !== columnName) {
    Klass.aliases.push({ fieldName: fieldName, columnName: columnName });
  }
  
  if (typeof prop === 'function' && [String, Number, Boolean, Date, Buffer, this.Types.ENUM, this.Types.TINYINT, this.Types.BIGINT, this.Types.FLOAT, this.Types.DECIMAL, this.Types.TEXT].indexOf(Proto[fieldName]) === -1 && fieldName !== 'defaults') {
    
    // Allow definition of custom getters and setters for fields, but make sure not to include association accessor functions.
    if (/^(set|get)(.*)$/.test(fieldName)) {
      var getterOrSetter = RegExp.$1 === 'get' ? 'getters' : 'setters';
      
      if (fieldName !== false && Klass[getterOrSetter][fieldName] === undefined) {
        fieldName = inflect.camelize(RegExp.$2, false);
        Klass[getterOrSetter][fieldName] = function() {
          return prop.apply(this, arguments);
        };
      }
    }
  } else if (fieldName !== 'defaults') {

    if (typeof Klass.fields !== 'object') {
      Klass.fields = {};
    }

    if (typeof Klass.getters !== 'object') {
      Klass.getters = {};
    }

    if (typeof Klass.setters !== 'object') {
      Klass.setters = {};
    }

    Klass.fields[fieldName] = prop;
    Klass.getters[fieldName] = function() {
      if (fieldName === 'id' && Klass.type.toLowerCase() === 'odm') {
        return this.entity._id;
      } else {
        return this.entity.get(columnName);
      }
    };
    Klass.setters[fieldName]  = function(val) {
      this.entity.set(columnName, val);

      return this;
    };

    delete Proto[fieldName];
  }
};
