'use strict';

var path            = require('path')
  , fs              = require('fs')
  , packageJson     = require(__dirname + '/package.json')
  , merge           = require('deepmerge')
  , config          = require(path.join(__dirname, config))
  , helpers         = require(path.join(__dirname, 'lib', 'utils', 'helpers.js'))
  , registerFuncs   = []
  , gruntConfig     = {};

// Clean and set the NODE_PATH for magic modules
process.env.NODE_PATH = helpers.nodePath();

/**
 * Helper function to load grunt task configuration objects and register tasks
 * @param  {String} taskNames the names of the tasks you want to load
 */
function loadGruntConfigs(taskNames) {
  taskNames.forEach(function(taskName) {
    var gruntTask   = require(path.resolve(path.join(__dirname, 'tasks', 'grunt', taskName + '.js')))
      , hasRegister = gruntTask.config && gruntTask.register
      , taskConfig  = {};

    // Extend the main grunt config with this tasks config
    taskConfig[taskName] = !!hasRegister ? gruntTask.config : gruntTask;
    gruntConfig          = merge(gruntConfig, taskConfig);

    // Allow registration of grunt tasks
    if (!!hasRegister) {
      registerFuncs.push(gruntTask.register);
    }
  });
}

module.exports = function(grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Load the grunt task config files
  loadGruntConfigs(config.tasks.grunt);

  // Load all modules Gruntfiles.js
  packageJson.bundledDependencies.forEach(function(moduleName) {
    var moduleGruntfile = [path.resolve(__dirname), 'modules', moduleName, 'Gruntfile.js'].join(path.sep);
    if (fs.existsSync(moduleGruntfile)) {
      var gruntfile = require(moduleGruntfile)(grunt);

      // Merge (deep) the grunt config objects
      gruntConfig = merge(gruntConfig, gruntfile[0]);

      // Add the register function to our callbacks
      registerFuncs.push(gruntfile[1]);
    }
  });

  // Initialize the config
  grunt.initConfig(gruntConfig);

  // Fire the callbacks and allow the modules to register their tasks
  registerFuncs.forEach(function(registerTasks) {
    registerTasks(grunt);
  });
};
