var path        = require('path')
  , fs          = require('fs')
  , appRoot     = path.resolve(path.join(__dirname, '..', '..'))
  , utils       = require(path.join(appRoot, 'lib', 'utils'))
  , debug       = require('debug')('cleverstack:seedData')
  , globalSeed  = path.resolve(path.join(__dirname, '..', '..', 'schema', 'seedData.json'))
  , seedData    = {};

function loadSeedDataFile(filePath) {
  var data = require(filePath);
  Object.keys(data).forEach(function(key) {
    if (!!seedData[key]) {
      seedData[key] = seedData[key].concat(data[key]);
    } else {
      seedData[key] = data[key];
    }
  });
}

debug('Loading %s...', globalSeed);
loadSeedDataFile(globalSeed);

utils.getModulePaths().forEach(function(modulePath) {
  var filePath = [appRoot, modulePath, 'schema', 'seedData.json'].join(path.sep);
  if (fs.existsSync(filePath)) {
    debug('Loading %s...', filePath);
    loadSeedDataFile(filePath);
  }
});

module.exports = seedData;
