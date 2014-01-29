var utils = require( 'utils' );
var cors  = require( 'cors' );

// Bootstrap the environment
var env = utils.bootstrapEnv();

// Load all the modules
env.moduleLoader.loadModules();

// Configure the app before routes
env.app.configure(function() {
    env.app.use( env.express.urlencoded() );
    env.app.use( env.express.json() );
    env.app.use( env.express.logger('dev') );
    env.app.use( env.express.compress() );
    env.app.use( env.express.favicon() );
    env.app.use( env.express.methodOverride() );
});

// Initialize all the modules
env.moduleLoader.initializeRoutes( injector );

// Add middleware that needs to come after routes
env.app.configure(function() {

    // Allow cross-origin requests
    env.app.use( cors({
        origin: true,
        credentials: true,
        headers: [ "x-requested-with", "content-type" ],
        methods: [ "GET", "PUT", "POST", "DELETE", "OPTIONS" ],
        maxAge: 1000000000
    }) );

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

// Export the Express app
module.exports = env.app;