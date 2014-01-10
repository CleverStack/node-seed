var config = require( './config' )
  , express = require( 'express' )
  , webPort = process.env.NODE_WWW_PORT || config.webPort || 8080
  // , initializeSecurity = require( './security' )
  , app = module.exports = express()
  , moduleLoader;

// Bootstrap our DI
GLOBAL.injector = require( 'utils' ).injector();

injector.instance( 'express', express );
injector.instance( 'app', app );
injector.instance( 'config', config );

// Load our modules and initialize them
moduleLoader = require( 'utils' ).moduleLoader.getInstance();

// Add our moduleLoader to the injector
injector.instance( 'moduleLoader', moduleLoader );

// Initialize all the modules
moduleLoader.initializeModules( injector );

app.configure(function() {
    // Attach our router
    app.use( app.router );

    // error handler, outputs json since that's usually
    // what comes out of this thing
    app.use(function( err, req, res, next ) {
        console.log('Express error catch', err);
        res.json(500, {
            error: err.toString()
        });
    });
});

// Listen for requests
app.listen(webPort, function() {
    console.log("Starting server on port " + webPort + " in " + config.environmentName + " mode");
});