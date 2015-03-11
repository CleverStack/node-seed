var path  = require('path')
  , model = path.join(__dirname, 'model') + path.sep;

module.exports = require('require-folder-tree')(model);