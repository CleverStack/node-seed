var path = require( 'path' )
  , fs = require( 'fs' )
  , debug = require( 'debug' )( 'Config' )
  , envOverride = process.env.NODE_ENV
        ? process.env.NODE_ENV.toLowerCase()
        : null
  , fileNames = [ 'global', 'default' ]
  , packageJson = require( path.resolve( __dirname + '/../' ) + '/package.json' )
  , configFiles = {
        global: [ __dirname + '/global.json' ],
        env: [ __dirname + '/' + envOverride + '.json' ]
    };

if ( envOverride === null ) {
    debug( 'No environment based config found' );
} else {
    fileNames.push( envOverride );
}

packageJson.bundledDependencies.forEach(function( moduleName ) {
    var moduleConfigPath = [ path.resolve( __dirname + '/../modules' ), moduleName, 'config', '' ].join( path.sep );

    fileNames.forEach(function( fileName ) {
        var filePath = moduleConfigPath + fileName + '.json';
        if ( fs.existsSync( filePath ) ) {
            configFiles[ fileName == 'default' ? 'global' : fileName ].push( filePath );
        }
    });
});

module.exports = require( 'nconf' ).loadFilesSync( [].concat( configFiles.global, configFiles.env ) );