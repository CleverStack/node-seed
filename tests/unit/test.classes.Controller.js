var expect      = require( 'chai' ).expect
  , async       = require( 'async' )
  , sinon       = require( 'sinon' )
  , underscore  = require( 'underscore' )
  , path        = require( 'path' )
  , util        = require( 'util' )
  , injector    = require( 'injector' )
  , debug       = require( 'debug' )( 'ControllerTests' )
  , packageJson = injector.getInstance( 'packageJson' )
  , moduleLdr   = injector.getInstance( 'moduleLoader' )
  , Emitter     = require( 'events' ).EventEmitter
  , fixtureDir  = path.resolve( path.join( __dirname, 'test-module' ) )
  , models      = [ { name: 'Testing' }, { name: 'Testing' } ];

describe ( 'Controller', function () {

    before( function( done ) {
        TestController = injector.getInstance( 'testModule' ).controllers.TestController;
        done();
    });

    function fakeRequest( req ) {
        req.method  = req.method || 'GET';
        req.uri     = req.uri || '/test';
        req.query   = req.query || {};
        req.body    = req.body || {};
        req.params  = req.params || {};

        return req;
    };

    function fakeResponse( cb ) {
        return {
            json: function( code, message ) {
                setTimeout( function() {
                    cb( code, JSON.parse( JSON.stringify( message ) ) )                    
                }, 10 );
            },

            send: function( code, message ) {
                setTimeout( function() {
                    cb( code, message )
                }, 10 );
            }
        };
    };

    describe( 'Configuration and features', function() {
        it( 'Does not route when Class.autoRouting = false' );
        it( 'Calls middleware functions when Class.autoRouting = [ middlewareFunc, ... ]' )
        it( 'Can figure out Controller name by filename of extending file' );
        it( 'Allows for strict overriding of route' );
        it( 'Allows your to use | to define multiple strict overriding routes, like "route|route|route|route" .... ' )
        it( 'Can correctly calculate both plural and non plural routes for controller based on name' );
        it( 'Does not autoBind routes more than once' );
        it( 'Correctly assigns this.action before calling restful or action based route functions' );
        it( 'Attach function correctly attachs and routes' );
    });

    describe( 'Restful Routing', function() {

        describe( '.postAction():  Using route "POST /test" or "POST /tests"', function() {

            it( 'Should create a new model instance and save it in the database', function( done ) {
                var ctrl = null
                  , model = models[ 0 ];

                var req = fakeRequest({
                        method: 'POST',
                        body: underscore.extend( {}, model )
                    });

                var res = fakeResponse( function( code, result ) {
                    expect( code ).to.equal( 200 );
                    expect( result ).to.be.an( 'object' );
                    expect( ctrl.action ).to.equal( 'postAction' );

                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'name', model.name );
                    expect( result ).to.have.property( 'createdAt' );
                    expect( result ).to.have.property( 'updatedAt' );
                    
                    model.id = result.id;
                    model.createdAt = result.createdAt;
                    model.updatedAt = result.updatedAt;

                    done();
                });

                this.timeout( 10000 );
                var ctrl = TestController.callback( 'newInstance' )( req, res );
            });

            it( 'Should not be able to create a new model without posting data', function( done ) {
                var ctrl = null;

                var req = fakeRequest({
                    method: 'POST'
                });

                var res = fakeResponse( function( code, result ) {
                    expect( code ).to.equal( 500 );
                    expect( result ).to.be.an( 'object' );
                    expect( ctrl.action ).to.equal( 'postAction' );

                    expect( result ).to.have.property( 'error' );
                    expect( result.error ).to.contain( 'Invalid data' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

            it( 'Should redirect/call .putAction() if you post data with an id in the QueryString like /test?id=1', function( done ) {
                var ctrl = null
                  , model = models[ 0 ];

                model.name = 'Should call putAction() if you post data with an id like POST /model';

                var req = fakeRequest({
                    method: 'POST',
                    body: underscore.extend( {}, model )
                });

                var res = fakeResponse( function( code, result ) {
                    expect( code ).to.equal( 200 );
                    expect( result ).to.be.an( 'object' );
                    expect( ctrl.action ).to.equal( 'putAction' );

                    expect( result ).to.have.property( 'id' );
                    expect( result.id ).to.equal( model.id );

                    expect( result ).to.have.property( 'updatedAt' );
                    model.updatedAt = result.updatedAt;

                    expect( result ).to.have.property( 'deletedAt' );
                    expect( result.deletedAt ).to.equal( null );

                    model.deletedAt = result.deletedAt;

                    expect( result ).to.eql( model );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

            it( 'Should redirect/call .putAction() if you post data with an id like /test/1', function( done ) {
                var ctrl = null
                  , model = models[ 0 ];

                model.name = 'Should call putAction() if you post data without an id like POST /model/:id';

                var req = fakeRequest({
                    method: 'POST',
                    params: { id: model.id },
                    body: underscore.extend( { }, model )
                });

                // Remove the id from the POST data
                delete req.body.id;

                var res = fakeResponse( function( code, result ) {
                    expect( code ).to.equal( 200 );
                    expect( result ).to.be.an( 'object' );
                    expect( ctrl.action ).to.equal( 'putAction' );

                    expect( result ).to.have.property( 'id' );
                    expect( result.id ).to.equal( model.id );

                    expect( result ).to.have.property( 'updatedAt' );
                    model.updatedAt = result.updatedAt;

                    expect( result ).to.have.property( 'deletedAt' );
                    expect( result.deletedAt ).to.equal( null );

                    model.deletedAt = result.deletedAt;

                    expect( result ).to.eql( model );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

        });

        describe( '.listAction():  Using route "GET /test" or "GET /tests"', function() {

            it( 'Should send all existing model instances as an array')
            it( 'Should send an array of matching model instances, using QueryString (/test?field=value&)')

        });

        describe( '.getAction():  Using route "GET /test" or "GET /tests"', function() {

            it( 'Should send an existing model instance by id when its specified in the uri/url like /test/:id');
            it( 'Should send an existing model instance by id when using the QueryString like /test?id=1');
            it( 'Should not return non existant models (or crash) for either QueryString or URI');
            it( 'Should call listAction() when there is no id specified in either the QueryString or URI')

        });


        describe( '.putAction():  Using route "PUT /test/:id" or "PUT /tests?id=1"', function() {

            it( 'Can find and update model instances' );

        });

        describe( '.deleteAction():  Using route "DELETE /test/:id" or "DELETE /tests?id=1"', function() {

            it( 'Can delete model instances' );
            it( 'Handles errors nicely' );

        });
    });

    describe( 'Action Routing', function() {

        describe( '.postAction():  Using route "POST /test" or "POST /tests"', function() {

            it( 'Should create a new model instance and save it in the database', function( done ) {
                var ctrl = null
                  , model = models[ 1 ];

                var req = fakeRequest({
                        method: 'POST',
                        body: underscore.extend( {}, model )
                    });

                var res = fakeResponse( function( code, result ) {
                    expect( code ).to.equal( 200 );
                    expect( result ).to.be.an( 'object' );
                    expect( ctrl.action ).to.equal( 'postAction' );

                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'name', model.name );
                    expect( result ).to.have.property( 'createdAt' );
                    expect( result ).to.have.property( 'updatedAt' );
                    
                    model.id = result.id;
                    model.createdAt = result.createdAt;
                    model.updatedAt = result.updatedAt;

                    done();
                });

                this.timeout( 10000 );
                var ctrl = TestController.callback( 'newInstance' )( req, res );
            });

            it( 'Should not be able to create a new model without posting data', function( done ) {
                var ctrl = null;

                var req = fakeRequest({
                    method: 'POST'
                });

                var res = fakeResponse( function( code, result ) {
                    expect( code ).to.equal( 500 );
                    expect( result ).to.be.an( 'object' );
                    expect( ctrl.action ).to.equal( 'postAction' );

                    expect( result ).to.have.property( 'error' );
                    expect( result.error ).to.contain( 'Invalid data' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

        });

        describe( '.listAction():  Using route "GET /test" or "GET /tests"', function() {

            it( 'Should send all existing model instances as an array')
            it( 'Should send an array of matching model instances, using QueryString (/test?field=value&)')

        });

        describe( '.getAction():  Using route "GET /test" or "GET /tests"', function() {

            it( 'Should send an existing model instance by id when its specified in the uri/url like /test/:id');
            it( 'Should send an existing model instance by id when using the QueryString like /test?id=1');
            it( 'Should not return non existant models (or crash) for either QueryString or URI');
            it( 'Should call listAction() when there is no id specified in either the QueryString or URI')

        });


        describe( '.putAction():  Using route "PUT /test/:id" or "PUT /tests?id=1"', function() {

            it( 'Can find and update model instances' );

        });

        describe( '.deleteAction():  Using route "DELETE /test/:id" or "DELETE /tests?id=1"', function() {

            it( 'Can delete model instances' );
            it( 'Handles errors nicely' );

        });

    });

});