// Bootstrap the testing environmen
var testEnv = require( 'utils' ).testEnv();

var expect = require( 'chai' ).expect
  , Q = require ( 'q' )
  , config = require( 'config' )[ 'clever-workflow' ][ 'WorkflowModel' ]
  , Service;

var tmplWorkflowId = 1000
  , accountId = 1
  , userId = 1000
  , workFlId_1, workFlId_2;

describe( 'controllers.WorkflowController', function () {
    var ctrl, Service, StepService;

    before( function ( done ) {
        testEnv( function ( WorkflowController, WorkflowService, WorkflowStepsService ) {
            var req = {
                params: { action: 'fakeAction'},
                method: 'GET',
                query: {}
            };

            var res = {
                json: function () {}
            };

            var next = function () {};

            ctrl = new WorkflowController( req, res, next );

            Service = WorkflowService;

            StepService = WorkflowStepsService;

            done();
        } );
    } );

    describe( '.postAction()', function () {

        before( function( done ) {

            var step = [
                {
                    name: "Step #1",
                    statusType: "Active",
                    position: 1,
                    WorkflowId: tmplWorkflowId
                },
                {
                    name: "Step #2",
                    statusType: "Active",
                    position: 1,
                    WorkflowId: tmplWorkflowId
                },
                {
                    name: "Step #3",
                    statusType: "Active",
                    position: 1,
                    WorkflowId: tmplWorkflowId
                }
            ];

            var promise = [];

            step.forEach( function( st ) {
                promise.push( StepService.create( st ) );
            });

            Q.all( promise )
                .then( function( result ) {

                    expect( result ).to.be.an( 'array' ).and.not.be.empty;
                    expect( result ).to.have.length( step.length );

                    result.forEach( function( res ) {

                        expect( res ).to.be.an( 'object' ).and.be.ok;
                        expect( res ).to.have.property( 'id' ).and.be.ok;

                    });

                    done();

                }, done );
        });

        it( 'should be able to create new workflow without workflow steps for it', function ( done ) {

            var data = {
                name: 'Test Workflow',
                type: config.default.type.values[0],
                active: true,
                defaultWorkflow: true,
                swfDomain: 'domain',
                swfVersion: 2,
                swfRegistrationCompleted: false,
                swfRegistrationAttempts: 1,
                isEditable: true,

                templateWorkflowId: null
            };


            ctrl.send = function ( workflow, status ) {

                expect( status ).to.equal( 200 );

                expect( workflow ).to.be.an( 'object' ).and.be.ok;
                expect( workflow ).to.have.property( 'id' ).and.be.ok;

                workFlId_1 = workflow.id;

                Service
                    .findById( workflow.id )
                    .then( function( workfl ) {

                        workfl = workfl.toJSON();

                        expect( workfl ).to.be.an( 'object' ).and.be.ok;
                        expect( workfl ).to.have.property( 'id' ).and.equal( workflow.id );
                        expect( workfl ).to.have.property( 'name' ).and.equal( data.name );
                        expect( workfl ).to.have.property( 'type' ).and.equal( data.type );
                        expect( workfl ).to.have.property( 'active' ).and.equal( data.active );
                        expect( workfl ).to.have.property( 'defaultWorkflow' ).and.equal( data.defaultWorkflow );
                        expect( workfl ).to.have.property( 'swfDomain' ).and.equal( data.swfDomain );
                        expect( workfl ).to.have.property( 'swfVersion' ).and.equal( data.swfVersion );
                        expect( workfl ).to.have.property( 'swfRegistrationCompleted' ).and.equal( data.swfRegistrationCompleted );
                        expect( workfl ).to.have.property( 'swfRegistrationAttempts' ).and.equal( data.swfRegistrationAttempts );
                        expect( workfl ).to.have.property( 'templateWorkflowId' ).and.equal( data.templateWorkflowId );
                        expect( workfl ).to.have.property( 'isEditable' ).and.equal( data.isEditable );
                        expect( workfl ).to.contain.keys( 'UserId', 'AccountId' );
                        expect( workfl ).to.have.property( 'UserId' ).and.equal( userId );
                        expect( workfl ).to.have.property( 'AccountId' ).and.equal( 1 );

                        done();

                    }, done );
            };

            ctrl.req.body = data;

            ctrl.req.user = {
                id: userId,
                account: {
                    id:1
                }
            };
            ctrl.postAction();
        } );

        it( 'should be able to create new workflow with workflow steps for it', function ( done ) {

            var data = {
                name: 'Test Workflow #2',
                type: config.default.type.values[0],
                active: true,
                defaultWorkflow: true,
                swfDomain: 'domain',
                swfVersion: 2,
                swfRegistrationCompleted: false,
                swfRegistrationAttempts: 1,
                isEditable: false,

                templateWorkflowId: tmplWorkflowId
            };


            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 200 );

                expect( data ).to.be.an( 'object' ).and.be.ok;
                expect( data ).to.have.property( 'id' ).and.be.ok;

                workFlId_2 = data.id;

                Service
                    .findById( data.id )
                    .then( function( workflow ) {

                        workflow = workflow.toJSON();

                        expect( workflow ).to.be.an( 'object' ).and.be.ok;
                        expect( workflow ).to.contain.keys( 'UserId', 'AccountId' );
                        expect( workflow ).to.have.property( 'id' ).and.equal( workFlId_2 );
                        expect( workflow ).to.have.property( 'name' ).and.equal( data.name );
                        expect( workflow ).to.have.property( 'type' ).and.equal( data.type );
                        expect( workflow ).to.have.property( 'active' ).and.equal( data.active );
                        expect( workflow ).to.have.property( 'defaultWorkflow' ).and.equal( data.defaultWorkflow );
                        expect( workflow ).to.have.property( 'swfDomain' ).and.equal( data.swfDomain );
                        expect( workflow ).to.have.property( 'swfVersion' ).and.equal( data.swfVersion );
                        expect( workflow ).to.have.property( 'swfRegistrationCompleted' ).and.equal( data.swfRegistrationCompleted );
                        expect( workflow ).to.have.property( 'swfRegistrationAttempts' ).and.equal( data.swfRegistrationAttempts );
                        expect( workflow ).to.have.property( 'templateWorkflowId' ).and.equal( tmplWorkflowId );
                        expect( workflow ).to.have.property( 'isEditable' ).and.equal( data.isEditable );
                        expect( workflow ).to.have.property( 'UserId' ).and.equal( data.UserId );
                        expect( workflow ).to.have.property( 'AccountId' ).and.equal( data.AccountId );

                        StepService
                            .find( { where: { WorkflowId: workflow.id } } )
                            .then( function( result ) {

                                expect( result ).to.be.an( 'array' ).and.not.be.empty;
                                expect( result ).to.have.length( 3 );

                                result.forEach( function( res ) {

                                    expect( res ).to.be.an( 'object' ).and.be.ok;
                                    expect( res ).to.have.property( 'id' ).and.be.ok;

                                });

                                done();
                            })
                            .fail( done );
                    })
                    .fail( done );
            };

            ctrl.req.body = data;

            ctrl.req.user = {
                id: userId,
                account: {
                    id:1
                }
            };
            ctrl.postAction();
        } );

    } );

    describe( '.listAction()', function () {

        it( 'should be able to get list of workflows for accountId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'array' ).and.not.be.empty;
                expect( result ).to.have.length.above( 0 );

                result.forEach( function( res ) {

                    res = res.toJSON();

                    expect( res ).to.be.an( 'object' ).and.be.ok;
                    expect( res ).to.have.property( 'id' ).and.be.ok;
                    expect( res ).to.have.property( 'AccountId' ).and.equal( accountId );
                });

                done();
            };

            ctrl.req.user = {
                id: userId,
                account: {
                    id:1
                }
            };

            ctrl.listAction();
        } );

        it( 'should be able to get empty array if workflow with such id do not exist', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'array' ).and.be.empty;

                done();
            };

            ctrl.req.user = {
                id: userId,
                account: {
                    id: 2
                }
            };

            ctrl.listAction();
        } );

    } );

    describe( '.getAction()', function () {

        it( 'should be able to get workflow by id for accountId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.not.be.empty;
                expect( result ).to.have.property( 'id' ).and.equal( workFlId_1 );
                expect( result.toJSON() ).to.have.property( 'AccountId' ).and.equal( accountId );

                done();
            };

            ctrl.req.params = { id: workFlId_1 };

            ctrl.req.user = {
                id: userId,
                account: {
                    id:1
                }
            };

            ctrl.getAction();
        } );

        it( 'should be able to get the error if the workflow does not exist', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: 1515151515 };

            ctrl.req.user = {
                id: userId,
                account: {
                    id:1
                }
            };

            ctrl.getAction();
        } );

        it( 'should be able to get the error if the workflow exist but have another AccountId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: workFlId_1 };

            ctrl.req.user = {
                id: 1,
                account: {
                    id:1000
                }
            };

            ctrl.getAction();
        } );

    } );

    describe( '.putAction()', function () {

        it( 'should be able to get the error if the workflow does not exist', function ( done ) {

            var data = {
                id: 1515151515,
                name: 'Test Workflow',
                type: config.default.type.values[1],
                active: false,
                isEditable: false
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: 1515151515 };

            ctrl.req.body = data;

            ctrl.req.user = {
                id: userId,
                account: {
                    id: 1
                }
            };

            ctrl.putAction();
        } );

        it( 'should be able to update the workflow', function ( done ) {

            var data = {
                id: workFlId_1,
                name: 'Test Workflow updated',
                type: config.default.type.values[1],
                active: false,
                isEditable: false
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.not.be.empty;
                expect( result ).to.have.property( 'id' ).and.equal( workFlId_1 );

                Service
                    .findById( workFlId_1 )
                    .then( function( workflow ) {

                        workflow = workflow.toJSON();

                        expect( workflow ).to.be.an( 'object' ).and.be.ok;
                        expect( workflow ).to.contain.keys( 'UserId', 'AccountId' );
                        expect( workflow ).to.have.property( 'id' ).and.equal( workFlId_1 );
                        expect( workflow ).to.have.property( 'name' ).and.equal( data.name );
                        expect( workflow ).to.have.property( 'type' ).and.equal( data.type );
                        expect( workflow ).to.have.property( 'active' ).and.equal( data.active );
                        expect( workflow ).to.have.property( 'defaultWorkflow' ).and.equal( true );
                        expect( workflow ).to.have.property( 'swfDomain' ).and.equal( 'domain' );
                        expect( workflow ).to.have.property( 'isEditable' ).and.equal( data.isEditable );
                        expect( workflow ).to.have.property( 'UserId' ).and.equal( userId );
                        expect( workflow ).to.have.property( 'AccountId' ).and.equal( accountId );

                        done();
                    })
                    .fail( done )
            };

            ctrl.req.params = { id: workFlId_1 };

            ctrl.req.body = data;

            ctrl.req.user = {
                id: userId,
                account: {
                    id: 1
                }
            };

            ctrl.putAction();
        } );

        it( 'should be able to get the error if the workflow ids do not same', function ( done ) {

            var data = {
                id: 154545845,
                name: 'Test Workflow',
                type: config.default.type.values[1],
                active: false,
                isEditable: false
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 400 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: 1515151515 };

            ctrl.req.body = data;

            ctrl.req.user = {
                id: userId,
                account: {
                    id: 1
                }
            };

            ctrl.putAction();
        } );

        it( 'should be able to get the error if the workflow is not editable', function ( done ) {

            var data = {
                id: workFlId_1,
                name: 'Test Workflow updated',
                type: config.default.type.values[1],
                active: false,
                isEditable: false
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: workFlId_1 };

            ctrl.req.body = data;

            ctrl.req.user = {
                id: userId,
                account: {
                    id: 1
                }
            };

            ctrl.putAction();
        } );

    } );

    describe( '.deleteAction()', function () {

        it( 'should be able to get the error if the workflow does not exist', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: 15151515515 };

            ctrl.req.user = {
                id: userId,
                account: {
                    id:1
                }
            };

            ctrl.deleteAction();
        } );

        it( 'should be able to get the error if the workflow does not belong to account', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: workFlId_1 };

            ctrl.req.user = {
                id: userId,
                account: {
                    id:12
                }
            };

            ctrl.deleteAction();
        } );

        it( 'should be able to delete existing workflow with workflow steps', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: workFlId_1 };

            ctrl.req.user = {
                id: userId,
                account: {
                    id:1
                }
            };

            ctrl.deleteAction();
        } );

    } );
} );