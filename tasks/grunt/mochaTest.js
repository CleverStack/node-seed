var utils = require('utils');

module.exports = {
  config: {
    unit: {
      options: {
        require  : 'chai',
        reporter : 'spec',
        timeout  : 5000,
        bail     : true
      },
      src: [
        'tests/unit/utils/bootstrapEnv.js',
        'tests/unit/utils/*.js',
        'node_modules/clever-injector/test/test.injector.js',
        'node_modules/clever-controller/test/controller.test.js',
        'tests/unit/classes/ModuleLoader.js',
        'tests/unit/classes/Module.js',
        'tests/unit/classes/*.js',
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
    grunt.registerTask('test',      ['db', 'mochaTest:unit', 'mochaTest:e2e', 'db']);
    grunt.registerTask('test:unit', ['mochaTest:unit']);
    grunt.registerTask('test:e2e',  ['mochaTest:e2e']);
    grunt.registerTask('test:ci',   ['watch:tests']);
  }
};
