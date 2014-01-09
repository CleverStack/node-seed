module.exports = function( CountryService ) {

    return (require('classes').Controller).extend(
    {

        service:CountryService
    },
    /* @Prototype */
    {

        listAction: function() {
            CountryService.list()
            .then( this.proxy( 'handleServiceMessage' ) )
            .fail( this.proxy( 'handleException' ) );
        },

        postAction: function() {
            if (!!this.req.body.name) {
                return CountryService.findByName( this.req.body.name )
                        .then( this.proxy( 'handleServiceMessage' ) )
                        .fail( this.proxy( 'handleException' ) );
            }
            else if (!!this.req.body.code || !!this.req.body.countryCode) {
                return CountryService.findByCode( this.req.body.code || this.req.body.countryCode )
                        .then( this.proxy( 'handleServiceMessage' ) )
                        .fail( this.proxy( 'handleException' ) );
            }
            else if (!!this.req.body.id) {
                return CountryService.findById( this.req.body.id )
                        .then( this.proxy( 'handleServiceMessage' ) )
                        .fail( this.proxy( 'handleException' ) );
            } else {
                return CountryService.list( this.req.body.order || this.req.body.orderBy, this.req.body.sort || this.req.body.sortBy )
                        .then( this.proxy( 'handleServiceMessage' ) )
                        .fail( this.proxy( 'handleException' ) );
            }
        },

        handleServiceMessage : function(obj){
            if( obj.statuscode ){
                this.send( obj.message, obj.statuscode );
            } else {
                this.send( obj, 200 );
            }
        }

    });
}
