var should = require('should'),
    testEnv = require('./utils').testEnv;

describe('service.User', function () {
  var env,
      profileService,
      trainerService,
      service;

  beforeEach(function (done) {
      testEnv().then(function (_env_) {
          env = _env_;
          profileService = env.service('Profile', env.db, env.models.Profile);
          trainerService = env.service('Trainer', env.db, env.models.Trainer, profileService);
          service = env.service('User', env.db, env.models.User, trainerService);
          done();
      }, done);
  });

  afterEach(function () {
      profileService.constructor.instance = null;
      trainerService.constructor.instance = null;
      service.constructor.instance = null;
  });

  describe('.create(data)', function () {
    it('should create new User with data', function (done) {
      var data = {
        firstName: 'Joe',
        email: 'joe@example.com',
        password: '1234'
      };
      service.create(data).then(function (joe) {
        env.models.User.find(joe.id).success(function (joe) {
          joe.firstName.should.equal(data.firstName);
          joe.email.should.equal(data.email);
          joe.password.should.equal(data.password);
          done();
        }).error(done);
      }, done);
    });

    it('should create linked Trainer and Profile if data.type == "trainer"', function (done) {
        var data = {
            firstName: 'Joe',
            email: 'joe@example.com',
            password: '1234',
            type: 'trainer'
        };
        service.create(data).then(function (joe) {
            joe.getTrainer()
            .success(function (trainer) {
                should.exist(trainer);
                trainer.getProfile()
                .success(function (profile) {
                    should.exist(profile);
                    done();
                })
                .error(done);
            })
            .error(done);
        }, done);
    });
  });

  describe('.authenticate(credentials)', function () {
    it('should return User with specified credentials', function (done) {
      var data1 = {
        firstName: 'Joe',
        email: 'joe@example.com',
        password: '1234'
      };
      var data2 = {
        firstName: 'Rachel',
        email: 'rachel@example.com',
        password: '1234'
      };

      service.create(data1)
      .then(function () {
        return service.create(data2);
      }).then(function () {
        return service.authenticate({
          email: 'rachel@example.com',
          password: '1234'
        }).then(function (user) {
          user.firstName.should.equal(data2.firstName);
          done();
        });
      })
      .fail(done);
    });
  });
});
