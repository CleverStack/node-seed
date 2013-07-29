var should = require('should'),
    testEnv = require('./utils').testEnv;

describe('controllers.ExampleController', function () {
    var env, ctrl;

    beforeEach(function (done) {
        testEnv()
        .then(function (_env_) {
            env = _env_;

            var ExampleController = env.controller('ExampleController');
            ExampleController.prototype.fakeAction = function () {};

            var req = {
                params: {},
                method: 'GET',
                query: {}
            };
            var res = {
                json: function () {}
            };
            var next = function () {};
            ctrl = new ExampleController('fakeAction', req, res, next);

            done();
        })
        .fail(done);
    });


    describe('.postAction()', function () {
        it('should call .send() with valid status', function (done) {
            ctrl.send = function (data) {
                data.should.eql({
                    status: 'Created record!' 
                });
                done();
            };
            ctrl.postAction();
        });
    });

    describe('.listAction()', function () {
        it('should call .send() with valid status', function (done) {
            ctrl.send = function (data) {
                data.should.eql({
                    status: 'Sending you the list of examples.'
                });
                done();
            };
            ctrl.listAction();
        });
    });

    describe('.getAction()', function () {
        it('should call .send() with valid status', function (done) {
            ctrl.req.params.id = 123;
            ctrl.send = function (data) {
                data.should.eql({
                    status: 'sending you record with id of 123'
                });
                done();
            };
            ctrl.getAction();
        });
    });

    describe('.putAction()', function () {
        it('should call .send() with valid status', function (done) {
            ctrl.req.params.id = 123;
            ctrl.send = function (data) {
                data.should.eql({
                    status: 'updated record with id 123'
                });
                done();
            };
            ctrl.putAction();
        });
    });

    describe('.deleteAction()', function () {
        it('should call .send() with valid status', function (done) {
            ctrl.req.params.id = 123;
            ctrl.send = function (data) {
                data.should.eql({
                    status: 'deleted record with id 123'
                });
                done();
            };
            ctrl.deleteAction();
        });
    });

    describe('.customAction()', function () {
        it('should call .render() with valid arguments', function (done) {
            ctrl.render = function (view, context) {
                view.should.equal('example/custom.ejs');
                context.should.eql({
                    message: 'Hello from custom action controller'
                });

                done();
            };
            ctrl.customAction();
        });
    });
});
