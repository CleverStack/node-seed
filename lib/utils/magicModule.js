var path           = require('path')
  , packageJson    = require(path.resolve(path.join(__dirname, '..', '..', 'package.json')))
  , getModulePaths = require(path.resolve(path.join(__dirname, 'getModulePaths')))
  , dbModules      = [ 'clever-orm', 'clever-odm' ]
  , fs             = require('fs')
  , debug          = require('debug')('cleverstack:modules:magic')
  , cache          = {}
  , loaded         = {};

function loadResourcesForPath(folderName, modulePath) {
  if (fs.existsSync(modulePath)) {
    fs.readdirSync(modulePath).forEach(function(file) {
      if (file.match(/.+\.js$/g) !== null && file !== 'index.js' && file !== 'module.js') {
        var name = file.replace('.js', '');

        if (cache[ folderName ][ name ] === undefined) {
          Object.defineProperty(cache[ folderName ], name, {
            get: function() {
              if (!loaded[ folderName ][ name ]) {
                debug('Loading ' + name + ' into ' + folderName + ' magic module...');
                loaded[ folderName ][ name ] = require([ modulePath, file ].join(''));
              }
              return loaded[ folderName ][ name ];
            },
            enumerable: true
          });
        }
      }
    });
  }
}

module.exports = function(folderName) {
  debug('Creating magic module for ' + folderName);

  if (typeof cache[ folderName ] !== 'object') {
    cache[ folderName ] = {};
    loaded[ folderName ] = {};
  }

  var modulePaths = [];

  // Make sure the global one is included
  modulePaths.push(folderName, path.resolve([ __dirname, '..', folderName ].join(path.sep)) + path.sep);

  // Build every modules path
  getModulePaths().forEach(function(modulePath) {
    var moduleName = modulePath.split(path.sep).pop();
    if (dbModules.indexOf(moduleName) === -1) {
      modulePaths.push(path.resolve(path.join(modulePath, folderName)));
    }
  });

  // Load all files in all folders
  modulePaths.forEach(function(modulePath) {
    loadResourcesForPath(folderName, modulePath);
  });

  return cache[ folderName ];
};
