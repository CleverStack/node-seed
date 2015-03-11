module.exports.setup = function softDeleteableBehaviour(Klass) {
  if (Klass.softDeleteable === true) {
    Klass.fields.deletedAt = {
      type        : Date,
      columnName  : Klass.deletedAt
    };
    if (Klass.deletedAt !== 'deletedAt') {
      Klass.aliases.push({
        key         : 'deletedAt',
        columnName  : Klass.deletedAt
      });
    }
  }
};

module.exports.beforeFindersOptions = function beforeFindSoftDeleteableModel(findOptions, callback) {
  if (findOptions[this.deletedAt] === undefined) {
    findOptions[this.deletedAt] = {is: null};
  }
  callback(null);
};