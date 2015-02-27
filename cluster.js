var cluster     = require( 'cluster' )
  , debug       = require( 'debug' )( cluster.isMaster ? 'cleverstack:cluster' : 'cleverstack:server' )
  , config      = require( './config' )
  , os          = require( 'os' )
  , numWorkers  = config.numChildren ? config.numChildren : os.cpus()
  , helpers     = require( './lib/utils/helpers.js' )
  , chalk       = require( 'chalk' );

// Cleanup the NODE_PATH for module loading
process.env.NODE_PATH = helpers.nodePath();

// Allow modules to hook into this file
helpers.loadModulesFileByName( 'cluster.js', config, cluster, debug );

// Master process
if ( cluster.isMaster ) {

  debug( 'started with pid %s', chalk.yellow( process.pid ) );

  // Output the current NODE_PATH for debugging
  debug( 'NODE_PATH is "%s"', process.env.NODE_PATH );

  // Make sure we manage child processes exiting
  cluster.on( 'exit', function( worker, code, signal ) {
    debug( 'Worker %s has died with code %s and signal %s - Forking new process in 2.5 seconds...', worker.pid, code, signal );
    setTimeout( cluster.fork.bind( cluster ), 2500 );
  });

  // Create worker processes
  for ( var i = 0; i < numWorkers; ++i ) {
    cluster.fork();
  }

} else {

  // Load a single application worker instance
  require( './app.js' );

}