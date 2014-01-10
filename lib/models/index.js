var modules = require( '../../package.json' ).bundledDependencies
    , moduleLoader = require( 'utils' ).moduleLoader.getInstance()
    , ormEnabled = ( modules.indexOf( 'orm' ) !== -1 )
    , odmEnabled = ( modules.indexOf( 'odm' ) !== -1 )
    , models = {};

function loadModels( type ) {
    models[ type ] = {};
    moduleLoader.modules.forEach(function( Module ) {
        Object.keys( Module.models[ type ] ).forEach(function( key ) {
            models[ type ][ key ] = Module.models[ type ][ key ];
        });
    });
}

//if ( ormEnabled ) {
//    loadModels( 'orm' );
//}

if ( odmEnabled ) {
    loadModels( 'odm' );
}

module.exports = models;