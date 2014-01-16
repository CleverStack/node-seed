var path = require( 'path' )
  , dbModules = [ 'orm', 'odm' ]
  , moduleLoader = require( 'utils' ).moduleLoader.getInstance()
  , models = {};

modules.forEach( function( moduleName ) {
    if ( moduleLoader.moduleIsEnabled( moduleName ) ) {
        models[ type ] = {};
        moduleLoader.modules.forEach( function( theModule ) {
            Object.keys( theModule.models[ type ] ).forEach( function( key ) {
                models[ type ][ key ] = theModule.models[ type ][ key ];
                models[ type ][ key ][ type.toUpperCase() ] = true;
            });
        });
    }
});

console.dir( models );

module.exports = models;