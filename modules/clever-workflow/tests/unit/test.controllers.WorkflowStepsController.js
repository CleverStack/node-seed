// Bootstrap the testing environmen
var testEnv = require( 'utils' ).testEnv();

var expect = require( 'chai' ).expect
  , Q = require ( 'q' )
  , config = require( 'config' )[ 'clever-workflow' ][ 'WorkflowStepsModel' ]
  , Service;

var workflowId = 1000, workflowStepId, workflowStepId_1, workflowStepId_2;

describe( 'controllers.WorkflowStepsController', function () {
    var ctrl;

    before( function ( done ) {
        testEnv( function ( WorkflowStepsController, WorkflowStepsService ) {
            var req = {
                params: { action: 'fakeAction'},
                method: 'GET',
                query: {}
            };

            var res = {
                json: function () {}
            };

            var next = function () {};

            ctrl = new WorkflowStepsController( req, res, next );

            Service = WorkflowStepsService;

            done();
        } );
    } );


    describe( '.postAction()', function () {

        it( 'should be able to create step', function ( done ) {

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
                position: 1
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );


                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.be.ok;

                workflowStepId = result.id;

                Service
                    .findById( result.id )
                    .then( function( workflowStep ) {

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
                        expect( workflowStep ).to.have.property( 'WorkflowId' ).and.equal( workflowId );

                        done();
                    })
                    .fail( done )
            };
            ctrl.req.body = data;

            ctrl.req.params.workflowId = workflowId;

            ctrl.postAction();
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
                position: 1
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };
            ctrl.req.body = data;

            ctrl.req.params.workflowId = workflowId;

            ctrl.postAction();
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
                position: 1
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 400 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };
            ctrl.req.body = data;

            ctrl.req.params.workflowId = null;

            ctrl.postAction();
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
                swfRegistrationAttempts: 1
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 400 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };
            ctrl.req.body = data;

            ctrl.req.params.workflowId = workflowId;

            ctrl.postAction();
        } );

        it( 'should be able to create step', function ( done ) {

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
                position: 1
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );


                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.be.ok;

                Service
                    .findById( result.id )
                    .then( function( workflowStep ) {

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
                        expect( workflowStep ).to.have.property( 'WorkflowId' ).and.equal( workflowId + 1 );

                        done();
                    })
                    .fail( done )
            };
            ctrl.req.body = data;

            ctrl.req.params.workflowId = workflowId + 1;

            ctrl.postAction();
        } );

    } );

    describe( '.listAction()', function () {

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

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'array' ).and.be.ok;
                expect( result ).to.have.length( 2 );

                expect( result[0] ).to.be.an( 'object' ).and.be.ok;
                expect( result[0] ).to.have.property( 'id' ).and.be.ok;
                expect( result[0].toJSON() ).to.have.property( 'WorkflowId' ).and.equal( workflowId );

                expect( result[1] ).to.be.an( 'object' ).and.be.ok;
                expect( result[1] ).to.have.property( 'id' ).and.be.ok;
                expect( result[1].toJSON() ).to.have.property( 'WorkflowId' ).and.equal( workflowId );

                done();
            };

            ctrl.req.params.workflowId = workflowId;

            ctrl.listAction();
        } );

        it( 'should be able to find all worflow steps by workflowId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'array' ).and.be.ok;
                expect( result ).to.have.length( 1 );

                expect( result[0] ).to.be.an( 'object' ).and.be.ok;
                expect( result[0] ).to.have.property( 'id' ).and.be.ok;
                expect( result[0].toJSON() ).to.have.property( 'WorkflowId' ).and.equal( workflowId + 1 );

                done();
            };

            ctrl.req.params.workflowId = workflowId + 1;

            ctrl.listAction();
        } );

        it( 'should be able to get the error if insufficient WorkflowId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 400 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params.workflowId = null;

            ctrl.listAction();
        } );

        it( 'should be able to get empty array if workflow step for such WorkflowId do not exist', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'array' ).and.be.empty;

                done();
            };

            ctrl.req.params.workflowId = 15151515;

            ctrl.listAction();
        } );

    } );

    describe( '.getAction()', function () {

        it( 'should be able to find worflow step by ids', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                result = result.toJSON();

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.equal( workflowStepId );
                expect( result ).to.have.property( 'WorkflowId' ).and.equal( workflowId );

                done();
            };

            ctrl.req.params = { id: workflowStepId, workflowId: workflowId };

            ctrl.getAction();
        } );

        it( 'should be able to get the error if workflow step do not exist', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: workflowStepId + 1000, workflowId: workflowId };

            ctrl.getAction();
        } );

        it( 'should be able to get the error if the workflow step exist but have another WorkflowId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: workflowStepId, workflowId: workflowId + 1 };

            ctrl.getAction();
        } );

    } );

    describe( '.putAction()', function () {

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
                position: 1
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 400 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };
            ctrl.req.body = data;

            ctrl.req.params = { id: workflowStepId, workflowId: workflowId };

            ctrl.putAction();
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
                position: 1
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 400 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };
            ctrl.req.body = data;

            ctrl.req.params = { id: workflowStepId };

            ctrl.putAction();
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
                swfRegistrationAttempts: 1
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 400 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };
            ctrl.req.body = data;

            ctrl.req.params = { id: workflowStepId, workflowId: workflowId };

            ctrl.putAction();
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
                position: 1
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };
            ctrl.req.body = data;

            ctrl.req.params = { id: workflowStepId, workflowId: workflowId };

            ctrl.putAction();
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
                position: 1
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).equal( workflowStepId );

                Service
                    .findById( workflowStepId )
                    .then( function( workflowStep ) {

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
                    .fail( done )
            };
            ctrl.req.body = data;

            ctrl.req.params = { id: workflowStepId, workflowId: workflowId };

            ctrl.putAction();
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
                position: 1
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: workflowStepId_1, workflowId: workflowId };

            ctrl.putAction();
        } );

    } );

    describe( '.reorderAction()', function () {

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

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                Service
                    .findById( workflowStepId )
                    .then( function( step_1 ) {

                        expect( step_1 ).to.be.an( 'object' ).and.be.ok;
                        expect( step_1 ).to.have.property( 'id' ).equal( workflowStepId );
                        expect( step_1 ).to.have.property( 'position' ).equal( steps[0].position );

                        Service
                            .findById( workflowStepId_2 )
                            .then( function( step_2 ) {

                                expect( step_2 ).to.be.an( 'object' ).and.be.ok;
                                expect( step_2 ).to.have.property( 'id' ).equal( workflowStepId_2 );
                                expect( step_2 ).to.have.property( 'position' ).equal( steps[1].position );

                                done();
                            })
                            .fail( done )
                    })
                    .fail( done )
            };

            ctrl.req.params = { workflowId: workflowId };

            ctrl.req.body = { steps: steps };

            ctrl.reorderAction();
        } );

    } );


    describe( '.deleteAction()', function () {

        it( 'should be able to get the error if workflow step do not exist', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: workflowStepId + 10000, workflowId: workflowId };

            ctrl.req.body = {};

            ctrl.deleteAction();
        } );

        it( 'should be able to get the error if the workflow step exist but have another WorkflowId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: workflowStepId, workflowId: workflowId + 1 };

            ctrl.deleteAction();
        } );

        it( 'should be able to delete worflow step', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                Service
                    .findById( workflowStepId )
                    .then( function( step ) {

                        expect( step ).to.not.be.ok;

                        done();
                    })
                    .fail( done )
            };

            ctrl.req.params = { id: workflowStepId, workflowId: workflowId };

            ctrl.deleteAction();
        } );

    } );

} );