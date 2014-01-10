var passport = require( 'passport' )
  , debug = require( 'debug' )( 'AuthModule' )
  , ModuleClass = require( 'classes' ).ModuleClass
  , RedisStore = require( 'connect-redis' )( injector.getInstance( 'express' ) )
  , Module;

Module = ModuleClass.extend({
    preResources: function() {
        injector.instance( 'passport', passport );
        injector.instance( 'RedisStore', RedisStore );
    },

    configureApp: function( app, express ) {
        // session management
        app.use( express.cookieParser() );
        app.use( express.session({
            secret: this.config.secretKey,
            cookie: { secure: false, maxAge: 86400000 },
            store: new RedisStore({
                host: this.config.redis.host,
                port: this.config.redis.port,
                prefix: this.config.redis.prefix + process.env.NODE_ENV + "_",
                password: this.config.redis.key
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

        app.use( passport.initialize() );
        app.use( passport.session() );
    }
});

module.exports = new Module( 'auth', injector );