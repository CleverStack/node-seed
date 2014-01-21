'use strict';

var Class = require( 'uberclass' )
  , path = require( 'path' )
  , packageJson = require( path.resolve( __dirname + '/../../' ) + '/package.json' )
  , fs = require( 'fs' )
  , async = require( 'async' )
  , debug = require( 'debug' )( 'moduleLoader' )
  , moduleClass;

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

    modulesLoaded: null,

    routesInitialized: null,

    shutdown: function() {
        this.modules.forEach( this.proxy( 'preShutdownHook' ) );
        debug( 'Shutdown complete, if your app hangs one of your modules has not closed all its connections/resources.' );
    },

    preShutdownHook: function( module ) {
        if ( module instanceof moduleClass && typeof module.preShutdown === 'function' ) {
            debug( [ 'preShutdown (hook) for module', module.name ].join( ' ' ) );
            module.preShutdown();
        }
    },

    init: function() {
        this.modules = [];
        this.modulesLoaded = false;
        this.routesInitialized = false;
    },

    moduleIsEnabled: function( moduleName ) {
        return packageJson.bundledDependencies.indexOf( moduleName ) !== -1;
    },

    loadModules: function( env ) {
        var self = this;

        if ( this.modulesLoaded === false ) {
            debug( 'Loading modules...' );

            // Load each of our modules
            packageJson.bundledDependencies.forEach( function ( dep ) {
                self.proxy( 'loadModule', dep, env );
            } );

            // Fire the modulesLoadedHook hook on each of our modules letting them know that all modules have finished loading
            this.modules.forEach( this.proxy( 'modulesLoadedHook' ) );

            // Let the module loader know we have already loaded our modules
            this.modulesLoaded = true;
        } else {
            debug( 'Warning: All modules have already been loaded.' );
        }
    },

    loadModule: function( moduleName, env ) {
        if (typeof env !== "undefined" && env !== null) {
            process.env = env;
        }

        debug( [ 'Loading the', moduleName, 'module' ].join( ' ' ) );

        // Get a copy of the module class
        moduleClass = require( 'classes' ).ModuleClass;

        // Load (require) the module and add to our modules array
        this.modules.push( require( moduleName ) );
    },

    modulesLoadedHook: function( module ) {
        if ( module instanceof moduleClass && typeof module.modulesLoaded === 'function' ) {
            debug( [ 'modulesLoaded (hook) for module', module.name ].join( ' ' ) );
            module.modulesLoaded();
        }
    },

    initializeRoutes: function() {
        if ( this.routesInitialized === false ) {
            // Give the modules notice that we are about to add our routes to the app
            this.modules.forEach( this.proxy( 'preRouteHook' ) );

            // Initialize all the modules routes
            this.modules.forEach( this.proxy( 'initializeModuleRoutes' ) );

            // We only want to do this once
            this.routesInitialized = true;
        } else {
            debug( 'Warning: All modules routes have been initialized already.' );
        }
    },

    preRouteHook: function( module ) {
        if ( module instanceof moduleClass && typeof module.preRoute === 'function' ) {
            debug( [ 'preRoute (hook) for module', module.name ].join( ' ' ) );
            module.preRoute();
        }
    },

    initializeModuleRoutes: function( module ) {
        if ( module instanceof moduleClass ) {
            debug( [ 'Initializing the', module.name, 'modules routes.' ].join( ' ' ) );
            module.initRoutes();
        }
    }
});