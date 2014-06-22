var path = require( 'path' )
  , fs = require( 'fs' )
  , fileNames = [ 'seedData' ]
  , packageJson = require( path.resolve( __dirname + '/../../' ) + '/package.json' )
  , configFiles = [ path.resolve( path.join( __dirname, '..', '..', 'schema', 'seedData.json' ) ) ];

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