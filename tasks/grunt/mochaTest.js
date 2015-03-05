'use strict';

var utils = require('utils');

module.exports = {
  config: {
    unit: {
      options: {
        require  : 'chai',
        reporter : 'spec',
        timeout  : 5000
      },
      src: [
        'tests/unit/test.utils.bootstrapEnv.js',
        'tests/unit/test.utils.moduleLoader.js',
        'tests/unit/test.class.Module.js',
        'tests/unit/test.class.Controller.js',
        'tests/unit/test.class.Service.js',
        'tests/unit/*.js'
      ].concat(utils.getModulePaths('tests', 'unit', '*.js'))
    },
    e2e: {
      options: {
        require  : 'chai',
        reporter : 'spec',
        timeout  : 5000
      },
      src: ['tests/integration/*.js'].concat(utils.getModulePaths('tests', 'integration', '*.js'))
    },
    ci: {
      options: {
        require  : 'chai',
        reporter : 'min',
        timeout  : 5000
      },
      src: ['tests/**/*.js'].concat(utils.getModulePaths('tests', 'unit', '*.js'), utils.getModulePaths('tests', 'integration', '*.js'))
    }
  },
  register: function(grunt) {
    grunt.registerTask('test',      ['mochaTest:unit', 'mochaTest:e2e', 'db']);
    grunt.registerTask('test:unit', ['mochaTest:unit', 'db']);
    grunt.registerTask('test:e2e',  ['mochaTest:e2e', 'db']);
    grunt.registerTask('test:ci',   ['watch:tests']);
  }
}
