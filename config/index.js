var files = [ __dirname + '/global.json', __dirname + '/orm.json' ]
  , fs = require( 'fs' )
  , envConfigOverride = __dirname + '/' + (process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : 'local') + '.json';

if ( fs.exists( envConfigOverride ) ) {
	files.push( envConfigOverride );
} else {
	console.error( 'Error: No configuration for environment: ' + process.env.NODE_ENV )
}

module.exports = require( 'nconf' ).loadFilesSync( files );