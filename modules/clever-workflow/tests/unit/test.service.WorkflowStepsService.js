var expect = require ( 'chai' ).expect
  , path = require( 'path' )
  , app = require ( path.resolve( __dirname + '/../../../../' ) + '/index.js' )
  , config = require( 'config' )[ 'clever-workflow' ][ 'WorkflowStepsModel' ]
  , testEnv = require ( 'utils' ).testEnv()
  , Q = require ( 'q' );

var workflowId = 1000, workflowStepId, workflowStepId_1, workflowStepId_2;

describe( 'service.WorkflowStepService', function () {
    var Service, Model;

    before( function ( done ) {
        testEnv( function ( _WorkflowStepsService_, _ORMWorkflowStepsModel_ ) {

            Service = _WorkflowStepsService_;
            Model = _ORMWorkflowStepsModel_;

            done();

        }, done );
    } );

    describe( '.processCreationWorkflowStep( data )', function () {

        it( 'should be able to create new workflow step', function ( done ) {

            var data = {
                name: 'some step #1',
                statusType: config.default.statusType.values[0],
                data: {
                    field_1: 'some field 1',
                    field_2: 'some field 2'
                },
                swfVersion: 2,
                swfRegistrationCompleted: true,
                swfRegistrationAttempts: 1,
                position: 1,
                WorkflowId: workflowId
            };

            Service
                .processCreationWorkflowStep( data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.be.ok;

                    workflowStepId = result.id;

                    Model
                        .find( result.id )
                        .success( function( workflowStep ) {

                            workflowStep = workflowStep.toJSON();

                            expect( workflowStep ).to.be.an( 'object' ).and.be.ok;
                            expect( workflowStep ).to.contain.keys( 'WorkflowId' );
                            expect( workflowStep ).to.have.property( 'id' ).and.equal( result.id );
                            expect( workflowStep ).to.have.property( 'name' ).and.equal( data.name );
                            expect( workflowStep ).to.have.property( 'statusType' ).and.equal( data.statusType );
                            expect( workflowStep ).to.have.property( 'data' ).and.be.ok;
                            expect( workflowStep ).to.have.property( 'swfVersion' ).and.equal( data.swfVersion );
                            expect( workflowStep ).to.have.property( 'swfRegistrationCompleted' ).and.equal( data.swfRegistrationCompleted );
                            expect( workflowStep ).to.have.property( 'swfRegistrationAttempts' ).and.equal( data.swfRegistrationAttempts );
                            expect( workflowStep ).to.have.property( 'position' ).and.equal( data.position );
                            expect( workflowStep ).to.have.property( 'WorkflowId' ).and.equal( data.WorkflowId );

                            done();
                        })
                        .error( done )
                }, done );
        } );

        it( 'should be able to get the error if the workflow step with such position already exist', function ( done ) {

            var data = {
                name: 'some step #2',
                statusType: config.default.statusType.values[0],
                data: {
                    field_1: 'some field 1',
                    field_2: 'some field 2'
                },
                swfVersion: 2,
                swfRegistrationCompleted: true,
                swfRegistrationAttempts: 1,
                position: 1,
                WorkflowId: workflowId
            };

            Service
                .processCreationWorkflowStep( data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done );
        } );

        it( 'should be able to get the error if insufficient WorkflowId', function ( done ) {

            var data = {
                name: 'some step #3',
                statusType: config.default.statusType.values[0],
                data: {
                    field_1: 'some field 1',
                    field_2: 'some field 2'
                },
                swfVersion: 2,
                swfRegistrationCompleted: true,
                swfRegistrationAttempts: 1,
                position: 1,
                WorkflowId: null
            };

            Service
                .processCreationWorkflowStep( data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 400 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done );
        } );

        it( 'should be able to get the error if insufficient position', function ( done ) {

            var data = {
                name: 'some step #4',
                statusType: config.default.statusType.values[0],
                data: {
                    field_1: 'some field 1',
                    field_2: 'some field 2'
                },
                swfVersion: 2,
                swfRegistrationCompleted: true,
                swfRegistrationAttempts: 1,
                position: null,
                WorkflowId: 1000
            };

            Service
                .processCreationWorkflowStep( data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 400 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done );
        } );

        it( 'should be able to create new workflow step', function ( done ) {

            var data = {
                name: 'some step #1',
                statusType: config.default.statusType.values[0],
                data: {
                    field_1: 'some field 1',
                    field_2: 'some field 2'
                },
                swfVersion: 2,
                swfRegistrationCompleted: true,
                swfRegistrationAttempts: 1,
                position: 1,
                WorkflowId: workflowId + 1
            };

            Service
                .processCreationWorkflowStep( data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.be.ok;

                    workflowStepId_1 = result.id;

                    Model
                        .find( result.id )
                        .success( function( workflowStep ) {

                            workflowStep = workflowStep.toJSON();

                            expect( workflowStep ).to.be.an( 'object' ).and.be.ok;
                            expect( workflowStep ).to.contain.keys( 'WorkflowId' );
                            expect( workflowStep ).to.have.property( 'id' ).and.equal( result.id );
                            expect( workflowStep ).to.have.property( 'name' ).and.equal( data.name );
                            expect( workflowStep ).to.have.property( 'statusType' ).and.equal( data.statusType );
                            expect( workflowStep ).to.have.property( 'data' ).and.be.ok;
                            expect( workflowStep ).to.have.property( 'swfVersion' ).and.equal( data.swfVersion );
                            expect( workflowStep ).to.have.property( 'swfRegistrationCompleted' ).and.equal( data.swfRegistrationCompleted );
                            expect( workflowStep ).to.have.property( 'swfRegistrationAttempts' ).and.equal( data.swfRegistrationAttempts );
                            expect( workflowStep ).to.have.property( 'position' ).and.equal( data.position );
                            expect( workflowStep ).to.have.property( 'WorkflowId' ).and.equal( data.WorkflowId );

                            done();
                        })
                        .error( done )
                }, done );
        } );

    } );

    describe( '.getByIds( workflowStepId, workflowId )', function () {

        it( 'should be able to find worflow step by ids', function ( done ) {

            Service
                .getByIds( workflowStepId, workflowId )
                .then( function( result ) {

                    result = result.toJSON();

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.equal( workflowStepId );
                    expect( result ).to.have.property( 'WorkflowId' ).and.equal( workflowId );

                    done();
                }, done );
        } );

        it( 'should be able to get the error if workflow step do not exist', function ( done ) {

            Service
                .getByIds( workflowStepId + 10000, workflowId )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done );
        } );

        it( 'should be able to get the error if the workflow step exist but have another WorkflowId', function ( done ) {

            Service
                .getByIds( workflowStepId, workflowId + 1 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done );
        } );

    } );

    describe( '.list( workflowId )', function () {

        before( function( done ) {

            var data = {
                name: 'some step #2',
                statusType: config.default.statusType.values[0],
                data: {
                    field_1: 'some field 1',
                    field_2: 'some field 2'
                },
                swfVersion: 2,
                swfRegistrationCompleted: true,
                swfRegistrationAttempts: 1,
                position: 2,
                WorkflowId: workflowId
            };

            Service
                .processCreationWorkflowStep( data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.be.ok;

                    workflowStepId_2 = result.id;

                    done();
                }, done );

        });

        it( 'should be able to find all worflow steps by workflowId', function ( done ) {

            Service
                .list( workflowId )
                .then( function( result ) {

                    expect( result ).to.be.an( 'array' ).and.be.ok;
                    expect( result ).to.have.length( 2 );

                    expect( result[0] ).to.be.an( 'object' ).and.be.ok;
                    expect( result[0] ).to.have.property( 'id' ).and.be.ok;
                    expect( result[0].toJSON() ).to.have.property( 'WorkflowId' ).and.equal( workflowId );

                    expect( result[1] ).to.be.an( 'object' ).and.be.ok;
                    expect( result[1] ).to.have.property( 'id' ).and.be.ok;
                    expect( result[1].toJSON() ).to.have.property( 'WorkflowId' ).and.equal( workflowId );

                    done();
                }, done );
        } );

        it( 'should be able to find all worflow steps by workflowId', function ( done ) {

            Service
                .list( workflowId + 1 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'array' ).and.be.ok;
                    expect( result ).to.have.length( 1 );

                    expect( result[0] ).to.be.an( 'object' ).and.be.ok;
                    expect( result[0] ).to.have.property( 'id' ).and.be.ok;
                    expect( result[0].toJSON() ).to.have.property( 'WorkflowId' ).and.equal( workflowId + 1 );

                    done();
                }, done );
        } );

        it( 'should be able to get the error if insufficient WorkflowId', function ( done ) {

            Service
                .list( 0 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 400 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done );
        } );

    } );

    describe( '.updateWorkflowStep( id, data )', function () {

        it( 'should be able to get the error if insufficient id', function ( done ) {

            var data = {
                name: 'some step #3',
                statusType: config.default.statusType.values[0],
                data: {
                    field_1: 'some field 1',
                    field_2: 'some field 2'
                },
                swfVersion: 2,
                swfRegistrationCompleted: true,
                swfRegistrationAttempts: 1,
                position: 1,
                WorkflowId: 1
            };

            Service
                .updateWorkflowStep( workflowStepId, data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 400 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done );
        } );

        it( 'should be able to get the error if insufficient WorkflowId', function ( done ) {

            var data = {
                id: workflowStepId,
                name: 'some step #3',
                statusType: config.default.statusType.values[0],
                data: {
                    field_1: 'some field 1',
                    field_2: 'some field 2'
                },
                swfVersion: 2,
                swfRegistrationCompleted: true,
                swfRegistrationAttempts: 1,
                position: 1,
                WorkflowId: null
            };

            Service
                .updateWorkflowStep( workflowStepId, data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 400 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done );
        } );

        it( 'should be able to get the error if insufficient position', function ( done ) {

            var data = {
                id: workflowStepId,
                name: 'some step #4',
                statusType: config.default.statusType.values[0],
                data: {
                    field_1: 'some field 1',
                    field_2: 'some field 2'
                },
                swfVersion: 2,
                swfRegistrationCompleted: true,
                swfRegistrationAttempts: 1,
                position: null,
                WorkflowId: 1000
            };

            Service
                .updateWorkflowStep( workflowStepId, data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 400 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done );
        } );

        it( 'should be able to get the error if do not match id', function ( done ) {

            var data = {
                id: workflowStepId + 1,
                name: 'some step #4',
                statusType: config.default.statusType.values[0],
                data: {
                    field_1: 'some field 1',
                    field_2: 'some field 2'
                },
                swfVersion: 2,
                swfRegistrationCompleted: true,
                swfRegistrationAttempts: 1,
                position: 1,
                WorkflowId: 1000
            };

            Service
                .updateWorkflowStep( workflowStepId, data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done );
        } );

        it( 'should be able to update existing workflow step', function ( done ) {

            var data = {
                id: workflowStepId,
                name: 'some step #1 updated',
                statusType: config.default.statusType.values[1],
                data: {
                    field_1: 'some field 1',
                    field_2: 'some field 2'
                },
                position: 1,
                WorkflowId: workflowId
            };

            Service
                .updateWorkflowStep( workflowStepId, data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).equal( workflowStepId );

                    Model
                        .find( workflowStepId )
                        .success( function( workflowStep ) {

                            workflowStep = workflowStep.toJSON();

                            expect( workflowStep ).to.be.an( 'object' ).and.be.ok;
                            expect( workflowStep ).to.contain.keys( 'WorkflowId' );
                            expect( workflowStep ).to.have.property( 'id' ).and.equal( result.id );
                            expect( workflowStep ).to.have.property( 'name' ).and.equal( data.name );
                            expect( workflowStep ).to.have.property( 'statusType' ).and.equal( data.statusType );
                            expect( workflowStep ).to.have.property( 'data' ).and.be.ok;
                            expect( workflowStep ).to.have.property( 'swfVersion' ).and.equal( 2 );
                            expect( workflowStep ).to.have.property( 'swfRegistrationCompleted' ).and.equal( true );
                            expect( workflowStep ).to.have.property( 'swfRegistrationAttempts' ).and.equal( 1 );
                            expect( workflowStep ).to.have.property( 'position' ).and.equal( data.position );
                            expect( workflowStep ).to.have.property( 'WorkflowId' ).and.equal( data.WorkflowId );

                            done();
                        })
                        .error( done )
                }, done );
        } );

        it( 'should be able to get the error if step with such WorkflowId and position already exist', function ( done ) {

            var data = {
                id: workflowStepId_1,
                name: 'some step #4',
                statusType: config.default.statusType.values[0],
                data: {
                    field_1: 'some field 1',
                    field_2: 'some field 2'
                },
                swfVersion: 2,
                swfRegistrationCompleted: true,
                swfRegistrationAttempts: 1,
                position: 1,
                WorkflowId: workflowId
            };

            Service
                .updateWorkflowStep( workflowStepId_1, data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done );
        } );

    } );

    describe( '.reorder( steps, workflowId )', function () {

        it( 'should be able to reorder worflow steps', function ( done ) {

            var steps = [
                {
                    id: workflowStepId,
                    position: 5
                },
                {
                    id: workflowStepId_2,
                    position: 6
                }
            ];

            Service
                .reorder( steps, workflowId )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 200 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    Model
                        .find( workflowStepId )
                        .success( function( step_1 ) {

                            expect( step_1 ).to.be.an( 'object' ).and.be.ok;
                            expect( step_1 ).to.have.property( 'id' ).equal( workflowStepId );
                            expect( step_1 ).to.have.property( 'position' ).equal( steps[0].position );

                            Model
                                .find( workflowStepId_2 )
                                .success( function( step_2 ) {

                                    expect( step_2 ).to.be.an( 'object' ).and.be.ok;
                                    expect( step_2 ).to.have.property( 'id' ).equal( workflowStepId_2 );
                                    expect( step_2 ).to.have.property( 'position' ).equal( steps[1].position );

                                    done();
                                })
                                .error( done )
                        })
                        .error( done )
                }, done );
        } );
    } );

    describe( '.removeWorkflowStep( workflowStepId, workflowId )', function () {

        it( 'should be able to get the error if workflow step do not exist', function ( done ) {

            Service
                .removeWorkflowStep( workflowStepId + 10000, workflowId )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done );
        } );

        it( 'should be able to get the error if the workflow step exist but have another WorkflowId', function ( done ) {

            Service
                .removeWorkflowStep( workflowStepId, workflowId + 1 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done );
        } );

        it( 'should be able to delete worflow step', function ( done ) {

            Service
                .removeWorkflowStep( workflowStepId, workflowId )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 200 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    Model
                        .find( workflowStepId )
                        .success( function( step ) {

                            expect( step ).to.not.be.ok;

                            done();
                        })
                        .error( done )
                }, done );
        } );

    } );

} );