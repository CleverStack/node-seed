var files = [ __dirname + '/global.json', __dirname + '/orm.json' ]
  , fs = require( 'fs' )
  , envConfigOverride = __dirname + '/' + (process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : 'local') + '.json';

if ( fs.existsSync( envConfigOverride ) ) {
	files.push( envConfigOverride );
} else {
	throw new Error( 'Error: No configuration for environment: ' + process.env.NODE_ENV );
}

var config = require( 'nconf' ).loadFilesSync( files );

var odmFile = __dirname + '/odm.json';
if ( fs.existsSync( odmFile ) ) {
    var odm = require( 'nconf' ).loadFilesSync( [__dirname + '/odm.json'] );
    for ( var m in odm.models ) {
        if( odm.models.hasOwnProperty( m ) ){
            config.models.push(odm.models[m]);
        }
    }
}

module.exports = config;