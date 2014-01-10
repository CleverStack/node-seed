var expect = require ( 'chai' ).expect
  , testEnv = require ( 'utils' ).testEnv;

describe ( 'controllers.ExampleController', function () {
    var ctrl;

    beforeEach ( function ( done ) {
        testEnv ( function ( ExampleController ) {
            var req = {
                params: { action: 'fakeAction'},
                method: 'GET',
                query: {}
            };
            var res = {
                json: function () {
                }
            };
            var next = function () {
            };
            ctrl = new ExampleController ( req, res, next );

            done ();
        } );
    } );


    describe ( '.postAction()', function () {
        it ( 'should call .send() with valid status', function ( done ) {
            ctrl.send = function ( data ) {
                expect ( data ).to.eql ( {
                    status: 'Created record!'
                } );
                done ();
            };
            ctrl.postAction ();
        } );
    } );

    describe ( '.listAction()', function () {
        it ( 'should call .send() with valid status', function ( done ) {
            ctrl.send = function ( data ) {
                expect ( data ).to.eql ( {
                    status: 'Sending you the list of examples.'
                } );
                done ();
            };
            ctrl.listAction ();
        } );
    } );

    describe ( '.getAction()', function () {
        it ( 'should call .send() with valid status', function ( done ) {
            ctrl.req.params.id = 123;
            ctrl.send = function ( data ) {
                expect ( data ).to.eql ( {
                    status: 'sending you record with id of 123'
                } );
                done ();
            };
            ctrl.getAction ();
        } );
    } );

    describe ( '.putAction()', function () {
        it ( 'should call .send() with valid status', function ( done ) {
            ctrl.req.params.id = 123;
            ctrl.send = function ( data ) {
                expect ( data ).to.eql ( {
                    status: 'updated record with id 123'
                } );
                done ();
            };
            ctrl.putAction ();
        } );
    } );

    describe ( '.deleteAction()', function () {
        it ( 'should call .send() with valid status', function ( done ) {
            ctrl.req.params.id = 123;
            ctrl.send = function ( data ) {
                expect ( data ).to.eql ( {
                    status: 'deleted record with id 123'
                } );
                done ();
            };
            ctrl.deleteAction ();
        } );
    } );

    describe ( '.customAction()', function () {
        it ( 'should call .render() with valid arguments', function ( done ) {
            ctrl.render = function ( view, context ) {
                expect ( view ).to.equal ( 'example/custom.ejs' );
                expect ( context ).to.eql ( {
                    message: 'Hello from custom action controller'
                } );

                done ();
            };
            ctrl.customAction ();
        } );
    } );
});
