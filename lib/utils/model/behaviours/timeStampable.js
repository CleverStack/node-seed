module.exports.setup = function timeStampableBehaviour(Static) {
  if (Static.timeStampable === true) {
    Static.fields.createdAt = {
      type        : Date,
      columnName  : Static.createdAt
    };
    if (Static.createdAt !== 'createdAt') {
      Static.aliases.push({
        key         : 'createdAt',
        columnName  : Static.createdAt
      });
    }

    Static.fields.updatedAt = {
      type        : Date,
      columnName  : Static.updatedAt
    };
    if (Static.updatedAt !== 'updatedAt') {
      Static.aliases.push({
        key         : 'updatedAt',
        columnName  : Static.updatedAt
      });
    }
  }
};

module.exports.beforeCreate = function beforeCreateTimeStampableModel(modelData, callback) {
  if (this.modelType === 'ODM' && !!this.timeStampable) {
    modelData[this.createdAt] = Date.now();
    modelData[this.updatedAt] = Date.now();
  }
  callback(null);
};