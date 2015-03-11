module.exports = function normalizeQueryOptions(queryOptions) {
  queryOptions = typeof queryOptions === 'object' ? queryOptions : {};
  return queryOptions;
};