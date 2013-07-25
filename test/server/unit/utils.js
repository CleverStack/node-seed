var config = require('../../../config')
  , defineModels = require('../../../src/model')
  , loader = require('../../../src/components/Loader.js')
  , Sequelize = require('sequelize')
  , Q = require('q');

exports.testEnv = function (cb) {
  var deferred = Q.defer();
  var env = {};

  env.config = config;
  env.db = new Sequelize(
    config.testDb.database, 
    config.testDb.username, 
    config.testDb.password,
    config.testDb.options
  );

  env.models = defineModels(env.db, env.config);
  env.models.TestModel = env.db.define('Test', {
      name: Sequelize.STRING,
  }, {
      paranoid: true
  });

  env.controller = loader();
  env.service = loader();

  env.controller.storage = __dirname + '/../../../src/controllers/';
  env.service.storage = __dirname + '/../../../src/service/';

  env.db
  .sync({force:true})
  .success(deferred.resolve.bind(this, env))
  .error(deferred.reject);

  return deferred.promise;
};
