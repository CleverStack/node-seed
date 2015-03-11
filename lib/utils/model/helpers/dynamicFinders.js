var inflect = require('i')()
  , debug   = require('debug')('cleverstack:models:dynamicFinders')
  , util    = require('util');

module.exports = function modelDynamicFindersGenerator(model) {
  var finders    = ['findBy', 'findAllBy', 'countBy']
    , criteria   = [
      'is', 'in', 'like', 'notLike', 'iLike', 'notILike', 'startsWith', 'endsWith',
      'not', 'notEqual', 'between', 'notBetween', 'greaterThan', 'lessThan', 'greaterThanOrEqualTo', 'lessThanOrEqualTo',
      'contains', 'doesNotContain', 'contained', 'overlap'
    ]
    , helpers    = criteria.map(function(criterion) { return '$' + criterion; })
    , methods    = criteria.map(function(criterion) { return inflect.camelize(criterion, true); })
    , fieldNames = Object.keys(model.fields);
  
  fieldNames.forEach(function(field) {
    if (debug.enabled) {
      debug(util.format('%sModel.%s, Defining Dynamic Finders.', model.modelName, field));
    }
    finders.forEach(function(finder) {
      methods.forEach(function(method, index) {
        var finderName = finder + inflect.camelize(field, true) + (method === 'Is' ? '' : method)
          , helper     = helpers[index];


        Object.defineProperty(model, finderName, {
          value: function dynamicFinder(val, queryOptions) {
            var findOptions = { where: {} };

            if (method === 'Is') {
              findOptions.where[field] = val;
            } else {
              findOptions.where[field] = {};
              findOptions.where[field][helper] = val;
            }

            return this.find(findOptions, queryOptions);
          }
        });
      });
    });
  });
};