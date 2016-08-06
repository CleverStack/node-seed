/**
 * @doc module
 * @name timezoneModule.controllers:TimezoneController
 */
module.exports = function( TimezoneService ) {
    return (require('classes').Controller).extend(
    {
        service: TimezoneService
    },
    {
        
    });
}
