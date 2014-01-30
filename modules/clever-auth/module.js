var passport = require( 'passport' )
  , debug = require( 'debug' )( 'AuthModule' )
  , fs = require( 'fs' )
  , path = require( 'path' )
  , ModuleClass = require( 'classes' ).ModuleClass
  , RedisStore = require( 'connect-redis' )( injector.getInstance( 'express' ) )
  , Module;

Module = ModuleClass.extend( {
    models: null,
    store: null,
    sequelize: null,

    preSetup: function() {
        var self = this;
        this.models = {};
        this.sequelize = injector.getInstance( 'sequelize' );
        var dir = fs.readdirSync( path.join( __dirname, 'models', 'orm' ) );
        dir.forEach( function ( model ) {
            self.getModel( path.join( __dirname, 'models', 'orm', model ) );
        } );
    },

    preResources: function () {
        injector.instance( 'passport', passport );
    },

    modulesLoaded: function() {
        this.defineModelsAssociations();
    },

    defineModelsAssociations: function() {
        if (!this.config.hasOwnProperty( 'modelAssociations' )) {
            return true;
        }

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
            this.models[ modelName ] = this.sequelize.import( modelPath );

            // Set a flat for tracking
            this.models[ modelName ].ORM = true;

            // Add the model to the injector
            injector.instance( 'ORM' + modelName, this.models[ modelName ] );
        }

        return this.models[ modelName ];
    },

    configureApp: function ( app, express ) {
        // Setup the redis store
        this.store = new RedisStore( {
            host: this.config.redis.host,
            port: this.config.redis.port,
            prefix: this.config.redis.prefix + process.env.NODE_ENV + "_",
            password: this.config.redis.key
        } );

        // Session management
        app.use( express.cookieParser() );
        app.use( express.session( {
            secret: this.config.secretKey,
            cookie: { secure: false, maxAge: 86400000 },
            store: this.store
        } ) );

        // Enable CORS
        app.use( this.proxy( 'enableCors' ) );

        // Initialize passport
        app.use( passport.initialize() );
        app.use( passport.session() );
    },

    enableCors: function ( req, res, next ) {
        res.header( "Access-Control-Allow-Origin", req.headers.origin );
        res.header( "Access-Control-Allow-Headers", "x-requested-with, content-type" );
        res.header( "Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS" );
        res.header( "Access-Control-Allow-Credentials", "true" );
        res.header( "Access-Control-Max-Age", "1000000000" );
        // intercept OPTIONS method
        if ( 'OPTIONS' == req.method ) {
            res.send( 200 );
        }
        else {
            next();
        }
    },

    preShutdown: function () {
        this.store.client.quit();
    }
} );

module.exports = new Module( 'clever-auth', injector );