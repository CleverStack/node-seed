var path = require( 'path' )
  , utils = require( 'utils' );

// Bootstrap the environment
var env = utils.bootstrapEnv();

// Load all the modules
env.moduleLoader.loadModules();

// Launch our background process class
GLOBAL.backgroundTasksClass = require( path.resolve( __dirname + '/../classes' ) + '/BackgroundTasks.js' );
GLOBAL.backgroundTasks = new backgroundTasksClass(config, models);