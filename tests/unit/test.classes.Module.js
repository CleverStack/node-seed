var utils       = require( 'utils' )
  , env         = utils.bootstrapEnv()
  , moduleLdr   = env.moduleLoader
  , packageJson = env.packageJson
  , expect      = require( 'chai' ).expect
  , injector    = require( 'injector' )
  , Model       = injector.getInstance( 'Model' )
  , Service     = injector.getInstance( 'Service' )
  , Controller  = injector.getInstance( 'Controller' )
  , testModule

describe( 'test.classes.Module', function() {

    describe( 'test-module', function() {
        it( 'should have loaded the test module', function( done ) {
            expect( moduleLdr.moduleIsEnabled( 'test-module' ) ).to.equal( true );
            testModule = require( 'test-module' );
            done();
        });

        it( 'should have loaded models', function( done ) {
            expect( testModule.models.TestModel.prototype instanceof Model ).to.equal( true );

            done();
        });

        it( 'should have loaded services', function( done ) {
            expect( testModule.services.TestService instanceof Service.Class ).to.equal( true );

            done();
        });

        it( 'should have loaded controllers', function( done ) {
            expect( testModule.controllers.TestController.prototype instanceof Controller ).to.equal( true );

            done();
        });

        
        describe( 'hooks', function() {
            it( 'preSetup', function( done ) {
                expect( testModule.calledMethods.indexOf( 'preSetup' ) ).to.equal( 0 );
                done();
            });

            it( 'preInit', function( done ) {
                expect( testModule.calledMethods.indexOf( 'preInit' ) ).to.equal( 1 );
                done();
            });

            it( 'init', function( done ) {
                expect( testModule.calledMethods.indexOf( 'init' ) ).to.equal( 2 );
                done();
            });

            it( 'configureApp', function( done ) {
                expect( testModule.calledMethods.indexOf( 'configureApp' ) ).to.equal( 3 );
                done();
            });

            it( 'preResources', function( done ) {
                expect( testModule.calledMethods.indexOf( 'preResources' ) ).to.equal( 4 );
                done();
            });

            it( 'modulesLoaded', function( done ) {
                expect( testModule.calledMethods.indexOf( 'modulesLoaded' ) ).to.equal( 5 );
                done();
            });
        });
    });
});