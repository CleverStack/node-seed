var mongoose = require( 'mongoose' )
  , debug = require( 'debug' )( 'ODM' )
  , modelInjector = require( 'utils' ).modelInjector
  , ModuleClass = require( 'classes' ).ModuleClass
  , Module;

Module = ModuleClass.extend({
    models: null,

    preSetup: function() {
        this.models = [];
    },

    preResources: function() {
        debug( 'Opening connection to database' );
        
        mongoose.connect( this.config.uri );

        // Add the mongoose instance to the injector
        injector.instance( 'mongoose', mongoose );
    },
    
    getModel: function( modelPath ) {
        var modelName = 'ODM' + modelPath.split( '/' ).pop().split( '.' ).shift()
          , model = injector.getInstance( modelName );

        if ( !model ) {
            debug( [ 'Loading model', modelName, 'from', modelPath ].join( ' ' ) );

            // Load (require) the model
            model = require( modelPath )( mongoose );

            // Add the model to the injector
            injector.instance( modelName, model );

            // Add the model into this module instance
            this.models[ modelName ] = model;
        }

        return model;
    },

    preShutdown: function() {
        mongoose.disconnect();
    }
});

module.exports = new Module( 'odm', injector );