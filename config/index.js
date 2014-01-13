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
        env: [ ]
    };

if ( envOverride === null ) {
    debug( 'No environment based config set using NODE_ENV, defaulting to "local" configuration' );
    envOverride = 'local';
}

configFiles.env.push( [ __dirname, envOverride ].join( path.sep ) + '.json' );

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