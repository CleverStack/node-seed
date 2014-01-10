var path = require( 'path' );

GLOBAL.config = require( 'config' )
GLOBAL.injector = require( 'utils' ).injector();

injector.instance( 'config', config );

// Load our modules and initialize them
var moduleLoader = require( 'utils' ).moduleLoader.getInstance();

// Add our moduleLoader to the injector
injector.instance( 'moduleLoader', moduleLoader );

var models = require( 'models' );

// Launch our background process class
GLOBAL.backgroundTasksClass = require( path.resolve( __dirname + '/../classes' ) + '/BackgroundTasks.js' );
GLOBAL.backgroundTasks = new backgroundTasksClass(config, models);