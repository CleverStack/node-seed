var mongoose = require( 'mongoose' )
  , debug = require( 'debug' )( 'ODM' )
  , modelInjector = require( 'utils' ).modelInjector
  , ModuleClass = require( 'classes' ).ModuleClass
  , Module;

Module = ModuleClass.extend({
    models: [],

    preResources: function() {
        debug( 'Opening connection to database' );
        
        mongoose.connect( this.config.uri );
        injector.instance( 'mongoose', mongoose );
    },

    preRoute: function() {
        this.models = require( 'models' ).odm;
    },

    loadModel: function( modelPath ) {
        var modelName = 'ODM' + modelPath.split( '/' ).pop().split( '.' ).shift()
          , model = injector.getInstance( modelName );

        if ( !model ) {
            debug( [ 'Loading model', modelName, 'from', modelPath ].join( ' ' ) );

            model = require( modelPath )( mongoose );
            injector.instance( modelName, model );
        }

        return model;
    }
});

module.exports = new Module( 'odm', injector );