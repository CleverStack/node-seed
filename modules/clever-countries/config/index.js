var db = __dirname + '/db.json'
  , fs = require( 'fs' );

if ( !fs.existsSync( db ) ) {
    console.info( 'db.json not found.' );
}

var config = require( 'nconf' ).loadFilesSync( [ db ] );

module.exports = config;
