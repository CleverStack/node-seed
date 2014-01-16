var mongoose = require( 'mongoose' )
  , debug = require( 'debug' )( 'ODM' )
  , modelInjector = require( 'utils' ).modelInjector
  , ModuleClass = require( 'classes' ).ModuleClass
  , Module;

Module = ModuleClass.extend({
    models: null,

    preSetup: function() {
        this.models = {};
    },

    preResources: function() {
        debug( 'Opening connection to database' );
        
        // Connect to mongo
        mongoose.connect( this.config.uri );

        // Add the mongoose instance to the injector
        injector.instance( 'mongoose', mongoose );
    },
    
    getModel: function( modelPath ) {
        var modelName = modelPath.split( '/' ).pop().split( '.' ).shift();

        if ( typeof this.models[ modelName ] === 'undefined' ) {
            debug( [ 'Loading model', modelName, 'from', modelPath ].join( ' ' ) );

            // Load (require) the model
            this.models[ modelName ] = require( modelPath )( mongoose );

            // Add the model to the injector
            injector.instance( 'ODM' + modelName, this.models[ modelName ] );
        }

        return this.models[ modelName ];
    },

    preShutdown: function() {
        // Disconnect mongo
        mongoose.disconnect();
    }
});

module.exports = new Module( 'odm', injector );