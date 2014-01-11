var utils = require( 'utils' );

// Bootstrap the environment
var env = utils.bootstrapEnv();

// Load all the modules
env.moduleLoader.loadModules();

// Initialize all the modules
env.moduleLoader.initializeModuleRoutes( injector );

// Add our standard configuration
env.app.configure(function() {
    // Attach our router
    env.app.use( env.app.router );

    // error handler, outputs json since that's usually
    // what comes out of this thing
    env.app.use(function( err, req, res, next ) {
        console.log('Express error catch', err);
        res.json(500, {
            error: err.toString()
        });
    });
});

// Listen for requests
env.app.listen( env.webPort, function() {
    console.log("Starting server on port " + env.webPort + " in " + env.config.environmentName + " mode");
});