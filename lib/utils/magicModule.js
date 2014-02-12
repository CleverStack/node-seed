var path = require( 'path' )
  , packageJson = require( path.resolve( __dirname + '/../../' ) + '/package.json' )
  , dbModules = [ 'clever-orm', 'clever-odm' ]
  , fs = require( 'fs' )
  , cache = {};

module.exports = function( folderName ) {
	if ( typeof cache[ folderName ] !== 'object' ) {
		cache[ folderName ] = {};
	}

	var m = cache[ folderName ]
	  , modulePaths = []
	  , moduleLoader = ( typeof injector !== 'undefined' )
	  		? injector.getInstance( 'moduleLoader' )
	  		: false;

	// Make sure the global one is included
	modulePaths.push( path.resolve( [ __dirname, '..', folderName ].join( path.sep ) ) + path.sep );

	// Build every modules path
	packageJson.bundledDependencies.forEach(function( moduleName ) {
		if ( dbModules.indexOf( moduleName ) === -1 || ( dbModules.indexOf( moduleName ) !== -1 && moduleLoader && moduleLoader.moduleIsEnabled( moduleName ) ) ) {
			modulePaths.push( [ path.resolve( __dirname + '/../../modules' ), moduleName, folderName, '' ].join( path.sep ) );
		}
	});

	// Load all files in all folders
	modulePaths.forEach(function( modulePath ) {
		if ( fs.existsSync( modulePath ) ) {
			fs.readdirSync( modulePath ).forEach(function( file ) {
			    if ( file.match( /.+\.js$/g ) !== null && file !== 'index.js' && file !== 'module.js' ) {
			        var name = file.replace( '.js', '' );

			        if ( m[ name ] === undefined ) {
			        	m[name] = require( [ modulePath, file ].join( '' ) );
			        }
			    }
			});
		}
	});

	return m;
}