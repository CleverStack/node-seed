var should = require('should')
  , testEnv = require('./utils').testEnv;

describe('service.UserService', function () {
    var env, service;

    beforeEach(function (done) {
        testEnv().then(function (_env_) {
            env = _env_;
            service = env.service('UserService', env.db, env.models.User);
            done();
        }, done);
    });

    afterEach(function () {
        service.constructor.instance = null;
    });

    describe('.authenticate(credentials)', function () {
        it('should return User with specified credentials', function (done) {
            var data1 = {
                username: 'Joe',
                email: 'joe@example.com',
                password: '1234'
            };
            var data2 = {
                username: 'Rachel',
                email: 'rachel@example.com',
                password: '1234'
            };

            service.create(data1)
            .then(function () {
                return service.create(data2);
            })
            .then(function () {
                return service.authenticate({
                    email: 'rachel@example.com',
                    password: '1234'
                })
                .then(function (user) {
                    user.username.should.equal(data2.username);
                    done();
                });
            })
            .fail(done);
        });
    });
});
