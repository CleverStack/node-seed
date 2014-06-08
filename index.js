var utils     = require( 'utils' )
  , env       = utils.bootstrapEnv()
  , moduleLdr = env.moduleLoader
  , cors      = require( 'cors' )
  , express   = env.express
  , app       = module.exports = env.app;

moduleLdr.on( 'preLoadModules', function() {
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
    moduleLdr.initializeRoutes();
});

moduleLdr.on( 'routesInitialized', function() {
    app.configure(function() {
        app.use( app.router );
        app.listen( env.webPort, function() {
            console.log( "Starting server on port " + env.webPort + " in " + env.config.environmentName + " mode" );
        });
    });
});

env.moduleLoader.loadModules();