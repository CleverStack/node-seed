var utils       = require('utils')
  , env         = utils.bootstrapEnv()
  , moduleLdr   = env.moduleLoader
  , injector    = require('injector')
  , ncp         = require('ncp')
  , path        = require('path')
  , async       = require('async');

describe('ModuleLoader', function() {

  before(function(done) {
    var source  = path.resolve(__dirname, '..', 'test-module')
      , dest    = path.resolve(__dirname, '..', '..', '..', 'modules', 'test-module');

    // Copy the test-module into the modules folder
    ncp(source, dest, done);
  });

  it('should load modules', function(done) {
    this.timeout(20000);
    
    moduleLdr.on('modulesLoaded', function() {
      async.parallel(
        [
          function ormDb(callback) {
            if (moduleLdr.moduleIsEnabled('clever-orm') === true) {
              injector
                .getInstance('sequelize')
                .sync({ force: true })
                .then(function() {
                  callback(null);
                })
                .catch(callback);
            } else {
              callback(null);
            }
          },

          function odmDb(callback) {
            callback(null);
          }
        ],
        function(err) {
          if (err !== undefined && err !== null) {
            console.dir(err);
            return done(err);
          }
          done();
        }
     );
    });
    moduleLdr.loadModules();
  });

  it('should initialize all module routes', function(done) {
    moduleLdr.on('routesInitialized', function() {
      done();
    });
    moduleLdr.initializeRoutes();
  });
});
