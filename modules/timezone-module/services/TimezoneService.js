var Q = require('q')
  , TimezoneService;

module.exports = function( sequelize, ORMTimezoneModel ) {
    TimezoneService = require( 'services' ).BaseService.extend({});

    if ( !TimezoneService.instance ) {
        TimezoneService.instance = new TimezoneService( sequelize );
        TimezoneService.Model = ORMTimezoneModel;
    }
    
    return TimezoneService.instance;
};
