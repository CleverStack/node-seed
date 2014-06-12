var utils       = require( 'utils' )
  , env         = utils.bootstrapEnv()
  , moduleLdr   = env.moduleLoader
  , ncp         = require( 'ncp' );

describe( 'test.utils.bootstrapEnv', function() {
    before( function( done ) {
        this.timeout( 10000 );



        moduleLdr.on( 'modulesLoaded', function() {
            TestController = injector.getInstance( 'testModule' ).controllers.TestController;
            moduleLdr.initializeRoutes();
        });

        moduleLdr.on( 'routesInitialized', function() {
            done();
        });

        moduleLdr.loadModules();
    });

    it( 'Should have bootstrapped the environment', function( done ) {
        expect( env.to.be.a( 'object' ) );
    });
});