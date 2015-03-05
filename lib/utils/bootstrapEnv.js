'use strict';

var injector = require('injector')
  , env      = null
  , path     = require('path')
  , chalk    = require('chalk')
  , debug    = require('debug')('cleverstack:app')
  , config   = require('config')
  , moment   = require('moment')
  , Promise  = require('bluebird')
  , appRoot  = path.resolve(path.join(__dirname, '..', '..'));

function logger(msg) {
  if (debug.enabled) {
    debug.apply(debug, ['(pid ' + chalk.yellow(process.pid) + ' at ' + chalk.cyan(moment().format('HH:mm:ss [on] Do MMMM')) + ') - ' + msg].concat([].slice.call(arguments, 1)));
  }
}

function injectCommonResources() {
  injector.instance('appRoot',    appRoot);
  injector.instance('config',     config);
  injector.instance('injector',   injector);
  injector.instance('logger',     logger);
  injector.instance('Exceptions', require('exceptions'));
  injector.instance('Promise',    Promise);
  injector.instance('async',      require('async'));
  injector.instance('_',          require('underscore'));
  injector.instance('underscore', require('underscore'));
  injector.instance('inflect',    require('i')());
  injector.instance('moment',     moment);
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
  var packageJson = require(appRoot + '/package.json')
    , express     = require('express')
    , app         = express()
    , moduleLdr;

  logger('Booting in %s mode...', chalk.yellow(process.env.NODE_ENV ? process.env.NODE_ENV : "LOCAL"));

  if (process.env.NODE_ENV !== 'PROD') {
    logger('Turning longStackTraces on');
    Promise.longStackTraces();
  }

  logger('Setting up injector...')
  injectCommonResources();
  injector.instance('express',     express);
  injector.instance('app',         app);
  injector.instance('packageJson', packageJson);

  env = {
    app         : app,
    debug       : logger,
    config      : config,
    express     : express,
    webPort     : process.env.NODE_WWW_PORT || config.webPort || 8080,
    packageJson : packageJson
  };

  logger('Setting up module loader....')
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
}
