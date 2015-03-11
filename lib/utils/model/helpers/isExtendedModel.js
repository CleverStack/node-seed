module.exports = function isExtendedModel(callback) {
  callback(this.entity.name !== null ? null : 'You cannot call Model.create() directly on the model class.');
};