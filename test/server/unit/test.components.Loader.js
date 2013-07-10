var should = require('should'),
    Loader = require('../../../src/components/Loader');

describe('components.Loader', function () {
  describe('constructor', function () {
    it('should return function', function () {
      var loader = Loader();
      loader.should.be.a('function');
    });

    it('should set .storage to ./ by default', function () {
      var loader = Loader();
      loader.storage.should.equal('./');
    });
  });

  describe('.call(name, [args...])', function () {
    it('should load module by name from .storage', function () {
      var loader = Loader();
      loader.storage = __dirname + '/test-loader/';
      var service = loader('Service1');
      service.name.should.equal('Service1');
    });

    it('should pass arguments to module', function () {
      var loader = Loader();
      loader.storage = __dirname + '/test-loader/';
      var service = loader('Service1', 1, 2);
      service.arg1.should.equal(1);
      service.arg2.should.equal(2);
    });
  });
});
