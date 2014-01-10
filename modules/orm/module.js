var Sequelize = require( 'sequelize' )
  , modelInjector = require( 'utils' ).modelInjector
  , sequelize
  , debug = require( 'debug' )( 'ORM' )
  , config = injector.getInstance( 'config' )
  , ModuleClass = require( 'classes' ).ModuleClass
  , Module;

Module = ModuleClass.extend({
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
        injector.instance( 'sequelize', sequelize );

        // @TODO This is the old style do we still need this?
        injector.instance( 'db', sequelize );
    },

    preRoute: function() {
        // Load the models
        var models = require( 'models' );

        // Run the model injector
        modelInjector( models );

        // Add it to our injector instace
        injector.instance( 'models', models );
    },

    loadModel: function( modelPath ) {
        debug( 'Loading model from ' + modelPath );
        return sequelize.import( modelPath );
    }
});

module.exports = new Module( 'orm', injector );