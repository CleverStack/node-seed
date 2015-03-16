/**
 * Default Options, defined as properties of the Classes default options Object Literal.
 * @see http://cleverstack.io/documentation/backend/models/#options
 * 
 * @property {String} type=ORM              the default model type, either 'ORM' or 'ODM'
 * @property {String} dbName=false          the name of the database table
 * @property {String} engine=false          the database engine to use for this model (ORM ONLY)
 * @property {String} charset=false         the database charset to use for this model (ORM ONLY)
 * @property {String} comment=false         the database comment to use for this model (ORM ONLY)
 * @property {String} collate=false         the database collate to use for this model (ORM ONLY)
 * @property {Object} indexes=false         custom definition of indexes for this model
 * @property {String} createdAt=createdAt   for use with the timeStampable behaviour
 * @property {String} updatedAt=updatedAt   for use with the timeStampable behaviour
 * @property {String} deletedAt=deletedAt   for use with the softDeleteable behaviour
 * @property {Boolean} underscored=false    the database underscored to use for this model
 * @property {Boolean} versionable=false    the versionable behaviour
 * @property {Boolean} freezeDbName=false   if set to true your models tableName(dbName) won't be plural or camelized
 * @property {Boolean} timeStampable=true  the timeStampable behaviour
 * @property {Boolean} softDeleteable=true the softDeleteable behaviour
 */
module.exports = {
  type           : 'ORM',
  dbName         : false,
  engine         : false,
  charset        : false,
  comment        : false,
  collate        : false,
  indexes        : false,
  createdAt      : 'createdAt',
  updatedAt      : 'updatedAt',
  deletedAt      : 'deletedAt',
  underscored    : false,
  versionable    : false,
  freezeDbName   : false,
  timeStampable  : true,
  softDeleteable : true
};
