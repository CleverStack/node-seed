var path           = require('path')
  , appRoot        = path.resolve(path.join(__dirname, '..', '..'))
  , modulesPath    = path.resolve(path.join(appRoot, 'modules'))
  , getModulePaths = require(path.resolve(path.join(__dirname, 'getModulePaths')))
  , fs             = require('fs')
  , debug          = require('debug')('cleverstack:modules:magic')
  , dottie         = require('dottie')
  , cache          = {}
  , loaded         = {};

function loadResourcesForPath(folderPath) {
  var exists  = fs.existsSync(folderPath)
    , listing = !!exists ? fs.readdirSync(folderPath) : [];

  if (!!exists && listing.length) {
    listing.forEach(function(filePath) {
      var actualPath = path.join(folderPath, filePath)
        , stats      = fs.statSync(actualPath)
        , dotted
        , fullPath;

      dotted = folderPath.replace(appRoot, '').replace(modulesPath.replace(appRoot, ''), '').split(path.sep);
      if (dotted[dotted.length-1] === '') {
        dotted.pop();
      }
      dotted = dotted.slice(2, dotted.length).join('.');
      
      if (dottie.get(cache, dotted) === undefined) {
        dottie.set(cache, dotted, {});
      }

      if (stats.isFile()) {
        if (filePath.match(/.+\.js$/g) !== null && filePath !== 'index.js' && filePath !== 'module.js') {
          filePath = filePath.replace('.js', '');
          fullPath = [dotted, filePath].join('.');

          if (dottie.get(cache, fullPath) === undefined) {
            Object.defineProperty(dottie.get(cache, dotted), filePath, {
              get: function() {
                if (dottie.get(loaded, fullPath) === undefined) {
                  if (debug.enabled) {
                    debug('Loading %s into magic module from %s...', fullPath, actualPath);
                  }

                  dottie.set(loaded, fullPath, require(actualPath));
                }

                return dottie.get(loaded, fullPath);
              },
              enumerable: true
            });
          }
        }
      } else if (stats.isDirectory()) {
        loadResourcesForPath(actualPath);
      }
    });
  }
}

module.exports = function(folderName) {
  debug('Creating magic module for ' + folderName);

  if (typeof cache[folderName] !== 'object') {
    cache[folderName] = {};
    loaded[folderName] = {};
  }

  var modulePaths = [];

  // Make sure the global one is included
  modulePaths.push(path.resolve(path.join(__dirname, '..', folderName)) + path.sep);
  // loadResourcesForPath(path.resolve(path.join(__dirname, '..', folderName)) + path.sep);

  // Build every modules path
  getModulePaths().forEach(function(modulePath) {
    modulePaths.push(path.resolve(path.join(modulePath, folderName)) + path.sep);
  });

  // Load all files in all folders
  modulePaths.forEach(function(modulePath) {
    loadResourcesForPath(modulePath);
  });

  return cache[folderName];
};
