var utils    = require('utils')
  , odmUtils = utils.odmUtils;

/**
 * Helper function to setup an association where SourceModel.hasOne(TargetModel), with optional options for the association.
 * @see http://cleverstack.io/documentation/backend/models/#assocations
 * 
 * @function Model.hasOne
 * @param   {Model}  targetModel the TargetModel that this SourceModel belongsTo.
 * @param   {Array}  options     the optional options for this association
 * @returns {Object} the association object
 */
module.exports = function hasOneAssociation() {
  if (this.type === 'ODM') {
    return odmUtils.hasOne.apply(this, arguments);
  } else {
    return this.entity.hasOne.apply(this.entity, arguments);
  }
};