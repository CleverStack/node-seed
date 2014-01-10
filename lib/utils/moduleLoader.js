'use strict';

var Class = require( 'uberclass' )
  , packageJson = require( '../../package.json' )
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

    init: function() {
        debug( 'Loading modules...' );
        this.modules = [];
        packageJson.bundledDependencies.forEach( this.proxy( 'loadModule' ) );
    },

    loadModule: function( moduleName ) {
        debug( [ 'Loading module', moduleName ].join( ' ' ) );
        this.modules.push( require( moduleName ) );
    },

    initializeModules: function( injector ) {
        this.modules.forEach( this.proxy( 'preRouteHook', injector ) );
    },

    preRouteHook: function( injector, module ) {
        module.initRoutes( injector );

        if ( typeof module.preRoute === 'function' ) {
            debug( [ 'preRouteHook for module', module.name ].join( ' ' ) );
            module.preRoute( injector );
        }
    }
});