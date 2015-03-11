var util  = require('util')
  , chalk = require('chalk')
  , debug = require('debug')('cleverstack:utils:model:handleResult');

function updateReferencedModel(resolve, reject, err, model) {
  if ( !err ) {
    this.entity = model;
    resolve( this );
  } else {
    reject( err );
  }
}

function removeReferencedModel(resolve, reject, err) {
  if (!err) {
    delete this.entity;
    resolve({});
  } else {
    if (debug.enabled) {
      debug(util.format('%s (%s) %s %s', chalk.red('Error'), err.parent ? err.parent.message : err.message, util.inspect(err.stack ? err.stack.split('\n') : err)));
    }
    reject(err);
  }
}

function returnModels(resolve, reject, err, models) {
  if (err === undefined || err === null) {
    resolve(models);
  } else {
    if (debug.enabled) {
      debug(util.format('%s (%s) %s %s', chalk.red('Error'), err.parent ? err.parent.message : err.message, util.inspect(err.stack ? err.stack.split('\n') : err)));
    }
    reject(err);
  }
}

module.exports.returnModels          = returnModels;
module.exports.updateReferencedModel = updateReferencedModel;
module.exports.removeReferencedModel = removeReferencedModel;