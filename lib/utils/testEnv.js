// Bootstrap the environment
var env = require( './bootstrapEnv.js' )()
  , debug = require( 'debug' )( 'utils:testEnv' )
  , packageJson = env.packageJson;

function testEnv( cb ) {
    var ormEnabled = packageJson.bundledDependencies.indexOf( 'clever-orm' ) !== -1
      , odmEnabled = packageJson.bundledDependencies.indexOf( 'clever-odm' ) !== -1

    if ( ormEnabled ) {
        debug( 'Rebasing ORM DB' );

        injector.getInstance( 'sequelize' )
            .sync( { force: true } )
            .success(function() {
                debug( 'Database is rebased' );
                injector.inject( cb );
            })
            .error(function( err ) {
                debug( 'Error trying to connect to ' + env.config['clever-orm'].db.options.dialect, err );
            });
    }
}

module.exports = function() {
    if ( !env.moduleLoader.modulesLoaded ) {
        debug( 'Calling loadModules() on the moduleLoader' );

        // Load all the modules
        env.moduleLoader.loadModules();
    }

    return testEnv;
}