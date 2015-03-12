var utils = require('utils');

module.exports = {
  all: {
    src: ['./schema/seedData.json'].concat(utils.getModulePaths('schema', 'seedData.json'), ['./package.json'])
  }
};
