var cleverCountryModule = require( 'classes' ).ModuleClass.extend( {
    init: function () {
        console.log( 'Clever-countries module initialized' );
    }
} );

module.exports = new cleverCountryModule( 'clever-countries', injector );