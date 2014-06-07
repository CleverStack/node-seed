'use strict';

var Class       = require( 'uberclass' )
  , path        = require( 'path' )
  , packageJson = require( path.resolve( __dirname + '/../../' ) + '/package.json' )
  , fs          = require( 'fs' )
  , async       = require( 'async' )
  , debug       = require( 'debug' )( 'ModuleLoader' )
  , i           = require( 'i' )()
  , injector    = require( 'injector' )
  , Module;

var ModuleLoader = module.exports = Class.extend(
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
        if ( module instanceof Module.Class && typeof module.preShutdown === 'function' ) {
            module.debug( 'Module.preShutdown() hook...' );
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
        Module = injector.getInstance( 'Module' );

        var self = this;

        if ( this.modulesLoaded === false ) {
            debug( 'Loading modules...' );

            // Load each of our modules
            packageJson.bundledDependencies.forEach( this.proxy( 'loadModule', env ) );

            // Fire the configureApp hook on each of our modules giving them a chance to configure the express app
            this.modules.forEach( this.proxy( 'configureAppHook' ) );

            // Load each modules resources
            this.modules.forEach( this.proxy( 'preResourcesHook' ) );
            
            // Load each modules resources
            this.modules.forEach( this.proxy( 'loadModuleResources' ) );

            // Fire the modulesLoadedHook hook on each of our modules letting them know that all modules have finished loading
            this.modules.forEach( this.proxy( 'modulesLoadedHook' ) );

            // Let the module loader know we have already loaded our modules
            this.modulesLoaded = true;
        } else {
            debug( 'Warning: All modules have already been loaded.' );
        }
    },

    loadModule: function( env, moduleName ) {
        if (typeof env !== "undefined" && env !== null) {
            process.env = env;
        }

        debug( [ 'Loading the', moduleName, 'module' ].join( ' ' ) + '...' );
        var module = require( moduleName );

        var moduleLowerCamelCase = i.camelize( moduleName.replace( /\-/ig, '_' ), false );

        debug( [ 'Adding the', moduleLowerCamelCase, 'module to the injector' ].join( ' ' ) + '...' );
        injector.instance( moduleLowerCamelCase, module );

        // Add the module into our modules array so we can keep track of them internally and call hooks in their module.js file
        this.modules.push( module );
    },

    configureAppHook: function( module ) {
        if ( module instanceof Module.Class && typeof module.configureApp === 'function' ) {
            module.debug( 'Module.configureApp() hook...' );

            injector.getInstance( 'app' ).configure( module.proxy( 'configureApp', injector.getInstance( 'app' ), injector.getInstance( 'express' ) ) );
        }
    },

    preResourcesHook: function( module ) {
        if ( module instanceof Module.Class && typeof module.preResources === 'function' ) {
            module.debug( 'Module.preResources() hook...' );

            module.hook( 'preResources' );
        }
    },

    loadModuleResources: function( module ) {
        if ( module instanceof Module.Class && typeof module.loadResources === 'function' ) {
            module.debug( 'Module.loadResources() hook...' );
            debug( [ 'loadResources for module', module.name ].join( ' ' ) );

            module.loadResources();
        }
    },

    modulesLoadedHook: function( module ) {
        if ( module instanceof Module.Class && typeof module.modulesLoaded === 'function' ) {
            module.debug( 'Module.modulesLoaded() hook...' );

            module.hook( 'modulesLoaded' );
        }
    },

    initializeRoutes: function() {
        if ( this.routesInitialized === false ) {
            // Give the modules notice that we are about to add our routes to the app
            this.modules.forEach( this.proxy( 'preRouteHook' ) );

            debug( 'Initializing routes...' );
            this.modules.forEach( this.proxy( 'initializeModuleRoutes' ) );

            // We only want to do this once
            this.routesInitialized = true;
        } else {
            debug( 'Warning: All modules routes have been initialized already.' );
        }
    },

    preRouteHook: function( module ) {
        if ( module instanceof Module.Class && typeof module.preRoute === 'function' ) {
            module.debug( 'Module.configureApp() hook...' );
            module.preRoute();
        }
    },

    initializeModuleRoutes: function( module ) {
        if ( module instanceof Module.Class ) {
            module.debug( [ 'Initializing routes...' ].join( ' ' ) );
            module.initRoutes();
        }
    }
});