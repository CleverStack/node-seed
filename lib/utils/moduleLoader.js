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
        debug( 'Loading modules...' );
        this.modules = [];
        packageJson.bundledDependencies.forEach( this.proxy( 'loadModule' ) );
    },

    loadModule: function( moduleName ) {
        debug( [ 'Loading module', moduleName ].join( ' ' ) );

        var module = {
            name: moduleName,
            Class: require( moduleName ),
            module: null
        };

        this.modules.push( module );
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