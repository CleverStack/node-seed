if ( typeof GLOBAL.injector === 'undefined' ) {
	GLOBAL.injector = null;
}

module.exports = function() {
	if ( injector === null ) {
		var path = require( 'path' )
		  , appRoot = path.resolve( __dirname + '/../..')
		  , config = require( appRoot + '/config' )
		  , packageJson = require( appRoot + '/package.json' )
		  , express = require( 'express' )
		  , app = express()
		  , moduleLoader
		  , bootstrappedEnv;

		// Bootstrap our DI
		GLOBAL.injector = require( './injector.js' )();

		injector.instance( 'express', express );
		injector.instance( 'app', app );
		injector.instance( 'config', config );
		injector.instance( 'packageJson', packageJson );

		// Load our modules and initialize them
		moduleLoader = require( './moduleLoader' ).getInstance();

		// Add our moduleLoader to the injector
		injector.instance( 'moduleLoader', moduleLoader );

		bootstrappedEnv = {
			config: config,
			express: express,
			app: app,
			moduleLoader: moduleLoader,
			webPort: process.env.NODE_WWW_PORT || config.webPort || 8080,
			packageJson: packageJson
		};

		injector.instance( 'bootstrappedEnv', bootstrappedEnv );
	} else {
		bootstrappedEnv = injector.getInstance( 'bootstrappedEnv' );
	}

	return bootstrappedEnv;
}