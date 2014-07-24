var path        = require( 'path' )
  , fs          = require( 'fs' )
  , fileNames   = [ 'seedData' ]
  , packageJson = require( path.resolve( __dirname + '/../../' ) + '/package.json' )
  , seedData    = require( path.resolve( path.join( __dirname, '..', '..', 'schema', 'seedData.json' ) ) );

packageJson.bundledDependencies.forEach(function( moduleName ) {
    var moduleConfigPath = [ path.resolve( __dirname + '/../../modules' ), moduleName, 'schema', '' ].join( path.sep );

    fileNames.forEach(function( fileName ) {
        var filePath = moduleConfigPath + fileName + '.json';
        if ( fs.existsSync( filePath ) ) {
            var data = require( filePath );
            Object.keys( data ).forEach( function( key ) {
                if ( !!seedData[ key ] ) {
                    seedData[ key ] = seedData[ key ].concat( data[ key ] );
                } else {
                    seedData[ key ] = data[ key ];
                }
            })
        }
    });
});

module.exports = seedData;