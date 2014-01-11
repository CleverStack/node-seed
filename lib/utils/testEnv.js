// Bootstrap the environment
var env = require( './bootstrapEnv.js' )();

module.exports = function() {
	if ( !env.moduleLoader.modulesLoaded ) {
		env.preRouteHook = function() {
			console.log( 'Skipping routes' );
		};

		// Load all the modules
		env.moduleLoader.loadModules();

		// Initialize all the modules
		env.moduleLoader.initializeModules( injector );
	}
	
	return env;
}