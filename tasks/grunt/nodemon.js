var path = require('path');

module.exports = {
  cluster: {
    script : 'cluster.js',
    options: {
      cwd       : path.resolve(path.join(__dirname, '..', '..')),
      file      : 'cluster.js',
      delayTime : 1,
      ignoredFiles: [
        'README.md',
        'node_modules/**'
      ],
      watchedFolders: [
        'config',
        'lib',
        'modules'
      ],
      watchedExtensions: [
        'js'
      ]
    }
  }
};
