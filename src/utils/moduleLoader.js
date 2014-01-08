'use strict';

var Class = require( 'uberclass' )
  , packageJson = require( '../../package.json' )
  , fs = require( 'fs' )
  , async = require( 'async' )
  , debug = require( 'debug' )( 'moduleLoader' )

module.exports = Class.extend(
{
    instance: null,

    getInstance: function() {
        if ( this.instance === null ) {
            this.instance = new this();
        }
        return this.instance;
    }
},
{
    modules: null,

    init: function() {
        debug( 'New module loader constructed' );
        this.modules = [];

        async.forEach(
            packageJson.bundledDependencies,
            this.proxy( 'loadModule' ),
            this.proxy( 'finishedLoading' )
        );
    },

    loadModule: function( moduleName, callback ) {
        debug( [ 'Loading module', moduleName ].join( ' ' ) );
        try {
            var module = {
                name: moduleName,
                Class: require( moduleName ),
                module: null
            };

            this.modules.push( module );

            callback( null );
        } catch( e ) {
            callback( [ 'Exception while trying to load the', moduleName, 'module. Detail:', e.toString(), 'Stack:', e.stack ].join( ' ' ) );
        }
    },

    finishedLoading: function( err ) {
        if ( !err ) {
            debug( 'All modules have been loaded without error' );
        } else {
            debug( 'Encountered exception while trying to load modules: ', err, 'Stack:', err.stack );
        }
    },

    initializeModules: function( injector ) {
        this.modules.forEach( this.proxy( 'initModule', injector ) );
    },

    initModule: function( injector, module ) {
        debug( [ 'Initializing module', module.name ].join( ' ' ) );

        // module.module = new module.Class( module.name, injector );
        // console.dir( module.module );
        // module.data.initModule( app );
        // console.dir( require('application'));
        // process.exit();
    }
});