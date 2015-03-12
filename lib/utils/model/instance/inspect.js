/**
 * Special handler for util.inspect to use Model#toJSON
 * 
 * @see http://cleverstack.io/documentation/backend/models/#instance-methods-inspect
 * @return {Object}
 */
module.exports = function inspectModel() {
  return JSON.stringify(this.toJSON(), null, '  ');
};
