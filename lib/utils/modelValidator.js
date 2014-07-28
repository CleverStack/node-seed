var Validator   = require( 'validator' )
  , Promise     = require( 'bluebird' )
  , async       = require( 'async' )
  , Class       = require( 'classes' ).Class;
  // , debug       = require( 'debug' )( 'ModelValidator' );

Validator.extend( 'notEmpty', function( str ) {
    return !str.match( /^[\s\t\r\n]*$/ );
});

Validator.extend( 'len', function( str, min, max ) {
    return this.isLength( str, min, max );
});

Validator.extend( 'isUrl', function( str ) {
    return this.isURL( str );
});

Validator.extend('isIPv6', function( str ) {
    return this.isIP( str, 6 );
});

Validator.extend( 'isIPv4', function( str ) {
    return this.isIP( str, 4 );
});

Validator.extend( 'notIn', function( str, values ) {
    return !this.isIn( str, values );
});

Validator.extend( 'regex', function( str, pattern, modifiers ) {
    str += '';
    if ( Object.prototype.toString.call( pattern ).slice( 8, -1 ) !== 'RegExp' ) {
        pattern = new RegExp( pattern, modifiers );
    }
    return str.match( pattern );
});

Validator.extend( 'notRegex', function( str, pattern, modifiers ) {
    return !this.regex( str, pattern, modifiers );
});

Validator.extend( 'isDecimal', function( str ) {
    return str !== '' && str.match( /^(?:-?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/ );
});

Validator.extend( 'min', function( str, val ) {
    var number = parseFloat( str );
    return isNaN( number ) || number >= val;
});

Validator.extend( 'max', function( str, val ) {
    var number = parseFloat( str );
    return isNaN( number ) || number <= val;
});

Validator.extend( 'not', function( str, pattern, modifiers ) {
    return this.notRegex( str, pattern, modifiers );
})

Validator.extend( 'contains', function( str, elem ) {
    return str.indexOf( elem ) >= 0 && !!elem;
});

Validator.extend( 'notContains', function( str, elem ) {
    return !this.contains( str, elem );
});

Validator.extend( 'is', function( str, pattern, modifiers ) {
    return this.regex( str, pattern, modifiers );
});

var validator = Class.extend(
{
    _validator: Validator,

    validate: function( Class, model ) {
        if ( model === undefined ) {
            model = Class;
            Class = model.Class;
        }

        return new Promise( this.proxy( 'validateModel', Class, model ) );
    },

    validateModel: function( Class, model, resolve, reject ) {
        async.each(
            Object.keys( Class._schema ),
            this.proxy( 'validateEachField', Class, model ),
            this.proxy( 'isModelValid', resolve, reject )
        );
    },

    validateEachField: function( Class, model, fieldName, callback ) {
        var attributes  = Class._schema[ fieldName ]
          , value       = model[ fieldName ]
          , validators  = {};

        if ( attributes.required !== undefined && value === undefined ) {
        
            callback( [ fieldName, ' is required.' ].join( '' ) );
        
        } else if ( typeof attributes === 'object' && attributes.validate !== undefined ) {

            if ( typeof attributes.validate === 'function' ) {
                validators.validate = attributes.validate
            } else {
                async.each(
                    Object.keys( validators ),
                    this.proxy( 'runValidatorForField', fieldName, value ),
                    callback
                );
            }

        } else {
            callback( null );
        }
    },

    runValidatorForField: function( fieldName, value, validatorName, callback ) {
        var isValid = Validator[ validatorName ]( value );

        if ( !!isValid ) {
            callback( null );
        } else {
            callback( [ fieldName, 'failed', validatorName, 'validation', '(' + value + ')' ].join( '' ) );
        }
    },

    isModelValid: function( resolve, reject, err ) {
        if ( err === null || err === undefined ) {
            resolve( null );
        } else {
            reject( err );
        }
    }
});

module.exports = new validator();