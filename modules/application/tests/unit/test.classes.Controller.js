// Bootstrap the testing environmen
var testEnv = require ( 'utils' ).testEnv();

var expect = require ( 'chai' ).expect
  , sinon = require ( 'sinon' )
  , BaseController = require ( 'classes' ).Controller
  , BaseService = require ( 'services' ).BaseService
  , models = require( 'models' )
  , sequelize = injector.getInstance( 'sequelize' )
  , Sequelize =  injector.getInstance( 'Sequelize' );

describe ( 'classes.Controller', function () {
    var Service,
        service,
        Controller,
        ctrl,
        objs = [];

    beforeEach ( function ( done ) {
        testEnv( function(  ) {
            Service = BaseService.extend ();
            Service.Model = models.orm.TestModel;
            service = new Service ();

            Controller = BaseController.extend ();
            Controller.service = service;
            Controller.prototype.fakeAction = function () {
            };

            var req = {
                params: { action: 'fakeAction' },
                method: 'GET',
                query: {}
            };
            var res = { send: function () { } };
            var next = function () {
            };
            ctrl = new Controller ( req, res, next );

            service
                .create ( {
                    name: 'Joe'
                } )
                .then ( function ( obj ) {
                    objs.push ( obj );
                    return service.create ( {
                        name: 'Rachel'
                    } );
                } )
                .then ( function ( obj ) {
                    objs.push ( obj );
                    done ();
                } )
                .fail ( done );
        })
    } );

    describe ( '.listAction()', function () {
        it ( 'should call .send() with all Model instances', function ( done ) {
            ctrl.send = function ( result ) {
                expect ( result ).to.have.length ( 2 );
                done ();
            };
            ctrl.listAction ();
        } );
    } );

    describe ( '.getAction()', function () {
        it ( 'should call .send() with Model instance by id', function ( done ) {
            ctrl.send = function ( result ) {
                expect ( result ).to.have.property ( 'name' ).and.equal ( objs[0].name );
                done ();
            };
            ctrl.req.params = {
                id: objs[0].id
            };
            ctrl.getAction ();
        } );
    } );

    describe ( '.postAction()', function () {
        it ( 'should create new Model instance', function ( done ) {
            ctrl.send = function ( result ) {
                service.findAll ().then ( function ( objs ) {
                    expect ( objs ).to.have.length ( 3 );
                    done ();
                }, done );
            };

            ctrl.req.body = {
                name: 'Ross'
            };
            ctrl.postAction ();
        } );

        it ( 'should call .send() with new Model instance', function ( done ) {
            ctrl.send = function ( result ) {
                expect ( result ).to.have.property ( 'name' ).and.equal ( 'Ross' );
                expect ( result ).to.have.property ( 'id' ).and.be.ok;
                done ();
            };
            ctrl.req.body = {
                name: 'Ross'
            };
            ctrl.postAction ();
        } );
    } );

    describe ( '.putAction()', function () {
        it ( 'should update Model instance by id', function ( done ) {
            ctrl.send = function ( result ) {
                service.findById ( objs[0].id )
                    .then ( function ( obj ) {
                        expect ( obj ).to.have.property ( 'name' ).and.equal ( 'Ross' );
                        done ();
                    }, done );
            };

            ctrl.req.params = {
                id: objs[0].id
            };
            ctrl.req.body = {
                name: 'Ross'
            };
            ctrl.putAction ();
        } );

        it ( 'should call .send() with updated Model instance', function ( done ) {
            ctrl.send = function ( result ) {
                expect ( result ).to.have.property ( 'name' ).and.equal ( 'Ross' );
                expect ( result ).to.have.property ( 'id' ).and.equal ( objs[0].id );
                done ();
            };
            ctrl.req.params = {
                id: objs[0].id
            };
            ctrl.req.body = {
                name: 'Ross'
            };
            ctrl.putAction ();
        } );
    } );

    describe ( '.deleteAction()', function () {
        it ( 'should delete Model instance by id', function ( done ) {
            ctrl.send = function ( result ) {
                service.findById ( objs[0].id )
                    .then ( function ( obj ) {
                    console.log(obj)
                        //should.exist ( obj.deletedAt );
                        done ();
                    }, done );
            };

            ctrl.req.params = {
                id: objs[0].id
            };
            ctrl.deleteAction ();
        } );
    } );
} );