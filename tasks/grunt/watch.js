'use strict';

var utils = require('utils');

module.exports = {
  tests: {
    files: ['lib/**/*.js', 'modules/**/*.js'],
    tasks: ['mochaTest:ci']
  },
  schema: {
    files: [
      'schema/seedData.json',
      utils.getModulePaths('schema', 'seedData.json')
    ],
    tasks: ['jsonlint', 'db']
  },
  docs: {
    files: ['./*.js', './lib/**/*.js'].concat(utils.getModulePaths('**', '*.js')),
    tasks: ['jsdoc:docs']
  }
}
