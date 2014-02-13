var debug = require ( 'debug' ) ( 'CleverSurveyModule' )
  , fs = require ( 'fs' )
  , path = require ( 'path' )
  , Module;

Module = require ( 'classes' ).ModuleClass.extend ( {

    models: null,
    sequelize: null,

    preSetup: function () {
        var self = this
          , dir = fs.readdirSync ( path.join ( __dirname, 'models', 'orm' ) );

        this.models = {};
        this.sequelize = injector.getInstance ( 'sequelize' );

        dir.forEach ( function ( model ) {
            self.getModel ( path.join ( __dirname, 'models', 'orm', model ) );
        } );
    },

    modulesLoaded: function () {
        this.defineModelsAssociations ();
    },

    defineModelsAssociations: function () {

        if ( !this.config.hasOwnProperty ( 'modelAssociations' ) ) {
            return true;
        }

        debug ( 'Defining model assocations' );

        Object.keys ( this.config.modelAssociations ).forEach ( this.proxy ( function ( modelName ) {
            Object.keys ( this.config.modelAssociations[ modelName ] ).forEach ( this.proxy ( 'defineModelAssociations', modelName ) );
        } ) );
    },

    defineModelAssociations: function ( modelName, assocType ) {
        var associatedWith = this.config.modelAssociations[ modelName ][ assocType ];
        if ( !associatedWith instanceof Array ) {
            associatedWith = [ associatedWith ];
        }

        associatedWith.forEach ( this.proxy ( 'associateModels', modelName, assocType ) );
    },

    associateModels: function ( modelName, assocType, assocTo ) {
        // Support second argument
        if ( assocTo instanceof Array ) {
            debug ( '%s %s %s with second argument of ', modelName, assocType, assocTo[0], assocTo[1] );
            this.models[ modelName ][ assocType ] ( this.models[ assocTo[0] ], assocTo[1] );
        } else {
            debug ( '%s %s %s', modelName, assocType, assocTo );
            this.models[ modelName ][ assocType ] ( this.models[assocTo] );
        }
    },

    getModel: function ( modelPath ) {
        var modelName = modelPath.split ( '/' ).pop ().split ( '.' ).shift ();

        if ( typeof this.models[ modelName ] === 'undefined' ) {
            debug ( [ 'Loading model', modelName, 'from', modelPath ].join ( ' ' ) );

            // Call on sequelizejs to load the model
            this.models[ modelName ] = this.sequelize.import ( modelPath );

            // Set a flat for tracking
            this.models[ modelName ].ORM = true;

            // Add the model to the injector
            injector.instance ( 'ORM' + modelName, this.models[ modelName ] );
        }

        return this.models[ modelName ];
    }

} );

module.exports = new Module ( 'clever-survey', injector );