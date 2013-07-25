var should = require('should'),
    sinon = require('sinon'),
    Q = require('q'),
    testEnv = require('./utils').testEnv;

describe('controllers.UserController', function () {
    var userService, UserController, ctrl, env, users = [];

    beforeEach(function (done) {
        testEnv().then(function (_env_) {
            env = _env_;
            userService = env.service('User', env.db, env.models.User);
            UserController = env.controller('UserController', userService);

            var req = {
                params: {},
                method: 'GET'
                },
                res = {
                    json: function () {}
                },
                next = function () {};
            ctrl = new UserController(req, res, next);

            userService.create({
                firstName: 'Joe',
                username: 'joe@example.com',
                email: 'joe@example.com',
                password: '7110eda4d09e062aa5e4a390b0a572ac0d2c0220'
            }).then(function (user) {
                users.push(user); 
                return userService.create({
                    firstName: 'Rachel',
                    username: 'rachel@example.com',
                    email: 'rachel@example.com',
                    password: '1234'
                });
            }).then(function (user) {
                users.push(user); 
                done();
            })
            .fail(done);
        }, done);
    });

    afterEach(function () {
        userService.constructor.instance = null;
    });

    describe('.postAction()', function () {
        it('should hash password and save user', function (done) {
            ctrl.send = function (result) {
                userService.findAll().then(function (users) {
                    users.should.have.length(3);
                    done();
                }, done);
            };

            ctrl.req.body = {
                username: 'admin',
                email: 'admin@example.com',
                password: '1234'
            };
            ctrl.postAction();
        });
    });
});
