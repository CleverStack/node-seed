var fs = require( 'fs' )
  , path = require( 'path' )
  , appRoot = path.resolve( [ __dirname, '..', '..' ].join( path.sep ) )
  , packageJson = require( appRoot + '/package.json' );

// Use this function to get module paths
module.exports = function() {
    var paths = []
      , args = [].slice.call(arguments);

    packageJson.bundledDependencies.forEach( function( name ) {
    	var modulePath = [ 'modules', name ].concat( args ).join( path.sep );
    	if ( fs.existsSync( modulePath ) || ( /(.*)+\/\*/.test( modulePath ) && fs.existsSync( RegExp.$1 + '/' ) ) ) {
        	paths.push( modulePath );
        }
    });

    return paths;
}