var Sequelize = require( 'sequelize' )
  , debug = require( 'debug' )( 'ORM' )
  , ModuleClass = require( 'classes' ).ModuleClass
  , sequelize
  , Module;

Module = ModuleClass.extend({
    models: null,

    preSetup: function() {
        this.models = {};
    },

    preResources: function() {
        debug( 'Opening connection to database' );
        
        sequelize = new Sequelize(
            this.config.db.database,
            this.config.db.username,
            this.config.db.password,
            this.config.db.options
        );

        injector.instance( 'Sequelize', Sequelize );
        injector.instance( 'DataTypes', Sequelize );
        injector.instance( 'sequelize', sequelize );
    },

    modulesLoaded: function() {
        this.defineModelsAssociations();
    },

    defineModelsAssociations: function() {
        debug( 'Defining model assocations' );

        Object.keys( this.config.modelAssociations ).forEach( this.proxy( function( modelName ) {
            Object.keys( this.config.modelAssociations[ modelName ] ).forEach( this.proxy( 'defineModelAssociations', modelName ) );
        }));
    },

    defineModelAssociations: function( modelName, assocType ) {
        var associatedWith = this.config.modelAssociations[ modelName ][ assocType ];
        if ( ! associatedWith instanceof Array ) {
            associatedWith = [ associatedWith ];
        }

        associatedWith.forEach( this.proxy( 'associateModels', modelName, assocType ) );
    },

    associateModels: function( modelName, assocType, assocTo ) {
        // Support second argument
        if ( assocTo instanceof Array ) {
            debug( '%s %s %s with second argument of ', modelName, assocType, assocTo[0], assocTo[1] );
            this.models[ modelName ][ assocType ]( this.models[ assocTo[0] ], assocTo[1] );
        } else {
            debug( '%s %s %s', modelName, assocType, assocTo );
            this.models[ modelName ][ assocType ]( this.models[assocTo] );
        }
    },

    getModel: function( modelPath ) {
        var modelName = modelPath.split( '/' ).pop().split( '.' ).shift();

        if ( typeof this.models[ modelName ] === 'undefined' ) {
            debug( [ 'Loading model', modelName, 'from', modelPath ].join( ' ' ) );

            // Call on sequelizejs to load the model
            this.models[ modelName ] = sequelize.import( modelPath );

            // Set a flat for tracking
            this.models[ modelName ].ORM = true;

            // Add the model to the injector
            injector.instance( 'ORM' + modelName, this.models[ modelName ] );
        }

        return this.models[ modelName ];
    },
});

module.exports = new Module( 'orm', injector );
