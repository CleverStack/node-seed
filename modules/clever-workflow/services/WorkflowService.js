var Q = require('q')
  , WorkflowService = null;

module.exports = function ( sequelize,
                            ORMWorkflowModel,
                            ORMWorkflowStepsModel  ) {

    if ( WorkflowService && WorkflowService.instance ) {
        return WorkflowService.instance;
    }

    WorkflowService = require( 'services' ).BaseService.extend( {

        list: function( accId ) {
            var deferred = Q.defer();

            ORMWorkflowModel
                .findAll( { where: { AccountId: accId } } )
                .success( deferred.resolve )
                .error( deferred.reject );

            return deferred.promise;
        },

        getWorkflowByIds: function( accId, wflId ){
            var deferred = Q.defer();

            ORMWorkflowModel
                .find( { where: { AccountId: accId, id: wflId } } )
                .success( function( workflow ) {

                    if ( !workflow || !workflow.id ){
                        deferred.resolve( {statuscode: 403, message: 'invalid'} );
                    } else {
                        deferred.resolve( workflow );
                    }
                })
                .error( deferred.reject );

            return deferred.promise;
        },

        createWorkflow: function ( data ) {
            var deferred = Q.defer()
              , service = this;

            service
                .create( data )
                .then( deferred.resolve )
                .fail( deferred.reject );

            return deferred.promise;
        },

        updateWorkflow: function( accId, wflId, data ) {
            var deferred = Q.defer()
              , promise = []
              , service = this;

            service
                .getWorkflowByIds( accId, wflId )
                .then( function( workflow ) {

                    if ( !!workflow.statuscode ) {
                        deferred.resolve( workflow );
                    } else {

                        if ( workflow.isEditable ) {

                            workflow
                                .updateAttributes( data )
                                .success( deferred.resolve )
                                .error( deferred.reject );

                        } else {
                            deferred.resolve( {statuscode: 403, message: 'invalid'} );
                        }
                    }

                })
                .fail( deferred.reject );

            return deferred.promise;
        },

        processCreationWorkflow: function( data ) {
            var deferred = Q.defer()
              , service = this;

            service
                .createWorkflow( data )
                .then( function( workflow ) {

                    if ( !!workflow.templateWorkflowId ) {

                        ORMWorkflowStepsModel
                            .findAll( { where: { WorkflowId: workflow.templateWorkflowId } } )
                            .success( function( steps ) {

                                var promise = [];

                                steps.forEach( function ( step ) {
                                    var newStep = {};

                                    newStep.name = step.name;
                                    newStep.statusType = step.statusType;
                                    newStep.data = step.data;
                                    newStep.swfVersion = step.swfVersion;
                                    newStep.swfRegistrationCompleted = step.swfRegistrationCompleted;
                                    newStep.swfRegistrationAttempts = step.swfRegistrationAttempts;
                                    newStep.position = step.position;
                                    newStep.WorkflowId = workflow.id;

                                    promise.push( ORMWorkflowStepsModel.create( newStep ) );
                                });

                                Q.all( promise )
                                    .then( function() {
                                        deferred.resolve( workflow )
                                    })
                                    .fail( deferred.reject )
                            })
                            .error( deferred.reject );

                    } else {
                        deferred.resolve( workflow );
                    }
                })
                .fail( deferred.reject );

            return deferred.promise;
        },

        processRemoveWorkflow: function( accId, wflId ) {
            var deferred = Q.defer()
              , promise = []
              , service = this;

            service
                .getWorkflowByIds( accId, wflId )
                .then( function( workflow ) {

                    if ( !!workflow.statuscode ) {
                        deferred.resolve( workflow );
                    } else {

                        promise.push( workflow.destroy() );

                        ORMWorkflowStepsModel
                            .findAll( { where: { WorkflowId: wflId } } )
                            .success( function( steps ) {

                                steps.forEach( function ( step ) {
                                    promise.push( step.destroy() );
                                });

                                Q.all( promise )
                                    .then( function() {
                                        deferred.resolve( {statuscode: 200, message: 'ok'} );
                                    })
                                    .fail( deferred.reject )
                            })
                            .error( deferred.reject );
                    }

                })
                .fail( deferred.reject );

            return deferred.promise;
        }

    } );

    WorkflowService.instance = new WorkflowService( sequelize );
    WorkflowService.Model = ORMWorkflowModel;

    return WorkflowService.instance;
};