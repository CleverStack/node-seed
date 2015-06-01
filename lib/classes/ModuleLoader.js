var injector     = require('injector')
  , async        = require('async')
  , async        = require('async')
  , path         = require('path')
  , fs           = require('fs')
  , Class        = require(path.resolve(path.join(__dirname, 'Class')))
  , debug        = require('debug')('cleverstack:modules')
  , i            = require('i')()
  , packageJson  = null
  , Module;

/**
 * @classdesc CleverStack Module Class
 * @class     ModuleLoader
 * @extends   Class
 */
var ModuleLoader = Class.extend(
/**
 * @lends ModuleLoader
 */
{
  /**
   * A reference to the singleton instance of the moduleLoader
   * @type {ModuleLoader.prototype}
   */
  instance: null,

  /**
   * Singleton instance getter, this will create a new instance if one doesn't already exist
   * @param  {Object} env The environment object as defined in the bootstrapEnv util (utils.bootstrapEnv)
   * @return {ModuleLoader.prototype}
   */
  getInstance: function(env) {
    if (this.instance === null) {
      packageJson = env.packageJson;
      this.instance = new ModuleLoader();
    }
    return this.instance;
  }
},
/**
 * @lends ModuleLoader#
 */
{
  /**
   * All the modules that have been loaded/referenced
   * 
   * @type {Array}
   * @default []
   */
  modules: [],

  /**
   * Have modules been loaded?
   * 
   * @type {Boolean}
   * @default false
   */
  modulesLoaded: false,

  /**
   * Are modules currently loading?
   * 
   * @type {Boolean}
   * @default false
   */
  modulesLoading: false,

  /**
   * Have routes already been initialized
   * 
   * @type {Boolean}
   * @default false
   */
  routesInitialized: false,

  /**
   * An array containing hooks in the order they need to be fired in
   * @type {Array}
   */
  hookOrder: [
    'configureAppHook',
    'preResourcesHook',
    'loadModuleResources',
    'modulesLoadedHook'
  ],

  /**
   * @constructor
   * @ignore
   */
  init: function() {
    this.modules        = [];
    this.moduleFolder   = path.resolve(path.join(injector.getInstance('appRoot'), 'modules'));
    this.enabledModules = [];
  },

  /**
   * Tell all the modules (and their dependencies) that we want to shutdown.
   * @return {undefined}
   */
  shutdown: function() {
    this.modules.forEach(this.proxy('preShutdownHook'));
    debug('Shutdown complete, if your app hangs one of your modules has not closed all its connections/resources.');
  },

  /**
   * Helper function to call the preShutdown Event Hook for a module
   * 
   * @param {Module}  module  the module to run the hook on
   * @return {undefined}
   */
  preShutdownHook: function(module) {
    if (module instanceof Module && typeof module.preShutdown === 'function') {
      module.debug('Module.preShutdown() hook...');
      module.preShutdown();
    }
  },

  getEnabledModuleNames: function() {
    if (!this.enabledModules.length) {
      fs.readdirSync(this.moduleFolder).forEach(this.proxy(function(folderName) {
        var folder = fs.statSync(path.join(this.moduleFolder, folderName));
        if (folder.isDirectory()) {
          this.enabledModules.push(folderName);
        }
      }));
    }

    return this.enabledModules;
  },

  /**
   * Simple helper to tell you if a module is enabled, using its name as a reference.
   * 
   * @param  {String} moduleName the name of the module
   * @return {Boolean}
   */
  moduleIsEnabled: function(moduleName) {
    return this.getEnabledModuleNames().indexOf(moduleName) !== -1;
  },

  /**
   * Load all the modules as provided with the modules argument, or use this.modules
   * 
   * @param  {Object} env     the env object as defined by utils.bootstrapEnv
   * @param  {Array} modules  the modules you want to load, if not specified load what's available at this.modules
   * @return {undefined}
   */
  loadModules: function(env, modules) {
    var deps   = this.getEnabledModuleNames()
      , loader = this;

    modules    = modules || this.modules;
    Module     = injector.getInstance('Module');

    this.emit('beforeLoad');

    if (!this.modulesLoading && !this.modulesLoaded) {
      debug('Loading modules...');
      this.modulesLoading = true;

      async.waterfall(
        [
          function load(callback) {
            async.each(deps, loader.proxy('loadModule', env), callback);
          },

          function runHooks(hooksCallback) {
            async.eachSeries(
              loader.hookOrder,
              function runHook(hookName, hookCallback) {
                async.each(
                  modules,
                  loader.proxy(hookName),
                  hookCallback
               );
              },
              hooksCallback
           );
          }
        ],
        function loadComplete(err) {
          if (!!err) {
            throw new Error('Error loading modules: ' + err);
          } else {
            loader.modulesLoaded = true;
            loader.modulesLoading = false;

            loader.emit('modulesLoaded');
          }
        }
     );
    } else if (!!this.modulesLoading) {
      debug('Modules are already loading...');
    } else {
      debug('Warning: All modules have already been loaded.');
    }
  },

  loadModule: function(env, moduleName, callback) {
    if (typeof env !== 'undefined' && env !== null) {
      process.env = env;
    }

    debug([ 'Loading the', moduleName, 'module' ].join(' ') + '...');
    var module = require(moduleName);
    var moduleLowerCamelCase = i.camelize(moduleName.replace(/\-/ig, '_'), false);

    debug([ 'Adding the', moduleLowerCamelCase, 'module to the injector' ].join(' ') + '...');
    injector.instance(moduleLowerCamelCase, module);

    this.modules.push(module);

    callback(null);
  },

  configureAppHook: function(module, callback) {
    if (module instanceof Module && typeof module.configureApp === 'function') {
      module.debug('Module.configureApp() hook...');

      module.on('appReady', callback);
      module.proxy('configureApp', injector.getInstance('app'), injector.getInstance('express'))();
    } else {
      callback(null);
    }
  },

  preResourcesHook: function(module, callback) {
    if (module instanceof Module && typeof module.preResources === 'function') {
      module.debug('Module.preResources() hook...');

      module.on('resourcesReady', callback);
      module.hook('preResources');
    } else {
      callback(null);
    }
  },

  loadModuleResources: function(module, callback) {
    if (module instanceof Module && typeof module.loadResources === 'function') {
      module.debug('Module.loadResources() hook...');
      debug([ 'loadResources for module', module.name ].join(' '));

      module.on('resourcesLoaded', callback);
      module.loadResources();
    } else {
      callback(null);
    }
  },

  modulesLoadedHook: function(module, callback) {
    if (module instanceof Module && typeof module.modulesLoaded === 'function') {
      module.debug('Module.modulesLoaded() hook...');

      module.on('ready', callback);
      module.hook('modulesLoaded');
    } else {
      callback(null);
    }
  },

  // @TODO make this support async
  initializeRoutes: function() {
    if (this.routesInitialized === false) {
      // Give the modules notice that we are about to add our routes to the app
      this.modules.forEach(this.proxy('preRouteHook'));

      debug('Initializing routes...');
      this.modules.forEach(this.proxy('initializeModuleRoutes'));

      // We only want to do this once
      this.routesInitialized = true;

      /**
       * routesInitialized event.
       * @event ModuleLoader.routesInitialized
       */
      this.emit('routesInitialized');
    } else {
      debug('Warning: All modules routes have been initialized already.');
    }
  },

  preRouteHook: function(module) {
    if (module instanceof Module && typeof module.preRoute === 'function') {
      module.debug('Module.configureApp() hook...');
      injector.inject(module.preRoute);
    }
  },

  initializeModuleRoutes: function(module) {
    if (module instanceof Module) {
      module.debug([ 'Initializing routes...' ].join(' '));
      module.initRoutes();
    }
  }
});

module.exports = ModuleLoader;
