/**
 * Field Types you can use when Native JavaScript Types simply don't cut it...
 * @see http://cleverstack.io/documentation/backend/models/#field-types
 *
 * @property {ENUM}    ENUM    custom type
 * @property {TINYINT} TINYINT custom type
 * @property {BIGINT}  BIGINT  custom type
 * @property {FLOAT}   FLOAT   custom type
 * @property {DECIMAL} DECIMAL custom type
 * @property {TEXT}    TEXT    custom type
 */
var types = {
  ENUM: function() {
    return {
      type    : this.ENUM,
      values  : [].slice.call(arguments),
      toString: function() {
        return this.type;
      }
    };
  },
  TINYINT: function(length) {
    return {
      type: this.TINYINT,
      length: length,
      toString: function() {
        return this.type;
      }
    };
  },
  BIGINT: function(length) {
    return {
      type: this.BIGINT,
      length: length,
      toString: function() {
        return this.type;
      }
    };
  },
  FLOAT: function(length, decimals) {
    var field = {
      type: this.FLOAT,
      length: length,
      toString: function() {
        return this.type;
      }
    };

    if (decimals !== undefined) {
      field.decimals = decimals;
    }

    return field;
  },
  DECIMAL: function(precision, scale) {
    var field = {
      type: this.DECIMAL,
      precision: precision,
      toString: function() {
        return this.type;
      }
    };

    if (scale !== undefined) {
      field.scale = scale;
    }

    return field;
  },
  TEXT: function() {
    return {
      type: this.TEXT,
      toString: function() {
        return this.type;
      }
    };
  }
};

Object.keys(types).forEach(function(type) {
  types[ type ].toString = function() {
    return '' + type;
  };
});

module.exports = types;