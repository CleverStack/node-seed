module.exports = function ( WorkflowStepsService ) {

    return (require( 'classes' ).Controller).extend(
        {
            service: WorkflowStepsService
        },
        /* @Prototype */
        {
            listAction: function () {

                var wflId = this.req.params.workflowId || this.req.query.workflowId;

                WorkflowStepsService
                    .list( wflId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            getAction: function () {
                var wflId = this.req.params.workflowId || this.req.query.workflowId
                  , id = this.req.params.id;

                WorkflowStepsService
                    .getByIds( id, wflId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            postAction: function () {
                var data = this.req.body
                  , wflId = this.req.params.workflowId || this.req.query.workflowId;

                data.WorkflowId = wflId;

                if ( data.id ) {
                    this.putAction();
                    return;
                }

                WorkflowStepsService
                    .processCreationWorkflowStep( data )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            putAction: function () {
                var data = this.req.body
                  , wflId = this.req.params.workflowId || this.req.query.workflowId
                  , id = this.req.params.id;

                data.WorkflowId = wflId;

                WorkflowStepsService
                    .updateWorkflowStep( id, data )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );

            },

            deleteAction: function () {
                var id = this.req.params.id
                  , wflId = this.req.params.workflowId || this.req.query.workflowId;

                WorkflowStepsService
                    .removeWorkflowStep( id, wflId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );

            },

            reorderAction: function () {
                var data = this.req.body
                  , wflId = this.req.params.workflowId || this.req.query.workflowId;

                WorkflowStepsService
                    .reorder( data.steps, wflId )
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