var Sequelize = require( 'sequelize' )
  , debug = require( 'debug' )( 'ORM' )
  , config = injector.getInstance( 'config' )
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
        injector.instance( 'db', sequelize );
    },

    loadModel: function( modelPath ) {
        var modelName = 'ORM' + modelPath.split( '/' ).pop()
          , model = injector.getInstance( modelName );

        if ( !model ) {
            debug( 'Loading model from ' + modelPath );
            model = sequelize.import( modelPath );
            injector.instance( modelName, model );
        }

        return model;
    }
});

module.exports = new Module( 'orm', injector );