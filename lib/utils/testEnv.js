// Bootstrap the environment
var env = require( './bootstrapEnv.js' )();

module.exports = function() {
	if ( !env.moduleLoader.modulesLoaded ) {
		// Load all the modules, but don't initializeModuleRoutes( injector )
		env.moduleLoader.loadModules();
	}
	
	return env;
}