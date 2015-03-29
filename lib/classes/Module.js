var injector    = require('injector')
  , Class       = injector.getInstance('Class')
  , Exceptions  = require('exceptions')
  , path        = require('path')
  , async       = require('async')
  , fs          = require('fs')
  , i           = require('i')()
  , moduleDebug = require('debug')('Modules')
  , config      = injector.getInstance('config')
  , moduleLdr   = injector.getInstance('moduleLoader')
  , modules     = {};

/**
 * @classdesc CleverStack Module Class
 * @class     Module
 * @extends   Class
 */
module.exports = Class.extend(
/**
 * @lends Module
 */
{
  /**
   * The default module folders to load resources from
   * @type {Array}
   */
  moduleFolders: [
    'exceptions',
    'classes',
    'models',
    'services',
    'controllers'
  ],

  /**
   * Which of the Module.moduleFolders can use injector.inject() for loading
   * @type {Array}
   */
  injectableFolders: [
    'models',
    'controllers',
    'services'
  ],

  /**
   * Which of the files inside of Module.moduleFolders should be explicitly ignore
   * @type {Array}
   */
  excludedFiles: [
    'index.js',
    'module.js',
    'Gruntfile.js',
    'package.json'
  ],

  /**
   * Extends the Module class with new static and prototype functions, there are a variety of ways to use extend.
   *   // with static and prototype
   *   Module.extend({ STATIC },{ PROTOTYPE })
   *    
   *   // with just classname and prototype functions
   *   Module.extend({ PROTOTYPE })
   *
   * @override
   * @param  {Object} Static the new Modules static properties/functions
   * @param  {Object} Proto  the new Modules prototype properties/functions
   * @return {Module}
   */
  extend: function() {
    var Reg           = new RegExp('.*\\(([^\\)]+)\\:.*\\:.*\\)', 'ig')
      , stack         = new Error().stack.split('\n')
      , extendingArgs = [].slice.call(arguments)
      , Static        = (extendingArgs.length === 2) ? extendingArgs.shift() : {}
      , Proto         = extendingArgs.shift()
      , modulePath
      , moduleName
      , pkg;

    // Get rid of the Error at the start
    stack.shift();

    if (Reg.test(stack[ 2 ])) {
      modulePath = RegExp.$1.split(path.sep);
      modulePath = modulePath.splice(0, modulePath.length - 1).join(path.sep);
      pkg        = path.resolve(path.join(modulePath, 'package.json'));
      moduleName = path.basename(modulePath);
    } else {
      throw new Error('Error loading module, unable to determine modules location and name.');
    }

    if (modules[ moduleName ] !== undefined) {
      moduleDebug('Returning previously defined module ' + moduleName + '...');
      return modules[ moduleName ];
    }

    moduleDebug('Setting up ' + moduleName + ' module from path ' + modulePath + '...');
    if (Static.extend) {
      moduleDebug('You cannot override the extend() function provided by the CleverStack Module Class!');
      delete Static.extend;
    }

    if (fs.existsSync(pkg)) {
      moduleDebug('Loading ' + pkg + '...');
      pkg = require(pkg);
    } else {
      pkg = false;
    }

    Proto._camelName = i.camelize(moduleName.replace(/\-/ig, '_'), false);
    moduleDebug('Creating debugger with name ' + Proto._camelName + '...');
    Proto.debug = require('debug')('cleverstack:' + Proto._camelName);

    moduleDebug('Creating module class...');

    /**
     * extend event.
     *
     * @event Module.extend
     * @type {Module}
     */
    var Klass    = this._super.apply(this, [Static, Proto])
      , instance = Klass.callback('newInstance')(moduleName, modulePath, pkg);

    modules[moduleName] = instance;

    return instance;
  }
},
/**
 * @lends Module#
 */
{
  /**
   * The name of this service
   * @type {String}
   */
  name: null,

  /**
   * The configuration of this module, as loaded via require('config')[moduleName]
   * @type {Object}
   */
  config: null,

  /**
   * The resolved path to the module
   * @type {String}
   */
  path: null,

  /**
   * The contents of the JSON inside this modules/module/package.json
   * @type {Object}
   */
  pkg: null,

  /**
   * A list of existing paths that are build in Module#setup
   * @type {Array}
   */
  paths: null,

  /**
   * An override setup function for Module
   * 
   * @override
   * @param  {String} _name The name of the service
   * @param  {String} _path The path of this module
   * @param  {Object} _pkg  The contents of this modules package.json file
   * @return {Arary}
   */
  setup: function(_name, _path, _pkg) {
    // Set our module name
    this.name = _name;

    // Set our config if there is any
    this.config = typeof config[ _name ] === 'object' ? config[ _name ] : {};

    // Set the modules location
    this.path = _path;

    // Set the modules package.json
    this.pkg = _pkg;

    // Ensure its dependencies are enabled and will be loaded
    if (this.pkg && this.pkg.peerDependencies) {
      Object.keys(_pkg.peerDependencies).forEach(this.proxy(function(dependency) {
        if (!moduleLdr.moduleIsEnabled(dependency)) {
          throw new Exceptions.ModuleDependencyNotMet(this.name + ' requires ' + dependency + '@' + this.pkg.peerDependencies[dependency]);
        }
      }));
    }

    /**
     * preSetup event.
     *
     * @event Module.preSetup
     * @type {Module}
     */
    this.hook('preSetup');

    // Add the modules path to our list of paths
    this.paths = [ _path ];
    
    // Check to see if clever-background-tasks is installed
    if (moduleLdr.moduleIsEnabled('clever-background-tasks')) {
      this.Class.moduleFolders.push('tasks');
    }

    // Add our moduleFolders to the list of paths, and our injector paths
    this.Class.moduleFolders.forEach(this.proxy('addFolderToPath', injector));

    /**
     * preInit event.
     *
     * @event Module.preInit
     * @type {Module}
     */
    this.hook('preInit');

    // Call the Class constructor
    this._super.call(this);

    // Return no arguments to init
    return [];
  },

  /**
   * Used to load the resources (files, classes, configuration, etc...) for this module
   * @return {undefined}
   */
  loadResources: function() {
    async.forEach(
      this.paths,
      this.proxy('inspectPathForResources'),
      this.proxy('resourcesLoaded')
   );
  },

  /**
   * Helper function that inspects the given path for resources to load
   *
   * @param  {String}   pathToInspect the path to inspect
   * @param  {Function} callback      callback for async
   * @return {undefined}
   */
  inspectPathForResources: function(pathToInspect, callback) {
    var that = this;

    if (fs.existsSync(pathToInspect + path.sep)) {
      fs.readdir(pathToInspect + path.sep, function(err, files) {
        async.forEach(files, that.proxy('addResource', pathToInspect), callback);
      });
    } else {
      callback(null);
    }
  },

  /**
   * Helper function to load a module resource and add it to this module.
   * 
   * @param {String}   pathToInspect the path to the resource
   * @param {String}   file          the filename of the resource
   * @param {Function} callback      callback for async
   * @return {undefined}
   */
  addResource: function(pathToInspect, file, callback) {
    if (file.match(/.+\.js$/g) !== null && this.Class.excludedFiles.indexOf(file) === -1) {
      var folders         = pathToInspect.split(path.sep)
        , name            = file.replace('.js', '')
        , currentFolder   = null
        , insideModule    = false
        , rootFolder      = null
        , lastFolder      = this
        , that            = this
        , traceError      = new Error('Load Timeout for ' + file)
        , loadTimeout     = setTimeout(function() {
          that.debug(traceError);
          process.exit(1);
        }, 10000)
        , resource;

      while (folders.length > 0) {
        currentFolder = folders.shift();
        if (insideModule === false && currentFolder === this.name) {
          // Make sure that this is the LAST instance of the name
          if (folders.indexOf(this.name) === -1) {
            insideModule = true; 
          }
        } else if (insideModule === true) {
          if (rootFolder === null) {
            rootFolder = currentFolder;
            if (this[ rootFolder ] !== undefined ) {
              lastFolder = this[ rootFolder ];
            }
          } else {
            lastFolder = lastFolder[ currentFolder ];
          }
        }
      }

      // Load the resource
      resource = require([ pathToInspect, path.sep, file ].join(''));

      // Do not load dependencies that can be injected
      if (this.Class.injectableFolders.indexOf(rootFolder) === -1) {
        
        if (this.Class.injectableFolders.indexOf(name) === -1)  {
          // Add the resource to the injector
          if (name !== 'routes') {
            this.debug('Adding ' + name + ' to the injector');
            injector.instance(name, resource);
          }

          // Add the resource to the last object we found
          lastFolder[ name ] = resource;
          clearTimeout(loadTimeout);
          callback(null);
        } else {
          clearTimeout(loadTimeout);
          callback(null);
        }
      } else {
        this.debug('Loading ' + name + ' using the injector...');
        injector.inject(resource, function(resource) {
          injector.instance(name, resource);
          lastFolder[ name ] = resource;
          clearTimeout(loadTimeout);
          callback(null);
        });
      }
    } else {
      callback(null);
    }
  },

  /**
   * Fires the resourcesLoaded event with any errors raised during loading
   * @return {undefined}
   */
  resourcesLoaded: function(err) {
    this.debug('Resources Loaded');
    /**
     * resourcesLoaded event.
     *
     * @event Module.resourcesLoaded
     * @type {Module}
     */
    this.emit('resourcesLoaded', err || null);
  },

  /**
   * A helper function to add a folder to this.paths
   * 
   * @param  {String}   hookName  the name of the hook function to run
   * @return {undefined}
   */
  addFolderToPath: function(injector, folder) {
    var folderPath      = path.join(this.path, folder)
      , folders         = folder.split('/')
      , currentFolder   = null
      , rootFolder      = null
      , obj             = {}
      , lastFolder      = obj;

    while (folders.length > 0) {
      currentFolder = folders.shift();
      if (rootFolder === null) {
        rootFolder = currentFolder;
        if (this[ rootFolder ] !== undefined ) {
          lastFolder = obj = this[ rootFolder ];
        }
      } else {
        if (lastFolder[ currentFolder ] === undefined) {
          lastFolder[ currentFolder ] = {};
        }
        lastFolder = lastFolder[ currentFolder ];
      }
    }

    this[ rootFolder ] = obj;
    this.paths.push(folderPath);
    injector._inherited.factoriesDirs.push(folderPath);
  },

  /**
   * A helper function to run a hook on a module, it that hook function exists
   * 
   * @param  {String}   hookName  the name of the hook function to run
   * @return {undefined}
   */
  hook: function(hookName) {
    if (typeof this[ hookName ] === 'function') {
      this.debug('calling ' + hookName + '() hook...');

      // @TODO implement injector.injectSync() for use cases like this
      this[ hookName ]();
    }
  },

  /**
   * Default implementation of the initRoutes hook for this module, you can override this if you need
   * @return {undefined}
   */
  initRoutes: function() {
    if (typeof this.routes === 'function') {
      this.debug('calling initRoutes() hook...');
      injector.inject(this.routes);
    }
  }
});
