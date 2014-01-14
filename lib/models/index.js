var path = require( 'path' )
    , dbModules = [ 'orm', 'odm' ]
    , moduleLoader = require( 'utils' ).moduleLoader.getInstance()
    , models = {};

dbModules.forEach( function( type ) {
    if ( moduleLoader.moduleIsEnabled( type ) ) {
        models[ type ] = {};
        moduleLoader.modules.forEach( function( theModule ) {
            Object.keys( theModule.models[ type ] ).forEach( function( key ) {
                models[ type ][ key ] = theModule.models[ type ][ key ];
                models[ type ][ key ][ type.toUpperCase() ] = true;
            });
        });
    }
});

module.exports = models;