var Q = require('q')
  , Sequelize = require('sequelize')
  , WorkflowStepsService = null;

module.exports = function ( sequelize,
                            ORMWorkflowStepsModel ) {

    if ( WorkflowStepsService && WorkflowStepsService.instance ) {
        return WorkflowStepsService.instance;
    }

    WorkflowStepsService = require( 'services' ).BaseService.extend( {

        list: function( workflowId ) {
            var deferred = Q.defer();

            if ( !workflowId ) {
                deferred.resolve( {statuscode: 400, message: 'bad request'} );
            } else {
                ORMWorkflowStepsModel
                    .findAll( { where: { WorkflowId: workflowId } } )
                    .success( function( results ) {
                        deferred.resolve( results )
                    })
                    .error( deferred.reject )
            }

            return deferred.promise;
        },

        getByIds: function( workflowStepId, workflowId ) {
            var deferred = Q.defer();

            ORMWorkflowStepsModel
                .find( { where: { WorkflowId: workflowId, id: workflowStepId } } )
                .success( function( workflowStep ) {

                    if ( !workflowStep || !workflowStep.id ){
                        deferred.resolve( { statuscode: 403, message: 'invalid' } );
                    } else {
                        deferred.resolve( workflowStep );
                    }
                })
                .error( deferred.reject );

            return deferred.promise;
        },

        processCreationWorkflowStep: function( data ) {
            var deferred = Q.defer()
              , service = this
              , condition = true;

            if ( !data.WorkflowId || !data.position ) {

                deferred.resolve( { statuscode: 400, message: 'bad request' } );

            } else {

                service
                    .list( data.WorkflowId )
                    .then( function( steps ) {

                        if ( !!steps && !!steps.length ){
                            steps.forEach( function( step ) {
                                if ( step.position === data.position ) {
                                    deferred.resolve( { statuscode: 403, message: 'invalid' } );
                                    condition = false;
                                }
                            })
                        }

                        if ( condition ) {
                            if ( typeof data.data !== 'string' ) {
                                data.data = JSON.stringify( data.data );
                            }

                            ORMWorkflowStepsModel
                                .create( data )
                                .success( deferred.resolve )
                                .error( deferred.reject )
                        }
                    })
                    .fail( deferred.reject );
            }

            return deferred.promise;
        },

        updateWorkflowStep: function( id, data ) {
            var deferred = Q.defer()
                , service = this;

            if ( !data.id || !data.WorkflowId || !data.position ) {

                deferred.resolve( { statuscode: 400, message: 'bad request' } );

            } else if ( data.id !== id ) {

                deferred.resolve( { statuscode: 403, message: 'invalid' } );

            } else {

                service
                    .list( data.WorkflowId )
                    .then( function( steps ) {

                        if ( !!steps && !!steps.length ){
                            steps.forEach( function( step ) {
                                if ( step.position === data.position && step.id !== id ) {
                                    deferred.resolve( { statuscode: 403, message: 'invalid' } );
                                    return;
                                }
                            })
                        }

                        if ( !!data.data && typeof data.data !== 'string' ) {
                            data.data = JSON.stringify( data.data );
                        }

                        service
                            .getByIds( id, data.WorkflowId )
                            .then( function( workflowStep ) {

                                if ( !!workflowStep.statuscode ) {
                                    deferred.resolve( workflowStep );
                                } else {

                                    workflowStep
                                        .updateAttributes( data )
                                        .success( deferred.resolve )
                                        .error( deferred.reject );
                                }
                            })
                            .fail( deferred.reject );
                    })
                    .fail( deferred.reject );
            }

            return deferred.promise;
        },

        removeWorkflowStep: function( workflowStepId, workflowId ) {
            var deferred = Q.defer()
              , service = this;

            service
                .getByIds( workflowStepId, workflowId )
                .then( function( workflowStep ) {

                    if ( !!workflowStep.statuscode ) {
                        deferred.resolve( workflowStep );
                    } else {

                        workflowStep
                            .destroy()
                            .success( function() {
                                deferred.resolve( { statuscode: 200, message: 'ok' } );
                            })
                            .error( deferred.reject );
                    }
                })
                .fail( deferred.reject );

            return deferred.promise;
        },

        reorder: function ( steps, workflowId ) {
            var deferred = Q.defer()
              , chainer = new Sequelize.Utils.QueryChainer();

            for ( var i = 0; i < steps.length; i++ ) {
                chainer.add( ORMWorkflowStepsModel.update( { position: steps[i].position }, { id: steps[i].id, WorkflowId: workflowId } ) );
            }

            chainer
                .run()
                .success( function () {
                    deferred.resolve( { statuscode: 200, message: 'ok' } );
                } )
                .error( deferred.reject );

            return deferred.promise;
        }

    } );

    WorkflowStepsService.instance = new WorkflowStepsService( sequelize );
    WorkflowStepsService.Model = ORMWorkflowStepsModel;

    return WorkflowStepsService.instance;
};