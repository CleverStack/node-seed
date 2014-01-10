var packageJson = require( '../../package.json' )
  , path = require( 'path' )
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
			        m[name] = require( [ modulePath, file ].join( '' ) );
			    }
			});
		}
	});

	return m;
}