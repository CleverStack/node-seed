var utils     = require( 'utils' )
  , env       = utils.bootstrapEnv()
  , moduleLdr = env.moduleLoader
  , cors      = require( 'cors' )
  , chalk     = require( 'chalk' )
  , debug     = require( 'debug' )( 'Worker' )
  , express   = env.express
  , app       = module.exports = env.app;

debug( 'started with pid %s', chalk.yellow( process.pid ) );

moduleLdr.on( 'preLoadModules', function() {
    debug( 'Configuring express application...' );

    app.configure(function() {
        app.use( express.urlencoded() );
        app.use( express.json() );
        app.use( express.logger('dev') );
        app.use( express.compress() );
        app.use( express.favicon() );
        app.use( express.methodOverride() );
        app.use( cors( env.config.cors ) );
    });
});

moduleLdr.on( 'modulesLoaded', function() {
    debug( 'Initializing routes...' );

    moduleLdr.initializeRoutes();
});

moduleLdr.on( 'routesInitialized', function() {
    debug( 'Setting up router and starting http server...' );

    app.configure(function() {
        app.use( app.router );
        app.listen( env.webPort, function() {
            debug( 'Started web server on port %s in enviromment %s', chalk.yellow( env.webPort ), chalk.yellow( process.env.NODE_ENV ? process.env.NODE_ENV : "LOCAL" ) );
        });
    });
});

debug( 'Loading modules...' );
moduleLdr.loadModules();