'use strict';

var Class = require( 'uberclass' )
  , path = require( 'path' )
  , packageJson = require( path.resolve( __dirname + '/../../' ) + '/package.json' )
  , fs = require( 'fs' )
  , async = require( 'async' )
  , debug = require( 'debug' )( 'moduleLoader' );

var Module = module.exports = Class.extend(
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

    modulesLoaded: false,

    routesInitialized: false,

    init: function() {
        debug( 'Loading modules...' );
        this.modules = [];
    },

    loadModules: function() {
        if ( this.modulesLoaded === false ) {
            packageJson.bundledDependencies.forEach( this.proxy( 'loadModule' ) );
            this.modulesLoaded = true;
        }
    },

    loadModule: function( moduleName ) {
        debug( [ 'Loading module', moduleName ].join( ' ' ) );
        this.modules.push( require( moduleName ) );
    },

    initializeRoutes: function( injector ) {
        if ( this.routesInitialized === false ) {
            this.modules.forEach( this.proxy( 'initializeModuleRoutes', injector, require( 'classes' ).ModuleClass ) );
            this.routesInitialized = true;
        }
    },

    initializeModuleRoutes: function( injector, moduleClass, module ) {
        // Only initialize modules that implement ModuleClass
        if ( module instanceof moduleClass ) {
            if ( typeof module.preRoute === 'function' ) {
                debug( [ 'preRouteHook for module', module.name ].join( ' ' ) );
                module.preRoute( injector );
            }

            module.initRoutes( injector );
        }
    }
});