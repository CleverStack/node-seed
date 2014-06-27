'use strict';

var injector    = require( 'injector' )
  , async       = require( 'async' )
  , path        = require( 'path' )
  , fs          = require( 'fs' )
  , async       = require( 'async' )
  , Class       = require( 'classes' ).Class
  , packageJson = injector.getInstance( 'packageJson' )
  , debug       = require( 'debug' )( 'ModuleLoader' )
  , i           = require( 'i' )()
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

    modulesLoading: false,

    routesInitialized: null,

    hookOrder: [
        'configureAppHook',
        'preResourcesHook',
        'loadModuleResources',
        'modulesLoadedHook'
    ],

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

    loadModules: function( env, modules ) {
        var deps = packageJson.bundledDependencies
          , modules = this.modules
          , loader = this;

        Module = injector.getInstance( 'Module' );

        this.emit( 'preLoadModules' );

        if ( !this.modulesLoading && !this.modulesLoaded ) {
            debug( 'Loading modules...' );
            this.modulesLoading = true;

            async.waterfall(
                [
                    function load( callback ) {
                        async.each( deps, loader.proxy( 'loadModule', env ), callback );
                    },

                    function runHooks( hooksCallback ) {
                        async.eachSeries(
                            loader.hookOrder,
                            function runHook( hookName, hookCallback ) {
                                async.each(
                                    modules,
                                    loader.proxy( hookName ),
                                    hookCallback
                                );
                            },
                            hooksCallback
                        );
                    }
                ],
                function loadComplete( err ) {
                    if ( !!err ) {
                        throw new Error( 'Error loading modules: ' + err );
                    } else {
                        loader.modulesLoaded = true;
                        loader.modulesLoading = false;
                        loader.emit( 'modulesLoaded' );
                    }
                }
            );
        } else if ( !!this.modulesLoading ) {
            debug( 'Modules are already loading...' );
        } else {
            debug( 'Warning: All modules have already been loaded.' );
        }
    },

    loadModule: function( env, moduleName, callback ) {
        if ( typeof env !== "undefined" && env !== null ) {
            process.env = env;
        }

        debug( [ 'Loading the', moduleName, 'module' ].join( ' ' ) + '...' );
        var module = require( moduleName );
        var moduleLowerCamelCase = i.camelize( moduleName.replace( /\-/ig, '_' ), false );

        debug( [ 'Adding the', moduleLowerCamelCase, 'module to the injector' ].join( ' ' ) + '...' );
        injector.instance( moduleLowerCamelCase, module );

        this.modules.push( module );

        callback( null );
    },

    configureAppHook: function( module, callback ) {
        if ( module instanceof Module.Class && typeof module.configureApp === 'function' ) {
            module.debug( 'Module.configureApp() hook...' );

            module.on( 'appReady', callback );
            injector.getInstance( 'app' ).configure( module.proxy( 'configureApp', injector.getInstance( 'app' ), injector.getInstance( 'express' ) ) );
        } else {
            callback( null );
        }
    },

    preResourcesHook: function( module, callback ) {
        if ( module instanceof Module.Class && typeof module.preResources === 'function' ) {
            module.debug( 'Module.preResources() hook...' );

            module.on( 'resourcesReady', callback );
            module.hook( 'preResources' );
        } else {
            callback( null );
        }
    },

    loadModuleResources: function( module, callback ) {
        if ( module instanceof Module.Class && typeof module.loadResources === 'function' ) {
            module.debug( 'Module.loadResources() hook...' );
            debug( [ 'loadResources for module', module.name ].join( ' ' ) );

            module.on( 'resourcesLoaded', callback );
            module.loadResources();
        } else {
            callback( null );
        }
    },

    modulesLoadedHook: function( module, callback ) {
        if ( module instanceof Module.Class && typeof module.modulesLoaded === 'function' ) {
            module.debug( 'Module.modulesLoaded() hook...' );

            module.on( 'ready', callback );
            module.hook( 'modulesLoaded' );
        } else {
            callback( null );
        }
    },

    // @TODO make this support async
    initializeRoutes: function() {
        if ( this.routesInitialized === false ) {
            // Give the modules notice that we are about to add our routes to the app
            this.modules.forEach( this.proxy( 'preRouteHook' ) );

            debug( 'Initializing routes...' );
            this.modules.forEach( this.proxy( 'initializeModuleRoutes' ) );

            // We only want to do this once
            this.routesInitialized = true;

            this.emit( 'routesInitialized' );
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