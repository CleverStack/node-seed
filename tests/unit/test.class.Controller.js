var expect      = require( 'chai' ).expect
  , sinon       = require( 'sinon' )
  , underscore  = require( 'underscore' )
  , injector    = require( 'injector' )
  , models      = [ { name: 'Testing' }, { name: 'Testing' } ];

describe( 'Controller', function () {

    before( function( done ) {
        TestController = injector.getInstance( 'testModule' ).controllers.TestController;
        TestMiddlewareAndRouteController = injector.getInstance( 'testModule' ).controllers.TestMiddlewareAndRouteController;
        done();
    });

    function fakeRequest( req ) {
        req.method  = req.method || 'GET';
        req.url     = req.url || '/test';
        req.query   = req.query || {};
        req.body    = req.body || {};
        req.params  = req.params || {};

        return req;
    }

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
    }

    it( 'Allows route to be strictly defined as string', function( done ) {
        expect( TestMiddlewareAndRouteController.route ).to.eql( '/testcustomroute|/testcustomroutes' );
        done();
    });

    it( 'Allows route to be strictly defined as an array' );

    it( 'Allows route (non plural and plural) to be guessed based on filename', function( done ) {
        expect( TestController.route ).to.eql( '[POST] /test/?|/test/:id/?|/test/:id/:action/?|/tests/?|/tests/:action/?' );
        done();
    });

    it( 'Routes to functions that have "Action" on the end of their name', function( done ) {
        var ctrl = null;

        var req = fakeRequest({
            method: 'GET',
            url: '/test/custom'
        });

        var res = fakeResponse( function( code, result ) {
            expect( result ).to.eql( { message: 'Hello from customAction' } );
            expect( code ).to.equal( 200 );
            expect( ctrl.action ).to.equal( 'customAction' );

            done();
        });

        this.timeout( 10000 );
        ctrl = TestController.callback( 'newInstance' )( req, res );
    });

    it( 'Cannot route to functions that have "Action" on the end of their name', function( done ) {
        var ctrl = null;

        var req = fakeRequest({
            method: 'GET',
            url: '/test/hidden'
        });

        // Should fall through to the listAction (based on restfulRouting)
        var res = fakeResponse( function( code, result ) {
            expect( result ).to.eql( [] );
            expect( code ).to.equal( 200 );
            expect( ctrl.action ).to.equal( 'listAction' );

            done();
        });

        this.timeout( 10000 );
        ctrl = TestController.callback( 'newInstance' )( req, res );
    });

    it( 'Allows for multiple strict override routes separated by "|", like "/testcustomroute|/testcustomroutes"', function( done ) {
        var ctrlOne = null
          , ctrlTwo = null
          , called = 0;

        var reqOne = fakeRequest({
            method: 'GET',
            uri: '/customroute'
        });

        var resOne = fakeResponse( function( code, result ) {
            expect( result ).to.eql( { message: 'Hello from TestMiddlewareAndRouteController' } );
            expect( code ).to.equal( 200 );
            expect( ctrlOne.action ).to.equal( 'listAction' );

            called++;

            if ( called === 2 ) {
                done();
            }
        });

        var reqTwo = fakeRequest({
            method: 'GET',
            url: '/customroutes'
        });

        var resTwo = fakeResponse( function( code, result ) {
            expect( result ).to.eql( { message: 'Hello from TestMiddlewareAndRouteController' } );
            expect( code ).to.equal( 200 );
            expect( ctrlTwo.action ).to.equal( 'listAction' );

            called++;

            if ( called === 2 ) {
                done();
            }
        });

        this.timeout( 10000 );
        ctrlOne = TestMiddlewareAndRouteController.callback( 'newInstance' )( reqOne, resOne );
        ctrlTwo = TestMiddlewareAndRouteController.callback( 'newInstance' )( reqTwo, resTwo );
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
                    expect( result ).to.be.an( 'object' );
                    expect( code ).to.equal( 200 );
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
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

            it( 'Should not be able to create a new model without posting data', function( done ) {
                var ctrl = null;

                var req = fakeRequest({
                    method: 'POST'
                });

                var res = fakeResponse( function( code, result ) {
                    expect( code ).to.equal( 400 );

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statusCode' ).and.to.eql( 400 );
                    expect( result ).to.have.property( 'message' ).and.to.eql( 'Invalid data provided to Model.create({})' );

                    expect( spy.called ).to.eql( true );
                    expect( ctrl.action ).to.equal( 'postAction' );

                    spy.restore();

                    done();
                });

                var spy = sinon.spy( TestController.prototype, 'postAction' );

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
                    expect( result ).to.be.an( 'object' );
                    expect( code ).to.equal( 200 );
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
                    expect( result ).to.be.an( 'object' );
                    expect( code ).to.equal( 200 );
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

            it( 'Should send all existing model instances as an array', function( done ) {
                var ctrl = null;

                var req = fakeRequest({
                    method: 'GET'
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.eql( [ models[ 0 ] ] );
                    expect( code ).to.equal( 200 );
                    expect( ctrl.action ).to.equal( 'listAction' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

            it( 'Should send an array of matching model instances, using QueryString (/test?field=value&)', function( done ) {
                var ctrl = null;

                var req = fakeRequest({
                    method: 'GET',
                    url: '/test',
                    query: {
                        name: models[ 0 ].name
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.eql( [ models[ 0 ] ] );
                    expect( code ).to.equal( 200 );
                    expect( ctrl.action ).to.equal( 'listAction' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

        });

        describe( '.getAction():  Using route "GET /test" or "GET /tests"', function() {

            it( 'Should send an existing model instance by id when its specified in the uri/url like /test/:id', function( done ) {
                var ctrl = null;

                var req = fakeRequest({
                    method: 'GET',
                    url: '/test/' + models[ 0 ].id,
                    params: {
                        id: models[ 0 ].id
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.eql( models[ 0 ] );
                    expect( code ).to.equal( 200 );
                    expect( ctrl.action ).to.equal( 'getAction' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

            it( 'Should send an existing model instance by id when using the QueryString like /test?id=1', function( done ) {
                var ctrl = null;

                var req = fakeRequest({
                    method: 'GET',
                    url: '/test/' + models[ 0 ].id,
                    query: {
                        id: models[ 0 ].id
                    },
                    params: {
                        id: models[ 0 ].id
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.eql( models[ 0 ] );
                    expect( code ).to.equal( 200 );
                    expect( ctrl.action ).to.equal( 'getAction' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

            it( 'Should not return non existant models (or crash) for either QueryString or URI', function( done ) {
                var ctrl = null;

                var req = fakeRequest({
                    method: 'GET',
                    url: '/test/99999999',
                    query: {
                        id: 99999999
                    },
                    params: {
                        id: 99999999
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.eql( { statusCode: 404, message: 'Test doesn\'t exist.' } );
                    expect( code ).to.equal( 404 );
                    expect( ctrl.action ).to.equal( 'getAction' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

            it( 'Should call listAction() when there is no id specified in either the QueryString or URI', function( done ) {
                var ctrl = null;

                var req = fakeRequest({
                    method: 'GET',
                    url: '/test'
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.eql( [ models[ 0 ] ] );
                    expect( code ).to.equal( 200 );
                    expect( ctrl.action ).to.equal( 'listAction' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

        });


        describe( '.putAction():  Using route "PUT /test/:id" or "PUT /tests?id=1"', function() {

            it( 'Update a model when the id is in QueryString like /test?id=1', function( done ) {
                var ctrl = null
                
                models[ 0 ].name = 'putAction updated with querystring id';

                var model = underscore.extend( {}, models[ 0 ] )
                  , id = model.id;

                delete model.id;

                var req = fakeRequest({
                    method: 'PUT',
                    body: model,
                    url: '/test/' + id,
                    query: {
                        id: id
                    },
                    params: {
                        id: id
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.be.an( 'object' );
                    expect( code ).to.equal( 200 );
                    expect( ctrl.action ).to.equal( 'putAction' );

                    expect( result ).to.have.property( 'id' );
                    expect( result.id ).to.equal( id );
                    model.id = id;

                    expect( result ).to.have.property( 'name' );
                    expect( result.name ).to.equal( 'putAction updated with querystring id' );
                    models[ 0 ].name = result.name;

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

            it( 'Update a model when the id is in URL like /test/1', function( done ) {
                var ctrl = null;
                
                models[ 0 ].name = 'putAction updated with id in url';

                var model = underscore.extend( {}, models[ 0 ] );

                var req = fakeRequest({
                    method: 'PUT',
                    body: model,
                    url: '/test/' + model.id,
                    params: {
                        id: model.id
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.be.an( 'object' );
                    expect( code ).to.equal( 200 );
                    expect( ctrl.action ).to.equal( 'putAction' );

                    expect( result ).to.have.property( 'id' );
                    expect( result.id ).to.equal( model.id );

                    expect( result ).to.have.property( 'name' );
                    expect( result.name ).to.equal( 'putAction updated with id in url' );
                    models[ 0 ].name = result.name;

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

            it( 'Should not update non existant models (or crash) for either QueryString or URI', function( done ) {
                var ctrl = null;
                
                var req = fakeRequest({
                    method: 'PUT',
                    body: { id: 9999999 },
                    url: '/test/9999999',
                    params: {
                        id: 9999999
                    },
                    query: {
                        id: 9999999
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.eql( { statusCode: 404, message: 'Test doesn\'t exist.' } );
                    expect( code ).to.equal( 404 );
                    expect( ctrl.action ).to.equal( 'putAction' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

        });

        describe( '.deleteAction():  Using route "DELETE /test/:id" or "DELETE /tests?id=1"', function() {

            it( 'Delete a model instances with id in the QueryString or URL like /test/1', function( done ) {
                var ctrl = null;

                var req = fakeRequest({
                    method: 'DELETE',
                    url: '/test/' + models[ 0 ].id,
                    params: {
                        id: models[ 0 ].id
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.eql( {} );
                    expect( code ).to.equal( 200 );
                    expect( ctrl.action ).to.equal( 'deleteAction' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

            it( 'Should not delete non existant models (or crash) for either QueryString or URI', function( done ) {
                var ctrl = null;
                
                var req = fakeRequest({
                    method: 'DELETE',
                    body: { id: 9999999 },
                    url: '/test/9999999',
                    params: {
                        id: 9999999
                    },
                    query: {
                        id: 9999999
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.eql( { statusCode: 404, message: 'Test doesn\'t exist.' } );
                    expect( code ).to.equal( 404 );
                    expect( ctrl.action ).to.equal( 'deleteAction' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });
        });
    });

    describe( 'Action Routing', function() {

        describe( '.postAction():  Using route "POST /test/post" or "POST /tests/post"', function() {

            it( 'Should create a new model instance and save it in the database', function( done ) {
                var ctrl = null
                  , model = models[ 1 ];

                var req = fakeRequest({
                        method: 'POST',
                        body: underscore.extend( {}, model ),
                        url: '/test/post',
                        params: {
                            action: 'post'
                        }
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

                    model.deletedAt = null;

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

            it( 'Should not be able to create a new model without posting data', function( done ) {
                var ctrl = null;

                var req = fakeRequest({
                    method: 'POST',
                    url: '/test/post',
                    params: {
                        action: 'post'
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( code ).to.equal( 400 );
                    expect( result ).to.be.an( 'object' );
                    expect( spy.called ).to.eql( true );
                    expect( ctrl.action ).to.equal( 'postAction' );

                    spy.restore();

                    done();
                });

                var spy = sinon.spy( TestController.prototype, 'postAction' );

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

        });

        describe( '.listAction():  Using route "GET /test/list" or "GET /tests/list"', function() {

            it( 'Should send all existing model instances as an array', function( done ) {
                var ctrl = null;

                var req = fakeRequest({
                    method: 'GET',
                    url: '/test/list',
                    params: {
                        action: 'list'
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.eql( [ models[ 1 ] ] );
                    expect( code ).to.equal( 200 );
                    expect( ctrl.action ).to.equal( 'listAction' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

            it( 'Should send an array of matching model instances, using QueryString (/test/list?field=value&)', function( done ) {
                var ctrl = null;

                var req = fakeRequest({
                    method: 'GET',
                    url: '/test/list',
                    params: {
                        action: 'list'
                    },
                    query: {
                        name: models[ 1 ].name
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.eql( [ models[ 1 ] ] );
                    expect( code ).to.equal( 200 );
                    expect( ctrl.action ).to.equal( 'listAction' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

        });

        describe( '.getAction():  Using route "GET /test" or "GET /tests"', function() {

            it( 'Should send an existing model instance by id when its specified in the uri/url like /test/:id', function( done ) {
                var ctrl = null;

                var req = fakeRequest({
                    method: 'GET',
                    url: '/test/get/' + models[ 1 ].id,
                    params: {
                        action: 'get',
                        id: models[ 1 ].id
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.eql( models[ 1 ] );
                    expect( code ).to.equal( 200 );
                    expect( ctrl.action ).to.equal( 'getAction' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

            it( 'Should send an existing model instance by id when using the QueryString like /test?id=1', function( done ) {
                var ctrl = null;

                var req = fakeRequest({
                    method: 'GET',
                    url: '/test/get/' + models[ 1 ].id,
                    query: {
                        id: models[ 1 ].id
                    },
                    params: {
                        action: 'get',
                        id: models[ 1 ].id
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.eql( models[ 1 ] );
                    expect( code ).to.equal( 200 );
                    expect( ctrl.action ).to.equal( 'getAction' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

            it( 'Should not return non existant models (or crash) for either QueryString or URI', function( done ) {
                var ctrl = null;

                var req = fakeRequest({
                    method: 'GET',
                    url: '/test/get/99999999',
                    query: {
                        id: '99999999'
                    },
                    params: {
                        action: 'get',
                        id: '99999999'
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.eql( { statusCode: 404, message: 'Test doesn\'t exist.' } );
                    expect( code ).to.equal( 404 );
                    expect( ctrl.action ).to.equal( 'getAction' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

        });


        describe( '.putAction():  Using route "PUT /test/:id" or "PUT /tests?id=1"', function() {

            it( 'Update a model when the id is in QueryString like /test?id=1', function( done ) {
                var ctrl = null
                
                models[ 1 ].name = 'putAction updated with querystring id';

                var model = underscore.extend( {}, models[ 1 ] )
                  , id = model.id;

                delete model.id;

                var req = fakeRequest({
                    method: 'POST',
                    body: model,
                    url: '/test/put/' + id,
                    query: {
                        id: id
                    },
                    params: {
                        action: 'put',
                        id: id
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.be.an( 'object' );
                    expect( code ).to.equal( 200 );
                    expect( ctrl.action ).to.equal( 'putAction' );

                    expect( result ).to.have.property( 'id' );
                    expect( result.id ).to.equal( id );
                    model.id = id;

                    expect( result ).to.have.property( 'name' );
                    expect( result.name ).to.equal( 'putAction updated with querystring id' );
                    models[ 1 ].name = result.name;

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

            it( 'Update a model when the id is in URL like /test/1', function( done ) {
                var ctrl = null;
                
                models[ 1 ].name = 'putAction updated with id in url';

                var model = underscore.extend( {}, models[ 1 ] );

                var req = fakeRequest({
                    method: 'POST',
                    body: model,
                    url: '/test/put/' + model.id,
                    params: {
                        action: 'put',
                        id: model.id
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.be.an( 'object' );
                    expect( code ).to.equal( 200 );
                    expect( ctrl.action ).to.equal( 'putAction' );

                    expect( result ).to.have.property( 'id' );
                    expect( result.id ).to.equal( model.id );

                    expect( result ).to.have.property( 'name' );
                    expect( result.name ).to.equal( 'putAction updated with id in url' );
                    models[ 1 ].name = result.name;

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

            it( 'Should not update non existant models (or crash) for either QueryString or URI', function( done ) {
                var ctrl = null;
                
                var req = fakeRequest({
                    method: 'PUT',
                    body: { id: 9999999 },
                    url: '/test/put/9999999',
                    params: {
                        action: 'put',
                        id: 9999999
                    },
                    query: {
                        id: 9999999
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.eql( { statusCode: 404, message: 'Test doesn\'t exist.' } );
                    expect( code ).to.equal( 404 );
                    expect( ctrl.action ).to.equal( 'putAction' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

        });

        describe( '.deleteAction():  Using route "DELETE /test/:id" or "DELETE /tests?id=1"', function() {

            it( 'Delete a model instances with id in the QueryString or URL like /test/1', function( done ) {
                var ctrl = null;

                var req = fakeRequest({
                    method: 'GET',
                    url: '/test/delete/' + models[ 1 ].id,
                    params: {
                        action: 'delete',
                        id: models[ 1 ].id
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.eql( {} );
                    expect( code ).to.equal( 200 );
                    expect( ctrl.action ).to.equal( 'deleteAction' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

            it( 'Should not delete non existant models (or crash) for either QueryString or URI', function( done ) {
                var ctrl = null;
                
                var req = fakeRequest({
                    method: 'GET',
                    body: { id: 9999999 },
                    url: '/test/delete/9999999',
                    params: {
                        action: 'delete',
                        id: 9999999
                    },
                    query: {
                        id: 9999999
                    }
                });

                var res = fakeResponse( function( code, result ) {
                    expect( result ).to.eql( { statusCode: 404, message: 'Test doesn\'t exist.' } );
                    expect( code ).to.equal( 404 );
                    expect( ctrl.action ).to.equal( 'deleteAction' );

                    done();
                });

                this.timeout( 10000 );
                ctrl = TestController.callback( 'newInstance' )( req, res );
            });

        });

    });

});