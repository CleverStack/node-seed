/**
 * Life Cycle Event Types, An Array listing of all available Events.
 * @see http://cleverstack.io/documentation/backend/models/#events
 */
var eventNames = [
  'beforeValidate',
  'afterValidate',
  'beforeCreate',
  'beforeUpdate',
  'beforeDestroy',
  'afterCreate',
  'afterUpdate',
  'afterDestroy',
  'beforeAllFindersOptions',
  'beforeFindOptions',
  'beforeFind',
  'afterFind',
  'beforeFindAllOptions',
  'beforeFindAll',
  'afterFindAll'
];

module.exports = eventNames;