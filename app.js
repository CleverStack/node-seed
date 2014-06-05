var cluster = require( 'cluster' )
  , config = require( './config' )
  , packageJson = require( './package.json' )
  , path = require( 'path' )
  , os = require( 'os' )
  , isWin = /^win32/.test( os.platform() )
  , fs = require( 'fs' );

function loadModulesAppFiles( moduleName ) {
    packageJson.bundledDependencies.forEach(function( moduleName ) {
        var file = [ path.resolve( './' ), 'modules', moduleName, 'bin', 'app.js' ].join( path.sep );
        if ( fs.existsSync( file ) ) {
            require( file )( cluster, config, packageJson );
        }
    });
}

// Set the node path - this works only because the other processes are forked. (Be sure to use the right delimiter)
process.env.NODE_PATH = process.env.NODE_PATH 
    ? [ './lib/', './modules', process.env.NODE_PATH ].join( isWin ? ';' : ':' )
    : [ './lib/', './modules' ].join( isWin ? ';' : ':' );

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
