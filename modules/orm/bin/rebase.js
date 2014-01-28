var fs = require( 'fs' )
  , utils = require( 'utils' )
  , env = utils.bootstrapEnv(); // Bootstrap the environment

console.log('Forcing Database to be created! (Note: All your data will disapear!)');

// Load all the modules
env.moduleLoader.loadModules();

// Force a sync
injector.getInstance( 'sequelize' )
    .sync( { force: true } )
    .success(function () {
    	console.log( 'Database is rebased' );
        // @TODO implement dialect specific SQL running after rebase (triggers etc)

        env.moduleLoader.shutdown();
    })
    .error(function( err ) {
        console.error('Error trying to connect to ' + env.config.orm.db.options.dialect, err);

        env.moduleLoader.shutdown();
    });