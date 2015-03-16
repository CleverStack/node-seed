module.exports.setup = function timeStampableBehaviour(Klass) {
  if (Klass.timeStampable === true) {
    Klass.fields.createdAt = {
      type        : Date,
      columnName  : Klass.createdAt
    };
    if (Klass.createdAt !== 'createdAt') {
      Klass.aliases.push({
        key         : 'createdAt',
        columnName  : Klass.createdAt
      });
    }

    Klass.fields.updatedAt = {
      type        : Date,
      columnName  : Klass.updatedAt
    };
    if (Klass.updatedAt !== 'updatedAt') {
      Klass.aliases.push({
        key         : 'updatedAt',
        columnName  : Klass.updatedAt
      });
    }
  }
};

module.exports.beforeCreate = function beforeCreateTimeStampableModel(modelData, callback) {
  if (this.type === 'ODM' && !!this.timeStampable) {
    modelData[this.createdAt] = new Date();
    modelData[this.updatedAt] = new Date();
  }
  if (callback) {
    callback(null);
  }
};

module.exports.beforeUpdate = function beforeUpdateTimeStampableModel(modelData, callback) {
  if (this.type === 'ODM' && !!this.timeStampable) {
    modelData[this.updatedAt] = new Date();
  }
  if (callback) {
    callback(null);
  }
};
