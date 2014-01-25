var expect = require ( 'chai' ).expect
  , path = require( 'path' )
  , app = require ( path.resolve( __dirname + '/../../../../' ) + '/index.js' )
  , testEnv = require ( 'utils' ).testEnv()
  , Q = require ( 'q' )
  , config = require( 'config' )[ 'clever-workflow' ][ 'WorkflowModel' ];

var workFlId_1, workFlId_2, tmplWorkflowId, accountId = 1;

describe( 'service.WorkflowService', function () {
    var Service, Model, WorkflowStepsModel;

    before( function ( done ) {
        testEnv( function ( _WorkflowService_, _ORMWorkflowModel_, _ORMWorkflowStepsModel_ ) {

            Service = _WorkflowService_;
            Model = _ORMWorkflowModel_;
            WorkflowStepsModel = _ORMWorkflowStepsModel_;

            done();
        }, done );
    } );

    describe( '.createWorkflow( data )', function () {

        it( 'should be able to create new workflow', function ( done ) {

            var data = {
                name: 'Test Workflow',
                type: config.default.type.values[0],
                active: true,
                defaultWorkflow: true,
                swfDomain: 'domain',
                swfVersion: 2,
                swfRegistrationCompleted: false,
                swfRegistrationAttempts: 1,
                templateWorkflowId: 1,
                isEditable: true,
                UserId: 1,
                AccountId: accountId
            };

            Service
                .createWorkflow( data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.be.ok;

                    Model
                        .find( result.id )
                        .success( function( workflow ) {

                            workflow = workflow.toJSON();

                            expect( workflow ).to.be.an( 'object' ).and.be.ok;
                            expect( workflow ).to.contain.keys( 'UserId', 'AccountId' );
                            expect( workflow ).to.have.property( 'id' ).and.equal( result.id );
                            expect( workflow ).to.have.property( 'name' ).and.equal( data.name );
                            expect( workflow ).to.have.property( 'type' ).and.equal( data.type );
                            expect( workflow ).to.have.property( 'active' ).and.equal( data.active );
                            expect( workflow ).to.have.property( 'defaultWorkflow' ).and.equal( data.defaultWorkflow );
                            expect( workflow ).to.have.property( 'swfDomain' ).and.equal( data.swfDomain );
                            expect( workflow ).to.have.property( 'swfVersion' ).and.equal( data.swfVersion );
                            expect( workflow ).to.have.property( 'swfRegistrationCompleted' ).and.equal( data.swfRegistrationCompleted );
                            expect( workflow ).to.have.property( 'swfRegistrationAttempts' ).and.equal( data.swfRegistrationAttempts );
                            expect( workflow ).to.have.property( 'templateWorkflowId' ).and.equal( data.templateWorkflowId );
                            expect( workflow ).to.have.property( 'isEditable' ).and.equal( data.isEditable );
                            expect( workflow ).to.have.property( 'UserId' ).and.equal( data.UserId );
                            expect( workflow ).to.have.property( 'AccountId' ).and.equal( data.AccountId );

                            tmplWorkflowId = workflow.id;

                            done();
                        })
                        .error( done )

                }, done );

        } );

    } );

    describe( '.processCreationWorkflow( data )', function () {

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
                promise.push( WorkflowStepsModel.create( st ) );
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

        it( 'should be able to create new workflow without workflow steps', function ( done ) {

            var data = {
                name: 'Test Workflow',
                type: config.default.type.values[0],
                active: true,
                defaultWorkflow: true,
                swfDomain: 'domain',
                swfVersion: 2,
                swfRegistrationCompleted: false,
                swfRegistrationAttempts: 1,
                isEditable: false,
                UserId: 1,
                AccountId: accountId
            };

            Service
                .processCreationWorkflow( data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.be.ok;

                    workFlId_1 = result.id;

                    Model
                        .find( result.id )
                        .success( function( workflow ) {

                            workflow = workflow.toJSON();

                            expect( workflow ).to.be.an( 'object' ).and.be.ok;
                            expect( workflow ).to.contain.keys( 'UserId', 'AccountId' );
                            expect( workflow ).to.have.property( 'id' ).and.equal( workFlId_1 );
                            expect( workflow ).to.have.property( 'name' ).and.equal( data.name );
                            expect( workflow ).to.have.property( 'type' ).and.equal( data.type );
                            expect( workflow ).to.have.property( 'active' ).and.equal( data.active );
                            expect( workflow ).to.have.property( 'defaultWorkflow' ).and.equal( data.defaultWorkflow );
                            expect( workflow ).to.have.property( 'swfDomain' ).and.equal( data.swfDomain );
                            expect( workflow ).to.have.property( 'swfVersion' ).and.equal( data.swfVersion );
                            expect( workflow ).to.have.property( 'swfRegistrationCompleted' ).and.equal( data.swfRegistrationCompleted );
                            expect( workflow ).to.have.property( 'swfRegistrationAttempts' ).and.equal( data.swfRegistrationAttempts );
                            expect( workflow ).to.have.property( 'templateWorkflowId' ).and.equal( 0 );
                            expect( workflow ).to.have.property( 'isEditable' ).and.equal( data.isEditable );
                            expect( workflow ).to.have.property( 'UserId' ).and.equal( data.UserId );
                            expect( workflow ).to.have.property( 'AccountId' ).and.equal( data.AccountId );

                            WorkflowStepsModel
                                .findAll( { where: { WorkflowId: workFlId_1 } } )
                                .success( function( result ) {

                                    expect( result ).to.be.an( 'array' ).and.be.empty;

                                    done();

                                })
                                .error( done );
                        })
                        .error( done )
                }, done );

        } );

        it( 'should be able to create new workflow with workflow steps', function ( done ) {

            var data = {
                name: 'Test Workflow #1',
                type: config.default.type.values[0],
                active: true,
                defaultWorkflow: true,
                swfDomain: 'domain',
                swfVersion: 2,
                swfRegistrationCompleted: false,
                swfRegistrationAttempts: 1,
                isEditable: false,
                UserId: 1,
                AccountId: accountId,

                templateWorkflowId: tmplWorkflowId
            };

            Service
                .processCreationWorkflow( data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.be.ok;

                    Model
                        .find( result.id )
                        .success( function( workflow ) {

                            workflow = workflow.toJSON();

                            expect( workflow ).to.be.an( 'object' ).and.be.ok;
                            expect( workflow ).to.contain.keys( 'UserId', 'AccountId' );
                            expect( workflow ).to.have.property( 'id' ).and.equal( result.id );
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

                            workFlId_2 = workflow.id;

                            WorkflowStepsModel
                                .findAll( { where: { WorkflowId: workflow.id } } )
                                .success( function( result ) {

                                    expect( result ).to.be.an( 'array' ).and.not.be.empty;
                                    expect( result ).to.have.length( 3 );

                                    result.forEach( function( res ) {

                                        expect( res ).to.be.an( 'object' ).and.be.ok;
                                        expect( res ).to.have.property( 'id' ).and.be.ok;

                                    });

                                    done();
                                })
                                .error( done );
                        })
                        .error( done );
                }, done );

        } );

    } );

    describe( '.list( accId )', function () {

        it( 'should be able to get list of workflows for accountId', function ( done ) {

            Service
                .list( accountId )
                .then( function( result ) {

                    expect( result ).to.be.an( 'array' ).and.not.be.empty;
                    expect( result ).to.have.length.above( 0 );

                    result.forEach( function( res ) {

                        expect( res ).to.be.an( 'object' ).and.be.ok;
                        expect( res ).to.have.property( 'id' ).and.be.ok;

                        res = res.toJSON();

                        expect( res ).to.have.property( 'AccountId' ).and.equal( accountId );

                    });

                    done();
                }, done );

        } );

        it( 'should be able to get empty array if workflow with such id do not exist', function ( done ) {

            Service
                .list( 1515151515 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'array' ).and.be.empty;

                    done();
                }, done );

        } );

    } );

    describe( '.getWorkflowByIds( accId, wflId )', function () {

        it( 'should be able to get workflow by id for accountId', function ( done ) {

            Service
                .getWorkflowByIds( accountId, workFlId_1 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' ).and.not.be.empty;
                    expect( result ).to.have.property( 'id' ).and.equal( workFlId_1 );
                    expect( result.toJSON() ).to.have.property( 'AccountId' ).and.equal( accountId );

                    done();
                }, done );

        } );

        it( 'should be able to get the error if the workflow does not exist', function ( done ) {

            Service
                .getWorkflowByIds( accountId, 151515151515 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done );

        } );

        it( 'should be able to get the error if the workflow exist but have another AccountId', function ( done ) {

            Service
                .getWorkflowByIds( accountId + 1, workFlId_1 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done );

        } );

    } );

    describe( '.updateWorkflow( accId, wflId, data )', function () {

        it( 'should be able to get the error if the workflow does not exist', function ( done ) {

            var data = {
                name: 'Test Workflow',
                type: config.default.type.values[1],
                active: false,
                isEditable: false
            };

            Service
                .getWorkflowByIds( accountId, 151515151515, data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done );

        } );

        it( 'should be able to update workflow', function ( done ) {

            var data = {
                name: 'Test Workflow updated',
                type: config.default.type.values[1],
                active: false,
                isEditable: false
            };

            Service
                .updateWorkflow( accountId, tmplWorkflowId, data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' ).and.not.be.empty;
                    expect( result ).to.have.property( 'id' ).and.equal( tmplWorkflowId );

                    Model
                        .find( tmplWorkflowId )
                        .success( function( workflow ) {

                            workflow = workflow.toJSON();

                            expect( workflow ).to.be.an( 'object' ).and.be.ok;
                            expect( workflow ).to.contain.keys( 'UserId', 'AccountId' );
                            expect( workflow ).to.have.property( 'id' ).and.equal( tmplWorkflowId );
                            expect( workflow ).to.have.property( 'name' ).and.equal( data.name );
                            expect( workflow ).to.have.property( 'type' ).and.equal( data.type );
                            expect( workflow ).to.have.property( 'active' ).and.equal( data.active );
                            expect( workflow ).to.have.property( 'defaultWorkflow' ).and.equal( true );
                            expect( workflow ).to.have.property( 'swfDomain' ).and.equal( 'domain' );
                            expect( workflow ).to.have.property( 'isEditable' ).and.equal( data.isEditable );
                            expect( workflow ).to.have.property( 'UserId' ).and.equal( 1 );
                            expect( workflow ).to.have.property( 'AccountId' ).and.equal( accountId );

                            done();
                        })
                        .error( done )
                }, done );
        } );

        it( 'should be able to get the error if the workflow is not editable', function ( done ) {

            var data = {
                name: 'Test Workflow',
                type: config.default.type.values[1],
                active: false,
                isEditable: false
            };

            Service
                .updateWorkflow( accountId, tmplWorkflowId, data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done );

        } );

    } );

    describe( '.processRemoveWorkflow( accId, wflId )', function () {

        it( 'should be able to get the error if the workflow does not exist', function ( done ) {

            Service
                .processRemoveWorkflow( accountId, 151515151515 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;



                    done();
                }, done );

        } );

        it( 'should be able to get the error if the workflow does not belong to account', function ( done ) {

            Service
                .processRemoveWorkflow( accountId + 1, workFlId_2 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    Model
                        .find( workFlId_2 )
                        .success( function( workflow ) {

                            workflow = workflow.toJSON();

                            expect( workflow ).to.be.an( 'object' ).and.be.ok;
                            expect( workflow ).to.have.property( 'id' ).and.equal( workFlId_2 );
                            expect( workflow ).to.have.property( 'AccountId' ).and.equal( accountId );
                            expect( workflow ).to.have.property( 'deletedAt' ).and.not.be.ok;

                            WorkflowStepsModel
                                .findAll( { where: { WorkflowId: workFlId_2 } } )
                                .success( function( result ) {

                                    expect( result ).to.be.an( 'array' ).and.not.be.empty;
                                    expect( result ).to.have.length( 3 );

                                    result.forEach( function( res ) {

                                        expect( res ).to.be.an( 'object' ).and.be.ok;
                                        expect( res ).to.have.property( 'id' ).and.be.ok;
                                        expect( res ).to.have.property( 'deletedAt' ).and.not.be.ok;

                                    });

                                    done();
                                })
                                .error( done );
                        })
                        .error( done )

                }, done );

        } );

        it( 'should be able to delete existing workflow with workflow steps', function ( done ) {

            Service
                .processRemoveWorkflow( accountId, workFlId_2 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 200 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    Model
                        .find( workFlId_2 )
                        .success( function( workflow ) {

                            expect( workflow ).to.not.be.ok;

                            WorkflowStepsModel
                                .findAll( { where: { WorkflowId: workFlId_2 } } )
                                .success( function( result ) {

                                    expect( result ).to.be.an( 'array' ).and.be.empty;

                                    done();
                                })
                                .error( done );
                        })
                        .error( done )
                }, done );

        } );

    } );
} );