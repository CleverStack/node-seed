module.exports = function ( FileService ) {

    return (require( 'classes' ).Controller).extend(
        {
            service: FileService
        },
        /* @Prototype */
        {

            listAction: function () {
                var userId = this.req.query.userId
                  , accId = this.req.user.account.id
                  , action;

                if ( userId ) {
                    action = FileService.listFilesForUser( userId, accId );
                } else {
                    action = FileService.listFiles( accId );
                }

                action
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            getAction: function () {
                var userId = this.req.user.id
                  , accId = this.req.user.account.id
                  , fileId = this.req.params.id;

                FileService
                    .getFailByIds( userId, accId, fileId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            postAction: function () {
                var userId = this.req.user.id
                  , accId = this.req.user.account.id
                  , data = this.req.body;

                FileService
                    .createFiles( userId, accId, data )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            putAction: function () {
                var userId = this.req.user.id
                  , accId = this.req.user.account.id
                  , fileId = this.req.params.id
                  , data = this.req.body;

                FileService
                    .updateFile( userId, accId, fileId, data )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            deleteAction: function () {
                var userId = this.req.user.id
                  , accId = this.req.user.account.id
                  , fileId = this.req.params.id;

                FileService
                    .deleteFile ( userId, accId, fileId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            handleServiceMessage: function ( obj ) {

                if ( obj.statuscode ) {
                    this.send( obj.message, obj.statuscode );
                    return;
                }

                this.send( obj, 200 );
            }

        } );
};