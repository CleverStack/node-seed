var injector    = require('injector')
  , env         = null;

module.exports  = function() {
  if (env === null) {
    var path        = require('path')
      , appRoot     = path.resolve(__dirname + '/../..')
      , config      = require(appRoot + '/config')
      , packageJson = require(appRoot + '/package.json')
      , express     = require('express')
      , app         = express()
      , Promise     = require('bluebird')
      , moduleLdr;

    if (process.env.NODE_ENV !== 'PROD') {
      Promise.longStackTraces();
    }

    injector.instance('injector',      injector);
    injector.instance('appRoot',       appRoot);
    injector.instance('express',       express);
    injector.instance('app',           app);
    injector.instance('config',        config);
    injector.instance('packageJson',   packageJson);
    injector.instance('Promise',       Promise);
    injector.instance('Exceptions',    require('exceptions'));
    injector.instance('async',         require('async'));
    injector.instance('_',             require('underscore'));
    injector.instance('underscore',    require('underscore'));
    injector.instance('inflect',       require('i')());

    moduleLdr       = require('./moduleLoader').getInstance(env);

    // Add our moduleLoader to the injector
    injector.instance('moduleLoader', moduleLdr);

    env = {
      app         : app,
      config      : config,
      express     : express,
      webPort     : process.env.NODE_WWW_PORT || config.webPort || 8080,
      packageJson : packageJson,
      moduleLoader: moduleLdr
    };

    injector.instance('env', env);
    
    // Define all core classes on the injector
    var classes     = require('classes');

    injector.instance('Class',         classes.Class);
    injector.instance('Model',         classes.Model);
    injector.instance('Service',       classes.Service);
    injector.instance('Controller',    classes.Controller);
    injector.instance('Module',        classes.Module);
  }

  return env;
}