var utils       = require( 'utils' )
  , env         = utils.bootstrapEnv()
  , moduleLdr   = env.moduleLoader
  , expect      = require( 'chai' ).expect
  , injector    = require( 'injector' );

describe( 'test.utils.magicModule', function() {

    it( 'Should have "models" magic module', function( done ) {
        var models = require( 'models' );

        expect( models ).to.be.an( 'object' );
        expect( models ).to.have.property( 'Test' );

        done();
    });

    it( 'Should have "services" magic module', function( done ) {
        var services = require( 'services' );

        expect( services ).to.be.an( 'object' );
        expect( services ).to.have.property( 'TestService' );

        done();
    });

    it( 'Should have "controllers" magic module', function( done ) {
        var controllers = require( 'controllers' );

        expect( controllers ).to.be.an( 'object' );
        // Cant do this because it loads its own package.json
        // expect( controllers ).to.have.property( 'TestController' );

        done();
    });

    it( 'Should have "classes" magic module', function( done ) {
        var classes = require( 'classes' );

        expect( classes ).to.be.an( 'object' );
        expect( classes ).to.have.property( 'Class' );
        expect( classes ).to.have.property( 'Model' );
        expect( classes ).to.have.property( 'Service' );
        expect( classes ).to.have.property( 'Controller' );

        done();
    });

    it( 'Should have "config" magic module', function( done ) {
        expect( require( 'config' ) ).to.be.an( 'object' );
        done();
    });

    it( 'Should have "injector" magic module', function( done ) {
        expect( require( 'injector' ) ).to.be.an( 'object' );
        done();
    });

    it( 'Should have "seedData" magic module', function( done ) {
        expect( require( 'seedData' ) ).to.be.an( 'object' );
        done();
    });

    it( 'Should have "utils" magic module', function( done ) {
        expect( require( 'utils' ) ).to.be.an( 'object' );
        done();
    });

});