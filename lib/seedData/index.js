var path        = require('path')
  , fs          = require('fs')
  , packageJson = require(path.resolve(__dirname + '/../../') + '/package.json')
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

packageJson.bundledDependencies.forEach(function(moduleName) {
  var filePath = [path.resolve(__dirname + '/../../modules'), moduleName, 'schema', 'seedData.json'].join(path.sep)
  if (fs.existsSync(filePath)) {
    loadSeedDataFile(filePath);
  }
});

loadSeedDataFile(path.resolve(path.join(__dirname, '..', '..', 'schema', 'seedData.json')));

module.exports = seedData;