var utils    = require('utils')
  , odmUtils = utils.odmUtils;

/**
 * Helper function to setup an association where SourceModel.hasMany(TargetModel), with optional options for the association.
 * @see http://cleverstack.io/documentation/backend/models/#assocations
 *     
 * @function Model.hasMany
 * @param   {Model}  targetModel the TargetModel that this SourceModel belongsTo.
 * @param   {Array}  options     the optional options for this association
 * @returns {Object} the association object
 */
module.exports = function hasManyAssociation() {
  if (this.type === 'ODM') {
    return odmUtils.hasMany.apply(this, arguments);
  } else {
    return this.entity.hasMany.apply(this.entity, arguments);
  }
};