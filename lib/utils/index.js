try {
  require('babel/register')({
    stage: 0,
    loose: true,
    ignore: false,
    optional: [
      'spec.undefinedToVoid',
      'es6.spec.templateLiterals',
      'minification.propertyLiterals',
      'utility.inlineEnvironmentVariables',
      'minification.memberExpressionLiterals'
    ],
    extensions: [
      '.es6'
    ],
    blacklist:   [
      'es3.memberExpressionLiterals',
      'es3.propertyLiterals'
    ],
    ast:         true,
    sourceMaps:  false,
    nonStandard: false,
    compact:     'false',
    retainLines: false
  });
} catch(e){}

module.exports = require('./magicModule')('utils');
