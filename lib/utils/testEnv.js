// Bootstrap the environment
var env = require( './bootstrapEnv.js' )()
  , injector = require( 'injector' )
  , debug = require( 'debug' )( 'testEnv' )
  , packageJson = env.packageJson;

function testEnv( cb ) {
    if ( env.moduleLoader.modulesLoaded ) {
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
    } else {
        env.moduleLoader.on( 'modulesLoaded', function() {
            testEnv( cb );
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