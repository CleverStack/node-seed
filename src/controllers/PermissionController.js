
module.exports = function( PermissionService ) {

    return (require('./../classes/Controller.js')).extend(
    {
        
        service:PermissionService
    },
	/* @Prototype */
    {
        
    });
}
