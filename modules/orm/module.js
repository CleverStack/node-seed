var Sequelize = require( 'sequelize' )
  , debug = require( 'debug' )( 'ORM' )
  , config = injector.getInstance( 'config' )
  , modelInjector = require( 'utils' ).modelInjector
  , ModuleClass = require( 'classes' ).ModuleClass
  , sequelize
  , Module;

Module = ModuleClass.extend({

    loadedModels: null,

    setup: function() {
        debug( 'Opening connection to database' );

        sequelize = new Sequelize(
            config.db.database,
            config.db.username,
            config.db.password,
            config.db.options
        );
    },
    
    initInjector: function() {
        injector.instance( 'Sequelize', Sequelize );
        injector.instance( 'DataTypes', Sequelize );
        injector.instance( 'sequelize', sequelize );
    },

    preRoute: function() {
        this.models = require( 'models' ).orm;
    },

    loadModel: function( modelPath ) {
        var modelName = 'ORM' + modelPath.split( '/' ).pop().split( '.' ).shift()
          , model = injector.getInstance( modelName );

        if ( !model ) {
            debug( [ 'Loading model', modelName, 'from', modelPath ].join( ' ' ) );
            model = sequelize.import( modelPath );
            injector.instance( modelName, model );
        }

        return model;
    }
});

module.exports = new Module( 'orm', injector );