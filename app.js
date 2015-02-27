var utils     = require('utils')
  , parser    = require('body-parser')
  , compress  = require('compression')
  , override  = require('method-override')
  , resTime   = require('response-time')
  , logger    = require('morgan')
  , env       = utils.bootstrapEnv()
  , moduleLdr = env.moduleLoader
  , cors      = require('cors')
  , chalk     = require('chalk')
  , debug     = require('debug')('cleverstack:server')
  , helpers   = require('utils').helpers
  , app       = module.exports = env.app;

debug('started with pid %s', chalk.yellow(process.pid));

// Allow modules to hook into this file by putting an app.js file in any modules /bin folder
helpers.loadModulesFileByName('app.js', env.config, require('cluster'), debug);

moduleLdr.on('preLoadModules', function() {
  debug('Configuring express application...');

  app.use(resTime());
  app.use(parser.urlencoded({ extended: true }));
  app.use(parser.json());
  app.use(logger('dev'));
  app.use(compress());
  app.use(override());
  app.use(cors(env.config.cors));
});

moduleLdr.on('modulesLoaded', function() {
  debug('Initializing routes...');

  moduleLdr.initializeRoutes();
});

moduleLdr.on('routesInitialized', function() {
  debug('Setting up router and starting http server...');

  app.listen(env.webPort, function() {
    debug('Started web server on port %s in enviromment %s', chalk.yellow(env.webPort), chalk.yellow(process.env.NODE_ENV ? process.env.NODE_ENV : "LOCAL"));
  });
});

debug('Loading modules...');
moduleLdr.loadModules();