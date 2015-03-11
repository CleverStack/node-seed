'use strict';

var utils    = require('utils')
  , odmUtils = utils.odmUtils;

/**
 * Helper function to setup an association where SourceModel.belongsTo(TargetModel), with optional options for the association.
 * @see http://cleverstack.io/documentation/backend/models/#assocations
 *     
 * @function Model.belongsTo
 * @param   {Model}  targetModel the TargetModel that this SourceModel belongsTo.
 * @param   {Array}  options     the optional options for this association
 * @returns {Object} the association object
 */
module.exports = function belongsToAssociation(targetModel, options) {
  if (this.type === 'ODM') {
    return odmUtils.belongsTo.apply(this, [targetModel, options]);
  } else {
    return this.entity.belongsTo.apply(this.entity, [targetModel, options]);
  }
}