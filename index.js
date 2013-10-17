// Get everything ready
var config = require( './config' )
  , express = require( 'express' )
  , webPort = process.env.NODE_WWW_PORT || config.webPort || 8080
  , env = process.env.NODE_ENV || config.environmentName || 'development'
  , initializeRoutes = require( './routes' )
  , modelInjector = require( 'utils' ).modelInjector
  , Sequelize = require( 'sequelize' )
  , Injector = require( 'utils' ).injector
  , passport = require( 'passport' )
  , mongoose = require( 'mongoose' )
  , initializeSecurity = require( './security' )
  , app = express();

var RedisStore = require( 'connect-redis' )( express );

// Setup ORM
var sequelize = new Sequelize(
    config.db.database,
    config.db.username,
    config.db.password,
    config.db.options
);

// Setup ODM
if ( config.odm && config.odm.enabled ) {
  mongoose.connect(config.mongoose.uri);
}

// Bootstrap our DI
GLOBAL.injector = Injector(  __dirname + '/src/services', __dirname + '/src/controllers' );

injector.instance( 'sequelize', sequelize );
injector.instance( 'config', config );
injector.instance( 'mongoose', mongoose );
injector.instance( 'db', sequelize );

// Get our models
var models = require( 'models' )
injector.instance( 'models', models );

app.set( 'port', webPort );
app.set( 'injector', injector );

// Run our model injection service
modelInjector( injector, models );


app.configure(function() {

    // static file delivery
    app.use( express[ 'static' ]( __dirname + '/public' ) );

    // application variables, part of a config block maybe?

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
    initializeSecurity( app, config );

    app.use( app.router );

    app.set( 'views', __dirname + '/src/views' );
    app.set( 'view engine', 'ejs' );
    app.set( 'view options', {
        layout: false
    });

    // error handler, outputs json since that's usually
    // what comes out of this thing
    app.use(function( err, req, res, next ) {
        console.log('Express error catch', err);
        res.json(500, {
            error: err.toString()
        });
    });
});

//

// register application routes
initializeRoutes( app );

module.exports = app;

// if (require.main == module) {
app.listen(webPort, function() {
    console.log("Starting server on port " + webPort + " in " + config.environmentName + " mode");
});
// }
