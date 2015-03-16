var utils       = require('utils')
  , injector    = require('injector')
  , async       = require('async')
  , Class       = injector.getInstance('Class')
  , Promise     = require('bluebird')
  , validator   = require('validator');

validator.extend('notEmpty', function(str) {
  return !str.match(/^[\s\t\r\n]*$/);
});

validator.extend('len', function(str, min, max) {
  return this.isLength(str, min, max);
});

validator.extend('isUrl', function(str) {
  return this.isURL(str);
});

validator.extend('isIPv6', function(str) {
  return this.isIP(str, 6);
});

validator.extend('isIPv4', function(str) {
  return this.isIP(str, 4);
});

validator.extend('notIn', function(str, values) {
  return !this.isIn(str, values);
});

validator.extend('regex', function(str, pattern, modifiers) {
  str += '';
  if (Object.prototype.toString.call(pattern).slice(8, -1) !== 'RegExp') {
    pattern = new RegExp(pattern, modifiers);
  }
  return str.match(pattern);
});

validator.extend('notRegex', function(str, pattern, modifiers) {
  return !this.regex(str, pattern, modifiers);
});

validator.extend('isDecimal', function(str) {
  return str !== '' && str.match(/^(?:-?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/);
});

validator.extend('min', function(str, val) {
  var number = parseFloat(str);
  return isNaN(number) || number >= val;
});

validator.extend('max', function(str, val) {
  var number = parseFloat(str);
  return isNaN(number) || number <= val;
});

validator.extend('not', function(str, pattern, modifiers) {
  return this.notRegex(str, pattern, modifiers);
});

validator.extend('contains', function(str, elem) {
  return str.indexOf(elem) >= 0 && !!elem;
});

validator.extend('notContains', function(str, elem) {
  return !this.contains(str, elem);
});

validator.extend('is', function(str, pattern, modifiers) {
  return this.regex(str, pattern, modifiers);
});

var Validator = Class.extend(
{
  setup: function() {
    utils.helpers.defineProperty(this, 'validator', { value: validator });
  },

  validate: function(Class, model) {
    if (model === undefined) {
      model = Class;
      Class = model.Class;
    }

    return new Promise(this.proxy('validateModel', Class, model));
  },

  validateModel: function(Class, model, resolve, reject) {
    async.each(
      Object.keys(Class.fields),
      this.proxy('validateEachField', Class, model),
      this.proxy('isModelValid', resolve, reject)
   );
  },

  validateEachField: function(Class, model, fieldName, callback) {
    var attributes  = Class.fields[ fieldName ]
      , value       = model[ fieldName ]
      , validators  = {};

    if (attributes.required !== undefined && value === undefined) {
    
      callback([ fieldName, ' is required.' ].join(''));
    
    } else if (attributes.allowNull === false && (value === undefined || value === null) && attributes.autoIncrement === undefined) {

      callback([ fieldName, ' cannot be null.' ].join(''));

    } else if (typeof attributes === 'object' && attributes.validate !== undefined) {

      if (typeof attributes.validate === 'function') {
        validators.validate = attributes.validate;
        // @todo bug?
      } else {
        async.each(
          Object.keys(validators),
          this.proxy('runValidatorForField', fieldName, value),
          callback
       );
      }

    } else {
      callback(null);
    }
  },

  runValidatorForField: function(fieldName, value, validatorName, callback) {
    var isValid = Validator[ validatorName ](value);

    if (!!isValid) {
      callback(null);
    } else {
      callback([ fieldName, 'failed', validatorName, 'validation', '(' + value + ')' ].join(''));
    }
  },

  isModelValid: function(resolve, reject, err) {
    if (err === null || err === undefined) {
      resolve(null);
    } else {
      reject(err);
    }
  }
});

module.exports = new Validator();
