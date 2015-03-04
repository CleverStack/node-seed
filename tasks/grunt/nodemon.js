module.exports = {
  web: {
    script: 'cluster.js',
    options: {
      file: 'cluster.js',
      ignoredFiles: ['README.md', 'node_modules/**'],
      watchedExtensions: ['js'],
      watchedFolders: ['config','lib','modules'],
      delayTime: 1,
      cwd: __dirname
    }
  }
}
