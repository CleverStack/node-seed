/**
 * CleverTech Stub Application
 * @author Mason Houtz <mason@clevertech.biz>
 */

var express = require('express'),

	// env variables
	webPort = process.env.NODE_WWW_PORT || 8080,
	env = process.env.NODE_ENV || 'development',
	config = require('./config'),
	initializeRoutes = require('./routes');


// main server instance
var app = express();

app.configure(function() {

	// application variables, part of a config block maybe?
	app.set('port', webPort);
	app.set('config', config);

	// middleware stack
	app.use(express.bodyParser());

	// session management
	app.use(express.cookieParser());
	app.use(express.session({
		secret: config.secretKey
	}));

	app.use(express.logger('dev'));
	app.use(express.compress());
	app.use(express.favicon());
	app.use(express.methodOverride());
	app.use(app.router);

	// static file delivery
	app.use(express['static'](__dirname + '/public'));

	app.set('views', __dirname + '/src/views')
	app.set('view engine', 'ejs');
	app.set('view options', {
	    layout: false
	});

	// error handler, outputs json since that's usually
	// what comes out of this thing
	app.use(function(err, req, res, next) {
		console.log('Express error catch', err);
		res.json(500, {
			error: err.toString()
		});
	});

});

// register application routes
initializeRoutes(app);

// start server
app.listen(webPort, function() {
	console.log("Starting server on port " + webPort + " in " + config.environmentName + " mode");
});

