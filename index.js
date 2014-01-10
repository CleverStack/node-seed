var config = require( './config' )
  , express = require( 'express' )
  , webPort = process.env.NODE_WWW_PORT || config.webPort || 8080
  , passport = require( 'passport' )
  // , initializeSecurity = require( './security' )
  , app = module.exports = express()
  , moduleLoader;

var RedisStore = require( 'connect-redis' )( express );

// Bootstrap our DI
GLOBAL.injector = require( 'utils' ).injector();
injector.instance( 'app', app );
injector.instance( 'config', config );

// Load our modules and initialize them
moduleLoader = require( 'utils' ).moduleLoader.getInstance();

// Add our moduleLoader to the injector
injector.instance( 'moduleLoader', moduleLoader );

// Initialize all the modules
moduleLoader.initializeModules( injector );

app.configure(function() {
    // middleware stack
    app.use( express.bodyParser() );

    // session management
    app.use( express.cookieParser() );
    app.use( express.session({
        secret: config.secretKey
        , cookie: { secure: false, maxAge: 86400000 }
        , store: new RedisStore({
            host: config.redis.host
            , port: config.redis.port
            , prefix: config.redis.prefix+process.env.NODE_ENV+"_"
            , password: config.redis.key
        })
    }));

    // Enable CORS
    app.use(function( req, res, next ) {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
        res.header("Access-Control-Allow-Headers", "x-requested-with, content-type");
        res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Max-Age", "1000000000");
        // intercept OPTIONS method
        if ('OPTIONS' == req.method) {
            res.send(200);
        }
        else {
            next();
        }
    });

    app.use( express.logger('dev') );
    app.use( express.compress() );
    app.use( express.favicon() );
    app.use( express.methodOverride() );

    app.use( passport.initialize() );
    app.use( passport.session() );

    // register middleware for security headers
    // initializeSecurity( app, config );

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

app.listen(webPort, function() {
    console.log("Starting server on port " + webPort + " in " + config.environmentName + " mode");
});