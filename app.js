var cluster = require('cluster')
  , backgroundTasks = null
  , cp = require('child_process')
  , config = require('./config');

//
process.env.NODE_PATH = process.env.NODE_PATH ? './src/:' + process.env.NODE_PATH : './src';

if ( cluster.isMaster ) {
    cluster.on('exit', function( worker, code, signal ) {
        console.dir( arguments );
        cluster.fork();
    });
    for ( var i=0; i<config.numChildren; ++i ) {
        cluster.fork();
    }

    // Setup the background tasks worker
    if ( process.env.NODE_ENV !== 'local' ) {
        function setupBackgroundTasks() {
            console.log('Setup background tasks...');

            backgroundTasks = cp.fork('./bin/backgroundTasks.js');
            backgroundTasks.on('exit', setupBackgroundTasks);
        }
        setupBackgroundTasks();
    }

} else {
    require('./index.js');
}
