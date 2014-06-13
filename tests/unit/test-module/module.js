var Module          = require( 'classes' ).Module
  , injector        = require( 'injector' )
  , moduleLdr       = injector.getInstance( 'moduleLoader' )
  , excludedFiles   = [];

if ( !moduleLdr.moduleIsEnabled( 'clever-orm' ) ) {
    excludedFiles.push( 'TestModel.js' );
    excludedFiles.push( 'TestService.js' );
    excludedFiles.push( 'TestController.js' );
}

if ( !moduleLdr.moduleIsEnabled( 'clever-odm' ) ) {
    excludedFiles.push( 'TestObjectModel.js' );
    excludedFiles.push( 'TestObjectService.js' );
    excludedFiles.push( 'TestObjectController.js' );
}

if ( excludedFiles.length === 6 ) {
    throw new Error( 'You need either to enable clever-orm or clever-odm to run the tests!' );
}

module.exports = Module.extend(
{
    excludedFiles: excludedFiles
},
{
    calledMethods: [],

    preSetup: function() {
        this.calledMethods.push( 'preSetup' );
        this.debug( 'preSetup' );
    },

    preInit: function() {
        this.calledMethods.push( 'preInit' );
        this.debug( 'preInit' );
    },

    init: function() {
        this.calledMethods.push( 'init' );
        this.debug( 'init' );
    },

    preResources: function() {
        this.calledMethods.push( 'preResources' );
        this.debug( 'preResources' );
        this.emit( 'resourcesReady' );
    },

    configureApp: function( app, express ) {
        this.calledMethods.push( 'configureApp' );
        this.debug( 'configureApp' );
        this.emit( 'appReady' );
    },

    preResources: function() {
        this.calledMethods.push( 'preResources' );
        this.debug( 'preResources' );
        this.emit( 'resourcesReady' );
    },

    modulesLoaded: function() {
        this.calledMethods.push( 'modulesLoaded' );
        this.debug( 'modulesLoaded' );
        this.emit( 'ready' );
    },

    preResources: function() {
        this.calledMethods.push( 'preResources' );
        this.debug( 'preResources' );
        this.emit( 'resourcesReady' );
    },

    preShutdown: function() {
        this.calledMethods.push( 'preShutdown' );
        this.debug( 'preShutdown' );
    }
});