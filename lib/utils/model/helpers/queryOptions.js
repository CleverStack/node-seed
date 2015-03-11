module.exports.normalize = function(queryOptions) {
  queryOptions = typeof queryOptions === 'object' ? queryOptions : {};
  return queryOptions;
};