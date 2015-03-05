var path    = require('path')
  , appRoot = path.resolve(path.join(__dirname, '..', '..'));

module.exports = {
  cluster: {
    script: 'cluster.js',
    options: {
      file: 'cluster.js',
      ignoredFiles: ['README.md', 'node_modules/**'],
      watchedExtensions: ['js'],
      watchedFolders: ['config','lib','modules'],
      delayTime: 1,
      cwd: appRoot
    }
  }
}
