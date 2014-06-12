var utils       = require( 'utils' )
  , env         = utils.bootstrapEnv()
  , moduleLdr   = env.moduleLoader
  , packageJson = env.packageJson
  , expect      = require( 'chai' ).expect
  , injector    = require( 'injector' );

describe( 'test.utils.moduleLoader', function() {

    before( function( done ) {
        packageJson.bundledDependencies.push( 'test-module' );
        done();
    });

    it( 'should load modules', function( done ) {
        this.timeout( 10000 );
        
        moduleLdr.on( 'modulesLoaded', function() {
            done();
        });
        moduleLdr.loadModules();
    });

    it( 'should initialize all module routes', function( done ) {
        moduleLdr.on( 'routesInitialized', function() {
            done();
        });
        moduleLdr.initializeRoutes();
    });
});