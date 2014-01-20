var Q = require('q')
  , BaseService = require( 'services' ).BaseService
  , ExampleService;

ExampleService = BaseService.extend({

});

module.exports = function( sequelize, ORMExampleModel ) {
    if ( !ExampleService.instance ) {
        ExampleService.instance = new ExampleService( sequelize );
        ExampleService.Model = ORMExampleModel;
    }
    
    return ExampleService.instance;
};