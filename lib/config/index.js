'use strict';

var path        = require('path')
  , fs          = require('fs')
  , debug       = require('debug')('Config')
  , envOverride = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : null
  , fileNames   = ['global', 'default']
  , appRoot     = path.resolve(path.join(__dirname, '..', '..'))
  , configRoot  = path.join(appRoot, 'config')
  , packageJson = require(path.join(appRoot, 'package.json'))
  , configFiles = { global: [ path.join(configRoot, 'global.json') ], env: [] }
  , modules     = packageJson.bundledDependencies
  , config;

if (envOverride === null) {
  debug('No environment based config set using NODE_ENV, defaulting to "local" configuration');
  envOverride = 'local';
}

configFiles.env.push(path.join(configRoot, envOverride + '.json'));

modules.forEach(function(moduleName) {
  var moduleConfigPath = path.resolve(path.join(appRoot, 'modules', moduleName, 'config'));

  fileNames.forEach(function(fileName) {
    var filePath = path.join(moduleConfigPath, fileName + '.json');
    if (fs.existsSync(filePath)) {
      configFiles[ fileName == 'default' ? 'global' : fileName ].push(filePath);
    }
  });
});

config = require('nconf').loadFilesSync([].concat(configFiles.global, configFiles.env));

if (modules.indexOf('clever-orm') !== -1 || modules.indexOf('clever-odm') !== -1) {
  var modelAssociations = {};

  modules.forEach(function(moduleName) {
    var moduleConfig = config[ moduleName ];
    if (typeof moduleConfig === 'object' && typeof moduleConfig.modelAssociations === 'object') {
      Object.keys(moduleConfig.modelAssociations).forEach(function(sourceModel) {
        modelAssociations[ sourceModel ] = modelAssociations[ sourceModel ] || {};
        
        var associations = moduleConfig.modelAssociations[ sourceModel ];
        Object.keys(associations).forEach(function(associationType) {
          modelAssociations[ sourceModel ][ associationType ] = modelAssociations[ sourceModel ][ associationType ] || [];

          associations[ associationType ].forEach(function(targetModel) {
            modelAssociations[ sourceModel ][ associationType ].push(targetModel);
          });
        });
      });
    }
  });

  if (modules.indexOf('clever-orm') !== -1) {
    config[ 'clever-orm' ].modelAssociations = modelAssociations;  
  }

  if (modules.indexOf('clever-odm') !== -1) {
    config[ 'clever-odm' ].modelAssociations = modelAssociations;  
  }
}

module.exports = config;
