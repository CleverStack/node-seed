var utils = require( 'utils' );
var cors  = require( 'cors' );

// Bootstrap the environment
var env = utils.bootstrapEnv();

// Configure the app before loading modules
env.app.configure(function() {
    env.app.use( env.express.urlencoded() );
    env.app.use( env.express.json() );
    env.app.use( env.express.logger('dev') );
    env.app.use( env.express.compress() );
    env.app.use( env.express.favicon() );
    env.app.use( env.express.methodOverride() );
    
    // Allow cross-origin requests
    env.app.use( cors( env.config.cors ) );
});

// Add some classes for simplicity
var classes = require( 'classes' );
injector.instance( 'Model', classes.Model );
injector.instance( 'Controller', classes.Controller );
injector.instance( 'EventedClass', classes.EventedClass );
injector.instance( 'ModuleClass', classes.ModuleClass );

// Load all the modules
env.moduleLoader.loadModules();

// Initialize all the modules
env.moduleLoader.initializeRoutes( injector );

// Add middleware that needs to come after routes
env.app.configure(function() {

    // Attach our router
    env.app.use( env.app.router );

    // error handler, outputs json since that's usually
    // what comes out of this thing
    env.app.use(function( err, req, res, next ) {
        console.log( 'Express error catch', err );
        res.json( 500, {
            error: err.toString()
        });
    });
});

// Listen for requests
env.app.listen( env.webPort, function() {
    console.log( "Starting server on port " + env.webPort + " in " + env.config.environmentName + " mode" );
});

// Export the Express app
module.exports = env.app;