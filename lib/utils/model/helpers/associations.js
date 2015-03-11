var utils    = require('utils')
  , odmUtils = utils.odmUtils;

/**
 * Helper function to setup an association where SourceModel.belongsTo(TargetModel), with optional options for the association.
 * @see http://cleverstack.io/documentation/backend/models/#assocations
 *
 * @param   {String} assocType   the type of association
 * @param   {Model}  targetModel the TargetModel that this SourceModel belongsTo.
 * @param   {Array}  options     the optional options for this association
 * @returns {Object} the association object
 */
module.exports = function addAssociateModelHelper(assocType) {
  return function associateModelHelper(targetModel, options) {
    if (this.type === 'ODM') {
      return odmUtils[assocType].apply(this, [targetModel, options]);
    } else {
      return this.entity[assocType].apply(this.entity, [targetModel, options]);
    }
  };
};