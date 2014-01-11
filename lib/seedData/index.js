var path = require( 'path' )
  , fs = require( 'fs' )
  , debug = require( 'debug' )( 'Config' )
  , fileNames = [ 'seedData' ]
  , packageJson = require( path.resolve( __dirname + '/../../' ) + '/package.json' )
  , configFiles = [];

packageJson.bundledDependencies.forEach(function( moduleName ) {
    var moduleConfigPath = [ path.resolve( __dirname + '/../../modules' ), moduleName, 'schema', '' ].join( path.sep );

    fileNames.forEach(function( fileName ) {
        var filePath = moduleConfigPath + fileName + '.json';
        if ( fs.existsSync( filePath ) ) {
            configFiles.push( filePath );
        }
    });
});

module.exports = require( 'nconf' ).loadFilesSync( configFiles );