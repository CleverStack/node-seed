var fs = require('fs')
  , utils = require( 'utils' );

// Bootstrap the environment, but don't initializeModuleRoutes( injector )
var env = utils.bootstrapEnv();

// Load all the modules
env.moduleLoader.loadModules();

// Force a sync
console.log('Forcing Database to be created! (Note: All your data will disapear!)');

injector.getInstance( 'sequelize' )
    .sync( { force: true } )
    .success(function () {
    	console.log('Database is rebased');
        // fs.readFile(__dirname + '/../schema/' + config.db.options.dialect + '.sql', function(err, sql) {
            // if ( err || !sql ) {
            //     console.log('Database is rebased');
            //     if ( config.odm && config.odm.enabled ) {
            //       mongoose.disconnect();
            //     }
            // } else {
            //     console.log('Running dialect specific SQL');
            //     sequelize.query(sql.toString()).success(function() {
            //         console.log('Database is rebased');
            //         if ( config.odm && config.odm.enabled ) {
            //           mongoose.disconnect();
            //         }
            //     }).error(function(err) {
            //             console.error(err);
            //         });
            // }
        // });
    })
    .error(function( err ) {
        console.error('Error trying to connect to ' + env.config.orm.db.options.dialect, err);
        // if ( config.odm && config.odm.enabled ) {
        //   mongoose.disconnect();
        // }
    });
