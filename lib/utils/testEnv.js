var env       = require('./bootstrapEnv')()
  , moduleLdr = env.moduleLoader
  , injector  = require('injector')
  , debug     = require('debug')('cleverstack:utils:testEnv');

function testEnv(cb) {
  if (moduleLdr.modulesLoaded) {
    if (moduleLdr.moduleIsEnabled('clever-orm')) {
      debug('Rebasing ORM DB');

      injector.getInstance('sequelize')
        .sync({ force: true })
        .then(function() {
          debug('Database is rebased');
          injector.inject(cb);
        })
        .catch(function(err) {
          debug('Error trying to connect to ' + env.config['clever-orm'].db.options.dialect, err);
        });
    }
  } else {
    moduleLdr.on('modulesLoaded', function() {
      testEnv(cb);
    });
  }
}

module.exports = function() {
  if (!env.moduleLoader.modulesLoaded) {
    debug('Calling loadModules() on the moduleLoader');

    // Load all the modules
    env.moduleLoader.loadModules();
  }

  return testEnv;
};
