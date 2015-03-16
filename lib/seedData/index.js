var path        = require('path')
  , fs          = require('fs')
  , utils       = require(path.join(__dirname, '..', '..', 'lib', 'utils'))
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

utils.getModulePaths().forEach(function(modulePath) {
  var filePath = [__dirname, modulePath, 'schema', 'seedData.json'].join(path.sep);
  if (fs.existsSync(filePath)) {
    loadSeedDataFile(filePath);
  }
});

loadSeedDataFile(path.resolve(path.join(__dirname, '..', '..', 'schema', 'seedData.json')));

module.exports = seedData;
