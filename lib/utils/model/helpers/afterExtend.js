module.exports = function afterExtendModel(utils, defineProp, model, Klass, modelName, debug) {
  // Lock things down!
  ['entity', 'defaults', 'connection', 'type', 'modelName', 'fields', 'aliases','primaryKey', 'primaryKeys','hasPrimaryKey', 'hasSinglePrimaryKey'].forEach(function(key) {
    defineProp(model, key, { value: model[key] });
  });
  defineProp(model, 'associations', { value: model.entity.associations ? model.entity.associations : {} });

  // Setup the dynamic finders
  utils.model.helpers.dynamicFinders(model);

  // Bind for nestedOperations
  utils.model.helpers.nestedOperations.apply(this, [Klass, modelName, model, debug]);
};
