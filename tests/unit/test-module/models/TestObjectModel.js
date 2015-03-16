module.exports = function(Model) {
  return Model.extend(
  {
    type            : 'ODM',
    softDeletable   : true,
    timeStampable   : true
  },
  {
    id: {
      type          : Number,
      primaryKey    : true
    },
    name: {
      type          : String,
      required      : true
    }
  });
};
