/**
 * Allows you to use modelInstance.map()
 * @return {Mixed}
 */
function mapModelInstance() {
  return this.entity.map.apply(this, arguments);
}

module.exports = mapModelInstance;