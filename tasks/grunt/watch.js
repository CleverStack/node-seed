var utils = require('utils');

module.exports = {
  tests: {
    tasks: ['mochaTest:ci'],
    files: ['lib/**/*.js', 'modules/**/*.js']
  },
  schema: {
    tasks: ['jsonlint', 'db'],
    files: [
      'schema/seedData.json',
      utils.getModulePaths('schema', 'seedData.json')
    ]
  },
  docs: {
    tasks: ['jsdoc:docs'],
    files: ['./*.js', './lib/**/*.js'].concat(utils.getModulePaths('**', '*.js'))
  }
};
