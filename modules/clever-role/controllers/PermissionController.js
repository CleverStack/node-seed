module.exports = function ( PermissionService ) {

    return (require( 'classes' ).Controller).extend(
        {
            service: PermissionService
        },
        /* @Prototype */
        {
            listAction: function () {
                PermissionService.list()
                    .then( this.proxy( 'send' ), this.proxy( 'handleException' ) );
            }
        } );
}
