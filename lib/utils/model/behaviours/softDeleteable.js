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

module.exports.criteria = function softDeleteableCriteria(findOptions, queryOptions, callback) {
  var columnName = this.deletedAt
    , where      = findOptions.where;

  if (!where) {
    findOptions.where = where = {};
  }

  if (!!this.softDeleteable) {
    var deletedAt = where[columnName];

    if (deletedAt === undefined || deletedAt === false) {
      where[columnName] = null;
    } else if (deletedAt === true) {
      where[columnName] = {
        $ne: null
      };
    } else if (typeof deletedAt === 'string' && !deletedAt instanceof Date) {
      where[columnName] = new Date(deletedAt);
    }
  }

  if (callback) {
    callback(null);
  }
};


module.exports.beforeCreate = function beforeCreateTimeStampableModel(modelData, callback) {
  if (this.type === 'ODM' && !!this.timeStampable) {
    modelData[this.deletedAt] = null;
  }
  if (callback) {
    callback(null);
  }
};
