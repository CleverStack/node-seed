var expect      = require( 'chai' ).expect
  , injector    = require( 'injector' )
  , exceptions  = require( 'exceptions' )
  , Service     = injector.getInstance( 'Service' )
  , Model       = injector.getInstance( 'Model' )
  , TestModel
  , TestService
  , test = { name: 'test.class.Service' };

describe( 'Service', function () {

    before( function( done ) {
        TestService = injector.getInstance( 'testModule' ).services.TestService;
        TestModel   = injector.getInstance( 'testModule' ).models.TestModel;

        done();
    });

    it( 'should have loaded the test service', function( done ) {
        expect( TestService instanceof Service.Class ).to.eql( true );
        expect( TestService.on ).to.be.a( 'function' );
        expect( TestService.find ).to.be.a( 'function' );
        expect( TestService.findAll ).to.be.a( 'function' );
        expect( TestService.create ).to.be.a( 'function' );
        expect( TestService.update ).to.be.a( 'function' );
        expect( TestService.destroy ).to.be.a( 'function' );
        expect( TestService.query ).to.be.a( 'function' );
        expect( TestService.model ).to.equal( TestModel );

        done();
    });

    describe( 'query( query, raw )', function() {
        it( 'should run a query and return wrapped model instances' );
        it( 'should run a rawQuery (through options) and return a plain object' );
    });

    describe( 'create( data )', function() {
        it( 'should create a new model instance through the usage of a service', function( done ) {
            TestService
                .create( test )
                .then( function( model ) {
                    expect( model instanceof Model ).to.eql( true );
                    expect( model ).to.be.an( 'object' );
                    expect( model ).to.have.property( 'id' );
                    expect( model ).to.have.property( 'name' ).and.to.eql( 'test.class.Service' );

                    test.id = model.id;

                    done();
                })
                .catch( done );
        });

        it( 'should validate models before saving them in the database', function( done ) {
            TestService
                .create({
                    foobar: true
                })
                .then( done.bind( 'should not have called .then()' ) )
                .catch( function( err ) {
                    expect( err instanceof exceptions.ModelValidation ).to.eql( true );
                    expect( err ).to.have.property( 'message' ).and.to.eql( 'name is required.' );

                    done();
                });
        });
    });

    describe( 'find( idOrWhere )', function() {
        it( 'should find a model instance by id', function( done ) {
            TestService
                .find( test.id )
                .then( function( model ) {
                    expect( model instanceof Model ).to.eql( true );
                    expect( model ).to.have.property( 'id' ).and.eql( test.id );
                    expect( model ).to.have.property( 'name' ).and.eql( test.name );

                    done();
                })
                .catch( done );
        });

        it( 'should find a model instance by where object', function( done ) {
            TestService
                .find({
                    where: {
                        id: test.id
                    }
                })
                .then( function( model ) {
                    expect( model instanceof Model ).to.eql( true );
                    expect( model ).to.have.property( 'id' ).and.eql( test.id );
                    expect( model ).to.have.property( 'name' ).and.eql( test.name );

                    done();
                })
                .catch( done );
        });

        it( 'should not find non existant models', function( done ) {
            TestService
                .find({
                    where: {
                        id: 99999999
                    }
                })
                .then( done )
                .catch( function( err ) {
                    expect( err instanceof exceptions.ModelNotFound ).to.eql( true );
                    expect( err ).to.have.property( 'message' ).and.to.eql( 'Test doesn\'t exist.' );

                    done();
                });
        });
    });

    describe( 'findAll( idOrWhere )', function() {
        it( 'should be able to find models and return a list', function( done ) {
            TestService
                .findAll()
                .then( function( models ) {
                    expect( models ).to.be.an( 'array' );
                    expect( models.length ).to.be.a( 'number' );
                    expect( models.length >= 1 ).equals( true );
                    expect( models[ 0 ] instanceof Model ).to.equal( true );

                    done();
                })
                .catch( done );
        });
        it( 'should be able to find models and return a list', function( done ) {
            TestService
                .findAll({
                    where: {
                        name: 'test.class.Service'
                    }
                })
                .then( function( models ) {
                    expect( models ).to.be.an( 'array' );
                    expect( models.length ).to.be.a( 'number' );
                    expect( models.length === 1 ).equals( true );
                    expect( models[ 0 ] instanceof Model ).to.equal( true );
                    expect( models[ 0 ] ).to.have.property( 'name' ).and.to.equal( 'test.class.Service' );

                    done();
                })
                .catch( done );
        });
        it( 'should be able to use limit:{}' );
        it( 'should be able to use include:{}' );
    });

    describe( 'update( idOrWhere, data )', function() {
        it( 'should be able to update a user', function( done ) {
            test.name = 'test.class.Service - updated';
            TestService
                .update( test.id, test )
                .then( function( model ) {
                    expect( model instanceof Model ).to.equal( true );
                    expect( model ).to.have.property( 'id' ).and.to.equal( test.id );
                    expect( model ).to.have.property( 'name' ).and.to.equal( test.name );

                    done();
                })
                .catch( done );
        });
        it( 'should not be able to update an invalid user', function( done ) {
            TestService
                .update( 999999, { id: 999999, name: 'invalid' } )
                .then( done )
                .catch( function( err ) {
                    expect( err instanceof exceptions.ModelNotFound ).to.eql( true );
                    expect( err ).to.have.property( 'message' ).and.to.eql( 'Test doesn\'t exist.' );

                    done();
                });
        });
    });

    describe( 'destroy( idOrWhere )', function() {
        it( 'should destroy (delete) a user', function( done ) {
            TestService
                .destroy( test.id )
                .then( function( model ) {
                    expect( model ).to.be.an( 'object' );

                    done();
                })
                .catch( done );
        });
        it( 'should not be able to destroy (delete) a non existant user', function( done ) {
            TestService
                .update( 999999 )
                .then( done )
                .catch( function( err ) {
                    console.dir(err);
                    expect( err instanceof exceptions.InvalidData ).to.eql( true );
                    expect( err ).to.have.property( 'message' ).and.to.eql( 'Unable to update Test, you did not provide any data.' );

                    done();
                });
        });
    });

});