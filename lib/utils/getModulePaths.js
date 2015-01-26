var fs          = require( 'fs' )
  , path        = require( 'path' )
  , appRoot     = path.resolve( path.join( __dirname, '..', '..' ) )
  , packageJson = require( path.join( appRoot, 'package.json' ) );

// Use this function to get module paths
module.exports  = function() {
    var paths   = []
      , args    = [].slice.call(arguments);

    packageJson.bundledDependencies.forEach( function( name ) {
        var modulePath = [ 'modules', name ].concat( args ).join( path.sep );
        if ( fs.existsSync( modulePath ) || fs.existsSync( path.dirname( modulePath ) ) ) {
            paths.push( modulePath );
        }
    });

    return paths;
}