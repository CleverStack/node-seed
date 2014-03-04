var cluster = require( 'cluster' )
  , config = require( './config' )
  , packageJson = require( './package.json' )
  , path = require( 'path' )
  , fs = require( 'fs' );

function loadModulesAppFiles( moduleName ) {
    packageJson.bundledDependencies.forEach(function( moduleName ) {
        var file = [ path.resolve( './' ), 'modules', moduleName, 'bin', 'app.js' ].join( path.sep );
        if ( fs.existsSync( file ) ) {
            require( file )( cluster, config, packageJson );
        }
    });
}

// Set the node path - this works only because the other processes are forked.
process.env.NODE_PATH = process.env.NODE_PATH ? './lib/:./modules/:' + process.env.NODE_PATH : './lib/:./modules/';

if ( cluster.isMaster ) {
    cluster.on('exit', function( worker, code, signal ) {
        console.dir( arguments );
        cluster.fork();
    });

    for ( var i=0; i<config.numChildren; ++i ) {
        cluster.fork();
    }

    // moduleName/bin/app.js hook
    loadModulesAppFiles();
} else {

    // moduleName/bin/app.js hook
    loadModulesAppFiles();

    require('./index.js');
}
