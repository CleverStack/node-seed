import fs       from 'fs';
import path     from 'path';
import async    from 'async';
import {Class}  from 'classes';
import inflect  from 'i';
import injector from 'injector';
import debugLog from 'debug';

var debug = debugLog('cleverstack:modules');
let packageJson = null;
let Module;
let i = inflect();

export default class ModuleLoader extends Class {
  static instance = null;

  static getInstance(env) {
    if (this.instance === null) {
      packageJson = env.packageJson;
      this.instance = new ModuleLoader();
    }

    return this.instance;
  }

  /**
   * All the modules that have been loaded/referenced
   * 
   * @type {Array}
   * @default []
   */
  modules = [];

  enabledModules = [];

  /**
   * Have modules been loaded?
   * 
   * @type {Boolean}
   * @default false
   */
  modulesLoaded = false;

  /**
   * Are modules currently loading?
   * 
   * @type {Boolean}
   * @default false
   */
  modulesLoading = false;

  /**
   * Have routes already been initialized
   * 
   * @type {Boolean}
   * @default false
   */
  routesInitialized = false;

  /**
   * An array containing hooks in the order they need to be fired in
   * @type {Array}
   */
  hookOrder = [
    'configureAppHook',
    'preResourcesHook',
    'loadModuleResources',
    'modulesLoadedHook'
  ];

  constructor() {
    super();

    this.modules        = [];
    this.enabledModules = [];
    this.moduleFolder   = path.resolve(path.join(injector.getInstance('appRoot'), 'modules'));
  }

  /**
   * Tell all the modules (and their dependencies) that we want to shutdown.
   * @return {undefined}
   */
  shutdown() {
    this.modules.forEach(this.proxy('preShutdownHook'));
    debug('Shutdown complete, if your app hangs one of your modules has not closed all its connections/resources.');
  }

  /**
   * Helper function to call the preShutdown Event Hook for a module
   * 
   * @param {Module}  module  the module to run the hook on
   * @return {undefined}
   */
  preShutdownHook(module) {
    if (module instanceof Module && typeof module.preShutdown === 'function') {
      module.debug('Module.preShutdown() hook...');
      module.preShutdown();
    }
  }

  getEnabledModuleNames() {
    if (!this.enabledModules.length) {
      fs.readdirSync(this.moduleFolder).forEach((folderName) => {
        var folder = fs.statSync(path.join(this.moduleFolder, folderName));
        if (folder.isDirectory()) {
          this.enabledModules.push(folderName);
        }
      });
    }

    return this.enabledModules;
  }

  /**
   * Simple helper to tell you if a module is enabled, using its name as a reference.
   * 
   * @param  {String} moduleName the name of the module
   * @return {Boolean}
   */
  moduleIsEnabled(moduleName) {
    return this.getEnabledModuleNames().indexOf(moduleName) !== -1;
  }

  /**
   * Load all the modules as provided with the modules argument, or use this.modules
   * 
   * @param  {Object} env     the env object as defined by utils.bootstrapEnv
   * @param  {Array} modules  the modules you want to load, if not specified load what's available at this.modules
   * @return {undefined}
   */
  loadModules(env, modules) {
    var deps   = this.getEnabledModuleNames();

    modules    = modules || this.modules;
    Module     = injector.getInstance('Module');

    this.emit('beforeLoad');

    if (!this.modulesLoading && !this.modulesLoaded) {
      debug('Loading modules...');
      this.modulesLoading = true;

      async.waterfall([
        (callback) => {
          async.each(deps, this.proxy('loadModule', env), callback);
        },

        (hooksCallback) => {
          async.eachSeries(
            this.hookOrder,
            (hookName, hookCallback) => {
              async.each(
                modules,
                this.proxy(hookName),
                hookCallback
             );
            },
            hooksCallback
         );
        }
      ],
      (err) => {
        if (!!err) {
          throw new Error('Error loading modules: ' + err);
        } else {
          this.modulesLoaded = true;
          this.modulesLoading = false;

          this.emit('modulesLoaded');
        }
      }
     );
    } else if (!!this.modulesLoading) {
      debug('Modules are already loading...');
    } else {
      debug('Warning: All modules have already been loaded.');
    }
  }

  loadModule(env, moduleName, callback) {
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
  }

  configureAppHook(module, callback) {
    if (module instanceof Module && typeof module.configureApp === 'function') {
      module.debug('Module.configureApp() hook...');

      module.on('appReady', callback);
      module.proxy('configureApp', injector.getInstance('app'), injector.getInstance('express'))();
    } else {
      callback(null);
    }
  }

  preResourcesHook(module, callback) {
    if (module instanceof Module && typeof module.preResources === 'function') {
      module.debug('Module.preResources() hook...');

      module.on('resourcesReady', callback);
      module.hook('preResources');
    } else {
      callback(null);
    }
  }

  loadModuleResources(module, callback) {
    if (module instanceof Module && typeof module.loadResources === 'function') {
      module.debug('Module.loadResources() hook...');
      debug([ 'loadResources for module', module.name ].join(' '));

      module.on('resourcesLoaded', callback);
      module.loadResources();
    } else {
      callback(null);
    }
  }

  modulesLoadedHook(module, callback) {
    if (module instanceof Module && typeof module.modulesLoaded === 'function') {
      module.debug('Module.modulesLoaded() hook...');

      module.on('ready', callback);
      module.hook('modulesLoaded');
    } else {
      callback(null);
    }
  }

  // @TODO make this support async
  initializeRoutes() {
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
  }

  preRouteHook(module) {
    if (module instanceof Module && typeof module.preRoute === 'function') {
      module.debug('Module.configureApp() hook...');
      injector.inject(module.preRoute);
    }
  }

  initializeModuleRoutes(module) {
    if (module instanceof Module) {
      module.debug([ 'Initializing routes...' ].join(' '));
      module.initRoutes();
    }
  }
}
