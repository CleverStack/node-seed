var fs = require( 'fs' )
  , path = require( 'path' )
  , appRoot = path.resolve( [ __dirname, '..', '..' ].join( path.sep ) )
  , packageJson = require( appRoot + '/package.json' );

// Use this function to get module paths
module.exports = function() {
    var paths = []
      , args = [].slice.call(arguments)
      , withGlob = true;

    if ( typeof args[ 0 ] === 'boolean' ) {
    	withGlob = args.shift();
    }

    packageJson.bundledDependencies.forEach( function( name ) {
    	var modulePath = [ 'modules', name ].concat( args, [ ( !withGlob ? '' : '**/*.js' ) ] ).join( path.sep )
    	if ( fs.existsSync( modulePath ) ) {
        	paths.push( modulePath );
    	}
    });

    return paths;
}