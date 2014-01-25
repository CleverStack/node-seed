module.exports = function ( WorkflowService ) {

    return (require( 'classes' ).Controller).extend(
        {
            service: WorkflowService
        },
        /* @Prototype */
        {
            listAction: function () {
                var accId = this.req.user.account.id;

                WorkflowService
                    .list( accId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            getAction: function () {
                var accId = this.req.user.account.id
                  , wfllId = this.req.params.id;

                WorkflowService
                    .getWorkflowByIds( accId, wfllId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            postAction: function () {
                var data = this.req.body;

                if( data.id ) {
                    this.putAction();
                    return;
                }

                data.UserId =    this.req.user.id;
                data.AccountId = this.req.user.account.id;

                WorkflowService
                    .processCreationWorkflow( data )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            putAction: function () {
                var data = this.req.body
                  , accId = this.req.user.account.id
                  , wflId = this.req.params.id;

                if ( data.id !== wflId ){
                    this.send( 'bad request', 400 );
                    return;
                }

                WorkflowService
                    .updateWorkflow( accId, wflId, data )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            deleteAction: function () {
                var accId = this.req.user.account.id
                  , wfllId = this.req.params.id;

                WorkflowService
                    .processRemoveWorkflow( accId, wfllId )
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