var os             = require('os')
  , fs             = require('fs')
  , path           = require('path')
  , util           = require('util')
  , getModulePaths = require(path.resolve(path.join(__dirname, 'getModulePaths')))
  , packageJson    = require(path.resolve(path.join(__dirname, '..', '..', 'package.json')))
  , isWin          = /^win32/.test(os.platform())
  , underscore     = require('underscore')
  , debug          = require('debug')('cleverstack:utils:helpers');

module.exports = {

  /**
   * Makes sure that the NODE_PATH is correctly set in the current process so that child processes
   * have access to cleverstack modules as well as magic modules like require('config')
   * 
   * @return {String} Returns the path joined by the correct delimiter for the operating system
   */
  nodePath: function() {
    var delimiter    = isWin ? ';' : ':'
      , currentPaths = process.env.NODE_PATH ? process.env.NODE_PATH.split(delimiter) : []
      , appRoot      = path.resolve(path.join(__dirname, '..', '..'))
      , paths        = [ path.join(appRoot, 'lib'), path.join(appRoot, 'modules') ]
      , nodePath;

    currentPaths.forEach(function(_path) {
      if (!/lib(\/|\\)?$|modules(\/|\\)?$/.test(_path)) {
        paths.push(_path);
      }
    });

    nodePath = paths.join(delimiter);
    if (debug.enabled) {
      debug(util.format('NODE_PATH=%s', nodePath));
    }

    return nodePath;
  },

  /**
   * Helper function that will load a file based on its name from every enabled module in your application
   * 
   * @param  {String}   fileName Name of the file you want to load
   * @param  {Object}   config   Applications config object
   * @param  {Object}   cluster  NodeJS Cluster module
   * @param  {Function} debug  Function that can be called with debugging information
   * 
   * @return {null}
   */
  loadModulesFileByName: function(fileName, config, cluster, debug) {
    getModulePaths().forEach(function(modulePath) {
      var file = path.resolve(path.join(modulePath, 'bin', fileName));
      if (fs.existsSync(file)) {
        if (debug.enabled) {
          debug('Loading ' + fileName + ' from ' + modulePath.split(path.sep).pop());
        }
        require(file)(cluster, config, packageJson, debug);
      }
    });
  },

  getFilesForFolder: function(folderName) {
    var files = [];

    if (fs.existsSync(folderName)) {
      fs.readdirSync(folderName).forEach(function(fileName) {
        if (fs.statSync(path.join(folderName, fileName)).isFile() && /\.js$/.test(fileName)) {
          files.push(fileName);
        }
      });
    }

    return files;
  },

  /**
   * Get the name of the file at the given offset to be used as a ClassName
   * 
   * @param  {Number}         offset the offset in the stack
   * @return {String|Boolean} the filename or false if we can't manage to get the filename
   */
  getClassName: function(offset) {
    var Reg         = new RegExp('.*\\(([^\\)]+)\\:.*\\:.*\\)', 'ig')
      , stack       = new Error().stack.split('\n')
      , file        = stack.splice(offset, 1);

    return Reg.test(file) ? RegExp.$1.split(path.sep).pop().replace('.js', '').replace('.es6', '') : false;
  },

  defineProperty: function(obj, prop, options) {
    var defaults = {
      writable     : false,
      enumerable   : false,
      configurable : false
    };

    if (typeof options === 'function') {
      options = {
        get: options
      };
      delete defaults.writable;
    }

    // debug(util.format('Defining %s with options of %s', prop, util.inspect(options, {showHidden: false, colors: true, customInspect: true, depth: 0})));

    options = underscore.extend(defaults, options);

    Object.defineProperty(obj, prop, options);
  },

  debugInspect: function(obj) {
    return util.inspect(obj, {showHidden: false, colors: true, customInspect: true, depth: 1}).replace(/\n[\ ]+/igm, ' ');
  },

  includeModel: function(findOptions, model, as, includes) {
    var include;

    if (!findOptions.include) {
      findOptions.include = [];
    }
    
    if (!(include = underscore.findWhere(findOptions.include, {as: as}))) {
      include = {
        model : model.entity,
        as    : as
      };
      findOptions.include.push(include);
    }

    if (!!includes) {
      if (!include.include) {
        include.include = includes;
      } else {
        underscore.extend(include.include, includes);
      }
    }

    return this;
  }
};
