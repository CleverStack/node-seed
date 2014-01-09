var applicationModule = require( 'classes' ).ModuleClass.extend( {
    init: function () {
        console.log( 'Clever-countries module initialized' );
    }
} );

module.exports = new applicationModule( 'clever-countries', injector );