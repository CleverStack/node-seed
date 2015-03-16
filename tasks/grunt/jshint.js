var utils = require('utils');

module.exports = {
  options: {
    jshintrc: '.jshintrc',
    reporter: require('jshint-stylish'),
    ignores: [
      './modules/**/test*/**/*.js'
    ]
  },
  all: [
    './Gruntfile.js',
    './app.js',
    './cluster.js',
    './lib/**/*.js',
    './modules/**/*.js',
    './tasks/**/*.js',
    './schema/**/*.js',
    utils.getModulePaths('*.js')
  ]
};
