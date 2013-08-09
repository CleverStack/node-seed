// Get everything ready
var config = require( './config' )
  , express = require( 'express' )
  , webPort = process.env.NODE_WWW_PORT || config.webPort || 8080
  , env = process.env.NODE_ENV || config.environmentName || 'development'
  , initializeRoutes = require( './routes' )
  , loader = require( './src/components/Loader.js' )
  , Sequelize = require( 'sequelize' )
  , passport = require( 'passport' )
  , app = express();

var RedisStore = require( 'connect-redis' )( express );

// Setup ORM
var sequelize = new Sequelize(
    config.db.database, 
    config.db.username, 
    config.db.password,
    config.db.options
);

// Get our models
// Note from richard: We have to do this for now, otherwise we cannot access other models inside a model
GLOBAL.models = require( './src/model' )( sequelize, config );

app.configure( function() {

    // static file delivery
    app.use( express[ 'static' ]( __dirname + '/public' ) );

    // application variables, part of a config block maybe?
    app.set( 'port', webPort );
    app.set( 'config', config );
    app.set( 'models', models );
    app.set( 'loader', loader );
    app.set( 'db', sequelize );

    // middleware stack
    app.use( express.bodyParser() );

    // session management
    app.use( express.cookieParser() );
    app.use( express.session({
        secret: config.secretKey
      , cookie: { secure: false, maxAge: 86400000 }
      , store: new RedisStore({
          host: config.redis.host
        , port: config.redis.key
        , prefix: config.redis.prefix+process.env.NODE_ENV+"_"
        , password: config.redis.key
        })
    }));

    app.use( express.logger('dev') );
    app.use( express.compress() );
    app.use( express.favicon() );
    app.use( express.methodOverride() );

    app.use( passport.initialize() );
    app.use( passport.session() );

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

if (require.main == module) {
    app.listen(webPort, function() {
        console.log("Starting server on port " + webPort + " in " + config.environmentName + " mode");
    });
}