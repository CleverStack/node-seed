var injector    = require('injector')
  , env         = null
  , path        = require('path')
  , chalk       = require('chalk')
  , debug       = require('debug')('cleverstack:app')
  , config      = require('config')
  , express     = require('express')
  , Promise     = require('bluebird')
  , appRoot     = path.resolve(path.join(__dirname, '..', '..'))
  , packageJson = require(appRoot + '/package.json');

function logger(msg) {
  if (debug.enabled) {
    debug.apply(debug, ['(pid ' + chalk.yellow(process.pid) + ') - ' + msg].concat([].slice.call(arguments, 1)));
  }
}

if (process.env.NODE_ENV !== 'PROD') {
  logger('Turning longStackTraces on');
  Promise.longStackTraces();
}

function injectBaseCoreResources() {
  injector.instance('injector',   injector);
  injector.instance('packageJson',packageJson);
  injector.instance('express',    express);
  injector.instance('appRoot',    appRoot);
  injector.instance('config',     config);
}

function injectCommonResources() {
  logger('Setting up injector...');

  injector.instance('logger',     logger);
  injector.instance('Exceptions', require('exceptions'));
  injector.instance('Promise',    Promise);
  injector.instance('async',      require('async'));
  injector.instance('_',          require('underscore'));
  injector.instance('underscore', require('underscore'));
  injector.instance('inflect',    require('i')());
}

function injectClasses() {
  var classes = require('classes');

  injector.instance('Class',         classes.Class);
  injector.instance('Model',         classes.Model);
  injector.instance('Service',       classes.Service);
  injector.instance('Controller',    classes.Controller);
  injector.instance('Module',        classes.Module);
  injector.instance('Validator',     classes.Validator);
}

function bootApplication() {
  var app         = express()
    , moduleLdr;

  logger('Booting in %s mode...', chalk.yellow(process.env.NODE_ENV ? process.env.NODE_ENV : 'LOCAL'));
  
  injectBaseCoreResources();
  injectCommonResources();
  injector.instance('app', app);

  env = {
    app         : app,
    debug       : logger,
    config      : config,
    express     : express,
    webPort     : process.env.NODE_WWW_PORT || config.webPort || 8080,
    packageJson : packageJson
  };

  logger('Setting up module loader....');
  env.moduleLoader = moduleLdr = require(path.resolve(path.join(__dirname, '..', 'classes', 'ModuleLoader.js'))).getInstance(env);
  injector.instance('moduleLoader', moduleLdr);

  injector.instance('env', env);
  injectClasses();
}

module.exports = function bootstrapEnv() {
  if (env === null) {
    bootApplication();
  }
  return env;
};
