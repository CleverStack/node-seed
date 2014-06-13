var path        = require( 'path' )
  , injector    = require( 'injector' )
  , packageJson = require( path.resolve( path.join( __dirname, '..', '..', 'package.json' ) ) )
  , dbModules   = [ 'clever-orm', 'clever-odm' ]
  , fs          = require( 'fs' )
  , async       = require( 'async' )
  , debug       = require( 'debug' )( 'MagicModule' )
  , cache       = {}
  , loaded      = {};

function loadResourcesForPath( folderName, modulePath ) {
    if ( fs.existsSync( modulePath ) ) {
        fs.readdirSync( modulePath ).forEach(function( file ) {
            if ( file.match( /.+\.js$/g ) !== null && file !== 'index.js' && file !== 'module.js' ) {
                var name = file.replace( '.js', '' );

                if ( cache[ folderName ][ name ] === undefined ) {
                    Object.defineProperty( cache[ folderName ], name, {
                        get: function() {
                            if ( !loaded[ folderName ][ name ] ) {
                                debug( 'Loading ' + name + ' into ' + folderName + ' magic module...' );
                                loaded[ folderName ][ name ] = require( [ modulePath, file ].join( '' ) );
                            }
                            return loaded[ folderName ][ name ];
                        },
                        enumerable: true
                    });
                }
            }
        });
    }
}

module.exports = function( folderName ) {
    debug( 'Creating magic module for ' + folderName );

    if ( typeof cache[ folderName ] !== 'object' ) {
        cache[ folderName ] = {};
        loaded[ folderName ] = {};
    }

    var modulePaths = []
      , moduleLoader = ( typeof injector !== 'undefined' )
            ? injector.getInstance( 'moduleLoader' )
            : false;

    // Make sure the global one is included
    modulePaths.push( folderName, path.resolve( [ __dirname, '..', folderName ].join( path.sep ) ) + path.sep );

    // Build every modules path
    packageJson.bundledDependencies.forEach(function( moduleName ) {
        if ( dbModules.indexOf( moduleName ) === -1 || ( dbModules.indexOf( moduleName ) !== -1 && moduleLoader && moduleLoader.moduleIsEnabled( moduleName ) ) ) {
            modulePaths.push( [ path.resolve( __dirname + '/../../modules' ), moduleName, folderName, '' ].join( path.sep ) );
        }
    });

    // Load all files in all folders
    modulePaths.forEach( function( modulePath ) {
        loadResourcesForPath( folderName, modulePath );
    });

    return cache[ folderName ];
}