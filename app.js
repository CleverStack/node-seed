var utils        = require('utils')
  , chalk        = require('chalk')
  , env          = utils.bootstrapEnv()
  , app          = env.app
  , debug        = env.debug
  , helpers      = utils.helpers
  , bodyParser   = require('body-parser')
  , moduleLoader = env.moduleLoader;

moduleLoader.on('beforeLoad', function setupExpress() {
  debug('Configuring express application...');

  app.use(require('morgan')('dev'));
  app.use(require('response-time')());
  app.use(require('method-override')());
  app.use(require('cors')(env.config.cors));
  app.use(require('compression')());

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
});

moduleLoader.on('modulesLoaded', function initializeRoutes() {
  debug('Initializing routes...');
  moduleLoader.initializeRoutes();
});

moduleLoader.on('routesInitialized', function startApp() {
  debug('Starting http server...');

  app.listen(env.webPort, function appReady() {
    debug('Listening on port %s', chalk.yellow(env.webPort));
  });
});

debug('Loading %s hook files...', chalk.yellow('app.js'));
helpers.loadModulesFileByName(__filename, env.config, require('cluster'), debug);

debug('Loading modules...');
moduleLoader.loadModules();

module.exports = app;
