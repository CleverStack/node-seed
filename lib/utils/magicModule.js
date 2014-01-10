var path = require( 'path' )
  , packageJson = require( path.resolve( __dirname + '/../../' ) + '/package.json' )
  , fs = require( 'fs' );

module.exports = function( folderName ) {
	var m = {}
	  , modulePaths = [];

	packageJson.bundledDependencies.forEach(function( moduleName ) {
		modulePaths.push( [ path.resolve( __dirname + '/../../modules' ), moduleName, folderName, '' ].join( path.sep ) );
	});

	modulePaths.forEach(function( modulePath ) {
		if ( fs.existsSync( modulePath ) ) {
			fs.readdirSync( modulePath ).forEach(function( file ) {
			    if ( file.match( /.+\.js$/g ) !== null && file !== 'index.js' && file !== 'module.js' ) {
			        var name = file.replace( '.js', '' );

			        if ( m[ name ] === undefined ) {
			        	m[name] = require( [ modulePath, file ].join( '' ) );
			        } else {
			        	throw new Error( [ 'Duplicate filename in module', modulePath.split( '/' ).pop(), 'with path of', file  ].join( ' ' ) );
			        }
			    }
			});
		}
	});

	return m;
}