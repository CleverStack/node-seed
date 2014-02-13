var expect = require ( 'chai' ).expect
  , sinon = require( 'sinon' )
  , testEnv = require ( 'utils' ).testEnv();

describe( 'service.SurveyService', function () {
    var Service, Model, SurveyQuestionModel;

    var survey_1, survey_1_Id;

    before( function ( done ) {
        testEnv( function ( _SurveyService_, _ORMSurveyModel_, _ORMSurveyQuestionModel_ ) {

            Service = _SurveyService_;
            Model = _ORMSurveyModel_;
            SurveyQuestionModel = _ORMSurveyQuestionModel_;

            done();
        }, done );
    } );

    describe( '.formatData( data, operation )', function () {

        it( 'should return an object with filtered data for not create operation', function ( done ) {

            var data = {
                id: 4,
                title: 'Customer Satisfaction',
                description: 'Customer satisfaction survey',
                pointsPossible: 100,
                surveyQuestions: [
                    {
                        title: 'Your name',
                        placeholder: 'enter your name here ...',
                        fieldType: 'text',
                        orderNum: 1,
                        points: 20
                    },
                    {
                        title: 'How long have you used our products/service?',
                        value: [ 'Less than 6 months', '1 year to less than 3 years', '3 years to less than 5 years', '5 years or more' ],
                        fieldType: 'radio',
                        isMultiple: false,
                        orderNum: 2,
                        points: 20
                    },
                    {
                        title: 'Which of our products/services do you use?',
                        value: [ 'Product_1', 'Product_2', 'Product_3', 'Product_4', 'Other' ],
                        fieldType: 'checkbox',
                        isMultiple: true,
                        orderNum: 3,
                        points: 20
                    },
                    {
                        title: 'How frequently do you purchase from us?',
                        value: [ 'Every day', 'Every week', 'Every month', 'Once or twice a year' ],
                        placeholder: 'select ...',
                        fieldType: 'select',
                        isMultiple: false,
                        orderNum: 4,
                        points: 20
                    },
                    {
                        title: 'How likely is it that you would recommend us to a friend/colleague?',
                        value: [ 'Very likely', 'Somewhat likely', 'Neutral', 'Somewhat unlikely', 'Very unlikely' ],
                        placeholder: 'select ...',
                        fieldType: 'select',
                        isMultiple: false,
                        orderNum: 5,
                        points: 20
                    }
                ]
            };

            var fData = Service.formatData ( data );

            expect ( fData ).to.be.an ( 'object' ).and.be.ok;
            expect ( fData ).to.have.property ( 'survey' ).and.be.an ( 'object' );
            expect ( fData ).to.have.property ( 'surveyQuestions' ).and.be.an ( 'array' );

            var survey = fData.survey;

            expect ( survey ).to.be.an ( 'object' ).and.be.ok;
            expect ( survey ).to.have.property ( 'id' ).and.equal ( data.id );
            expect ( survey ).to.have.property ( 'title' ).and.equal ( data.title );
            expect ( survey ).to.have.property ( 'description' ).and.equal ( data.description );
            expect ( survey ).to.have.property ( 'pointsPossible' ).and.equal ( data.pointsPossible );

            var questions = fData.surveyQuestions;

            expect ( questions ).to.be.an ( 'array' ).and.have.length ( 5 );

            expect ( questions[ 0 ] ).to.have.property ( 'title' ).and.equal ( data.surveyQuestions[ 0 ].title );
            expect ( questions[ 0 ] ).to.have.property ( 'value' ).and.be.a( 'string' ).and.be.ok;
            expect ( questions[ 0 ] ).to.have.property ( 'placeholder' ).and.equal ( data.surveyQuestions[ 0 ].placeholder );
            expect ( questions[ 0 ] ).to.have.property ( 'fieldType' ).and.equal ( data.surveyQuestions[ 0 ].fieldType );
            expect ( questions[ 0 ] ).to.have.property ( 'isMultiple' ).and.equal ( false );
            expect ( questions[ 0 ] ).to.have.property ( 'isAutoGrade' ).and.equal ( false );
            expect ( questions[ 0 ] ).to.have.property ( 'orderNum' ).and.equal ( data.surveyQuestions[ 0 ].orderNum );
            expect ( questions[ 0 ] ).to.have.property ( 'points' ).and.equal ( data.surveyQuestions[ 0 ].points );

            expect ( questions[ 2 ] ).to.have.property ( 'title' ).and.equal ( data.surveyQuestions[ 2 ].title );
            expect ( questions[ 2 ] ).to.have.property ( 'value' ).and.be.a( 'string' ).and.be.ok;
            expect ( questions[ 2 ] ).to.have.property ( 'placeholder' ).and.be.null;
            expect ( questions[ 2 ] ).to.have.property ( 'fieldType' ).and.equal ( data.surveyQuestions[ 2 ].fieldType );
            expect ( questions[ 2 ] ).to.have.property ( 'isMultiple' ).and.equal ( data.surveyQuestions[ 2 ].isMultiple );
            expect ( questions[ 2 ] ).to.have.property ( 'isAutoGrade' ).and.equal ( false );
            expect ( questions[ 2 ] ).to.have.property ( 'orderNum' ).and.equal ( data.surveyQuestions[ 2 ].orderNum );
            expect ( questions[ 2 ] ).to.have.property ( 'points' ).and.equal ( data.surveyQuestions[ 2 ].points );

            done();
        } );

        it( 'should return an object with filtered data for create operation', function ( done ) {

            var data = {
                title: 'Customer Satisfaction',
                description: 'Customer satisfaction survey',
                pointsPossible: 100,
                surveyQuestions: [
                    {
                        title: 'Your name',
                        placeholder: 'enter your name here ...',
                        fieldType: 'text',
                        orderNum: 1,
                        points: 20
                    },
                    {
                        title: 'How long have you used our products/service?',
                        value: [ 'Less than 6 months', '1 year to less than 3 years', '3 years to less than 5 years', '5 years or more' ],
                        fieldType: 'radio',
                        isMultiple: false,
                        orderNum: 2,
                        points: 20
                    },
                    {
                        title: 'Which of our products/services do you use?',
                        value: [ 'Product_1', 'Product_2', 'Product_3', 'Product_4', 'Other' ],
                        fieldType: 'checkbox',
                        isMultiple: true,
                        orderNum: 3,
                        points: 20
                    }
                ]
            };

            var fData = Service.formatData ( data, 'create' );

            expect ( fData ).to.be.an ( 'object' ).and.be.ok;
            expect ( fData ).to.have.property ( 'survey' ).and.be.an ( 'object' );
            expect ( fData ).to.have.property ( 'surveyQuestions' ).and.be.an ( 'array' );

            var survey = fData.survey;

            expect ( survey ).to.be.an ( 'object' ).and.be.ok;
            expect ( survey ).to.have.property ( 'id' ).and.be.null;
            expect ( survey ).to.have.property ( 'title' ).and.equal ( data.title );
            expect ( survey ).to.have.property ( 'description' ).and.equal ( data.description );
            expect ( survey ).to.have.property ( 'pointsPossible' ).and.equal ( data.pointsPossible );

            var questions = fData.surveyQuestions;

            expect ( questions ).to.be.an ( 'array' ).and.have.length ( 3 );

            expect ( questions[ 0 ] ).to.have.property ( 'title' ).and.equal ( data.surveyQuestions[ 0 ].title );
            expect ( questions[ 0 ] ).to.have.property ( 'value' ).and.be.a( 'string' ).and.be.ok;
            expect ( questions[ 0 ] ).to.have.property ( 'placeholder' ).and.equal ( data.surveyQuestions[ 0 ].placeholder );
            expect ( questions[ 0 ] ).to.have.property ( 'fieldType' ).and.equal ( data.surveyQuestions[ 0 ].fieldType );
            expect ( questions[ 0 ] ).to.have.property ( 'isMultiple' ).and.equal ( false );
            expect ( questions[ 0 ] ).to.have.property ( 'isAutoGrade' ).and.equal ( false );
            expect ( questions[ 0 ] ).to.have.property ( 'orderNum' ).and.equal ( data.surveyQuestions[ 0 ].orderNum );
            expect ( questions[ 0 ] ).to.have.property ( 'points' ).and.equal ( data.surveyQuestions[ 0 ].points );

            expect ( questions[ 2 ] ).to.have.property ( 'title' ).and.equal ( data.surveyQuestions[ 2 ].title );
            expect ( questions[ 2 ] ).to.have.property ( 'value' ).and.be.a( 'string' ).and.be.ok;
            expect ( questions[ 2 ] ).to.have.property ( 'placeholder' ).and.be.null;
            expect ( questions[ 2 ] ).to.have.property ( 'fieldType' ).and.equal ( data.surveyQuestions[ 2 ].fieldType );
            expect ( questions[ 2 ] ).to.have.property ( 'isMultiple' ).and.equal ( data.surveyQuestions[ 2 ].isMultiple );
            expect ( questions[ 2 ] ).to.have.property ( 'isAutoGrade' ).and.equal ( false );
            expect ( questions[ 2 ] ).to.have.property ( 'orderNum' ).and.equal ( data.surveyQuestions[ 2 ].orderNum );
            expect ( questions[ 2 ] ).to.have.property ( 'points' ).and.equal ( data.surveyQuestions[ 2 ].points );

            done();
        } );

    } );

    describe( '.verifyData( data, operation )', function () {

        it( 'should return an object with error code if title of survey do not exist', function ( done ) {

            var data = {
                description: 'Customer satisfaction survey',
                pointsPossible: 100,
                surveyQuestions: [
                    {
                        title: 'Your name',
                        placeholder: 'enter your name here ...',
                        fieldType: 'text',
                        orderNum: 1,
                        points: 20
                    }
                ]
            };

            var fData = Service.formatData ( data )
              , vData = Service.verifyData ( fData );


            expect ( vData ).to.be.an ( 'object' ).and.be.ok;
            expect ( vData ).to.have.property ( 'statuscode' ).and.equal ( 403 );
            expect ( vData ).to.have.property ( 'message' ).and.equal ( 'invalid title of survey' );


            done();
        } );

        it( 'should return an object with error code if title of survey question do not exist', function ( done ) {

            var data = {
                title: 'Customer Satisfaction',
                description: 'Customer satisfaction survey',
                pointsPossible: 100,
                surveyQuestions: [
                    {
                        value: [ 'Less than 6 months', '1 year to less than 3 years', '3 years to less than 5 years', '5 years or more' ],
                        placeholder: 'enter your name here ...',
                        fieldType: 'text',
                        orderNum: 1,
                        points: 20
                    }
                ]
            };

            var fData = Service.formatData ( data )
              , vData = Service.verifyData ( fData );

            expect ( vData ).to.be.an ( 'object' ).and.be.ok;
            expect ( vData ).to.have.property ( 'statuscode' ).and.equal ( 403 );
            expect ( vData ).to.have.property ( 'message' ).and.equal ( 'invalid title of survey question' );

            done();
        } );

        it( 'should return an data if it is correct', function ( done ) {

            var data = {
                title: 'Customer Satisfaction',
                description: 'Customer satisfaction survey',
                pointsPossible: 100,
                surveyQuestions: [
                    {
                        title: 'Customer Satisfaction',
                        value: [ 'Less than 6 months', '1 year to less than 3 years', '3 years to less than 5 years', '5 years or more' ],
                        placeholder: 'enter your name here ...',
                        fieldType: 'text',
                        orderNum: 1,
                        points: 20
                    }
                ]
            };

            var fData = Service.formatData ( data, 'update' )
              , vData = Service.verifyData ( fData, 'update' );


            expect ( vData ).to.be.an ( 'object' ).and.deep.equal ( fData );

            done();
        } );

    } );

    describe( '.prepData( data, operation )', function () {

        it( 'should call formatData and verifyData', function ( done ) {

            var data = {
                description: 'Customer satisfaction survey',
                pointsPossible: 100,
                surveyQuestions: [
                    {
                        title: 'Your name',
                        placeholder: 'enter your name here ...',
                        fieldType: 'text',
                        orderNum: 1,
                        points: 20
                    }
                ]
            };

            var spy_format = sinon.spy( Service, 'formatData' )
              , spy_verify = sinon.spy( Service, 'verifyData' );

            var pData = Service.prepData ( data );

            expect( spy_format.called ).to.be.true;
            expect( spy_format.calledOnce ).to.be.true;

            var spyCall_format = spy_format.getCall ( 0 ).args;

            expect ( spyCall_format ).to.be.an ( 'array' ).and.have.length ( 2 );
            expect ( spyCall_format[ 0 ] ).to.be.an ( 'object' ).and.deep.equal ( data );
            expect ( spyCall_format[ 1 ] ).to.be.an ( 'string' ).and.equal ( '' );

            expect( spy_verify.called ).to.be.true;
            expect( spy_verify.calledOnce ).to.be.true;

            var spyCall_verify = spy_verify.getCall ( 0 ).args;

            expect ( spyCall_verify ).to.be.an ( 'array' ).and.have.length ( 1 );
            expect ( spyCall_verify[ 0 ] ).to.be.an ( 'object' ).and.deep.equal ( Service.formatData( data ) );

            spy_format.restore();
            spy_verify.restore();

            done();
        } );

        it( 'should call formatData and verifyData', function ( done ) {

            var data = {
                description: 'Customer satisfaction survey',
                pointsPossible: 100,
                surveyQuestions: [
                    {
                        title: 'Your name',
                        placeholder: 'enter your name here ...',
                        fieldType: 'text',
                        orderNum: 1,
                        points: 20
                    }
                ]
            };

            var spy_format = sinon.spy( Service, 'formatData' )
                , spy_verify = sinon.spy( Service, 'verifyData' );

            var pData = Service.prepData ( data, 'create' );

            expect( spy_format.called ).to.be.true;
            expect( spy_format.calledOnce ).to.be.true;

            var spyCall_format = spy_format.getCall ( 0 ).args;

            expect ( spyCall_format ).to.be.an ( 'array' ).and.have.length ( 2 );
            expect ( spyCall_format[ 0 ] ).to.be.an ( 'object' ).and.deep.equal ( data );
            expect ( spyCall_format[ 1 ] ).to.be.an ( 'string' ).and.equal ( 'create' );

            expect( spy_verify.called ).to.be.true;
            expect( spy_verify.calledOnce ).to.be.true;

            var spyCall_verify = spy_verify.getCall ( 0 ).args;

            expect ( spyCall_verify ).to.be.an ( 'array' ).and.have.length ( 1 );
            expect ( spyCall_verify[ 0 ] ).to.be.an ( 'object' ).and.deep.equal ( Service.formatData( data, 'create' ) );

            spy_format.restore();
            spy_verify.restore();

            done();
        } );

    } );

    describe( '.createSurvey( data )', function () {

        it( 'should be able to create survey with survey questions', function ( done ) {
            var data = {
                title: 'Customer Satisfaction',
                description: 'Customer satisfaction survey',
                pointsPossible: 100,
                surveyQuestions: [
                    {
                        title: 'Your name',
                        placeholder: 'enter your name here ...',
                        fieldType: 'text',
                        orderNum: 1,
                        points: 20
                    },
                    {
                        title: 'How long have you used our products/service?',
                        value: [ 'Less than 6 months', '1 year to less than 3 years', '3 years to less than 5 years', '5 years or more' ],
                        fieldType: 'radio',
                        isMultiple: false,
                        orderNum: 2,
                        points: 20
                    },
                    {
                        title: 'Which of our products/services do you use?',
                        value: [ 'Product_1', 'Product_2', 'Product_3', 'Product_4', 'Other' ],
                        fieldType: 'checkbox',
                        isMultiple: true,
                        orderNum: 3,
                        points: 20
                    },
                    {
                        title: 'How frequently do you purchase from us?',
                        value: [ 'Every day', 'Every week', 'Every month', 'Once or twice a year' ],
                        placeholder: 'select ...',
                        fieldType: 'select',
                        isMultiple: false,
                        orderNum: 4,
                        points: 20
                    },
                    {
                        title: 'How likely is it that you would recommend us to a friend/colleague?',
                        value: [ 'Very likely', 'Somewhat likely', 'Neutral', 'Somewhat unlikely', 'Very unlikely' ],
                        placeholder: 'select ...',
                        fieldType: 'select',
                        isMultiple: false,
                        orderNum: 5,
                        points: 20
                    }
                ]
            };

            Service
                .createSurvey( data )
                .then( function ( survey ) {

                    expect ( survey ).to.be.an ( 'object' ).and.be.ok;
                    expect ( survey ).to.have.property ( 'id' ).and.be.ok;
                    expect ( survey ).to.have.property ( 'title' ).and.equal ( data.title );
                    expect ( survey ).to.have.property ( 'description' ).and.equal ( data.description );
                    expect ( survey ).to.have.property ( 'pointsPossible' ).and.equal ( data.pointsPossible );
                    expect ( survey ).to.have.property ( 'surveyQuestions' ).and.be.an ( 'array' ).and.have.length ( data.surveyQuestions.length );

                    expect ( survey ).to.not.have.property ( 'updatedAt' );
                    expect ( survey ).to.not.have.property ( 'createdAt' );

                    Model
                        .find ( survey.id )
                        .then ( function ( _survey ) {

                            expect ( _survey ).to.be.an ( 'object' ).and.be.ok;
                            expect ( _survey ).to.have.property ( 'id' ).and.equal ( survey.id );
                            expect ( _survey ).to.have.property ( 'title' ).and.equal ( data.title );
                            expect ( _survey ).to.have.property ( 'description' ).and.equal ( data.description );
                            expect ( _survey ).to.have.property ( 'pointsPossible' ).and.equal ( data.pointsPossible );

                            SurveyQuestionModel
                                .findAll ( { where: { SurveyId: _survey.id } } )
                                .then ( function ( questions ) {

                                    expect ( questions ).to.be.an ( 'array' ).and.have.length ( 5 );

                                    expect ( questions[ 0 ] ).to.have.property ( 'id' ).and.be.ok;
                                    expect ( questions[ 0 ] ).to.have.property ( 'title' ).and.equal ( data.surveyQuestions[ 0 ].title );
                                    expect ( questions[ 0 ] ).to.have.property ( 'value' ).and.be.a( 'string' ).and.be.ok;
                                    expect ( questions[ 0 ] ).to.have.property ( 'placeholder' ).and.equal ( data.surveyQuestions[ 0 ].placeholder );
                                    expect ( questions[ 0 ] ).to.have.property ( 'fieldType' ).and.equal ( data.surveyQuestions[ 0 ].fieldType );
                                    expect ( questions[ 0 ] ).to.have.property ( 'isMultiple' ).and.equal ( false );
                                    expect ( questions[ 0 ] ).to.have.property ( 'isAutoGrade' ).and.equal ( false );
                                    expect ( questions[ 0 ] ).to.have.property ( 'orderNum' ).and.equal ( data.surveyQuestions[ 0 ].orderNum );
                                    expect ( questions[ 0 ] ).to.have.property ( 'points' ).and.equal ( data.surveyQuestions[ 0 ].points );

                                    expect ( questions[ 2 ] ).to.have.property ( 'id' ).and.be.ok;
                                    expect ( questions[ 2 ] ).to.have.property ( 'title' ).and.equal ( data.surveyQuestions[ 2 ].title );
                                    expect ( questions[ 2 ] ).to.have.property ( 'value' ).and.be.a( 'string' ).and.be.ok;
                                    expect ( questions[ 2 ] ).to.have.property ( 'placeholder' ).and.be.null;
                                    expect ( questions[ 2 ] ).to.have.property ( 'fieldType' ).and.equal ( data.surveyQuestions[ 2 ].fieldType );
                                    expect ( questions[ 2 ] ).to.have.property ( 'isMultiple' ).and.equal ( data.surveyQuestions[ 2 ].isMultiple );
                                    expect ( questions[ 2 ] ).to.have.property ( 'isAutoGrade' ).and.equal ( false );
                                    expect ( questions[ 2 ] ).to.have.property ( 'orderNum' ).and.equal ( data.surveyQuestions[ 2 ].orderNum );
                                    expect ( questions[ 2 ] ).to.have.property ( 'points' ).and.equal ( data.surveyQuestions[ 2 ].points );

                                    done();
                            }, done );
                        }, done );
                }, done );
        } );

        it( 'should be able to create survey without survey questions', function ( done ) {
            var data = {
                title: 'Customer Satisfaction #1',
                description: 'Customer satisfaction survey #1',
                pointsPossible: 100,
                surveyQuestions: []
            };

            Service
                .createSurvey( data )
                .then( function ( survey ) {

                    expect ( survey ).to.be.an ( 'object' ).and.be.ok;
                    expect ( survey ).to.have.property ( 'id' ).and.be.ok;
                    expect ( survey ).to.have.property ( 'title' ).and.equal ( data.title );
                    expect ( survey ).to.have.property ( 'description' ).and.equal ( data.description );
                    expect ( survey ).to.have.property ( 'pointsPossible' ).and.equal ( data.pointsPossible );
                    expect ( survey ).to.have.property ( 'surveyQuestions' ).and.be.empty;

                    expect ( survey ).to.not.have.property ( 'updatedAt' );
                    expect ( survey ).to.not.have.property ( 'createdAt' );

                    Model
                        .find ( survey.id )
                        .then ( function ( _survey ) {

                            expect ( _survey ).to.be.an ( 'object' ).and.be.ok;
                            expect ( _survey ).to.have.property ( 'id' ).and.equal ( survey.id );
                            expect ( _survey ).to.have.property ( 'title' ).and.equal ( data.title );
                            expect ( _survey ).to.have.property ( 'description' ).and.equal ( data.description );
                            expect ( _survey ).to.have.property ( 'pointsPossible' ).and.equal ( data.pointsPossible );

                            survey_1 = _survey;

                            SurveyQuestionModel
                                .findAll ( { where: { SurveyId: _survey.id } } )
                                .then ( function ( questions ) {

                                    expect ( questions ).to.be.an ( 'array' ).and.be.empty;

                                    done();
                                }, done );
                        }, done );
                }, done );
        } );

        it( 'should return an error and do not call create method if title of survey do not exist', function ( done ) {
            var data = {
                description: 'Customer satisfaction survey #1',
                pointsPossible: 100,
                surveyQuestions: []
            };

            var spy = sinon.spy( Service, 'create' );

            Service
                .createSurvey( data )
                .then( function ( result ) {

                    expect ( result ).to.be.an ( 'object' ).and.be.ok;
                    expect ( result ).to.have.property ( 'statuscode' ).and.equal ( 403 );
                    expect ( result ).to.have.property ( 'message' ).and.equal ( 'invalid title of survey' );

                    expect( spy.called ).to.be.false;

                    spy.restore();

                    done();
                }, done );
        } );

        it( 'should return an error and do not call create method if title of survey question do not exist', function ( done ) {
            var data = {
                title: 'Customer Satisfaction',
                description: 'Customer satisfaction survey #1',
                pointsPossible: 100,
                surveyQuestions: [
                    {
                        value: [ 'Less than 6 months', '1 year to less than 3 years', '3 years to less than 5 years', '5 years or more' ],
                        placeholder: 'enter your name here ...',
                        fieldType: 'text',
                        orderNum: 1,
                        points: 20
                    }
                ]
            };

            var spy = sinon.spy( Service, 'create' );

            Service
                .createSurvey( data )
                .then( function ( result ) {

                    expect ( result ).to.be.an ( 'object' ).and.be.ok;
                    expect ( result ).to.have.property ( 'statuscode' ).and.equal ( 403 );
                    expect ( result ).to.have.property ( 'message' ).and.equal ( 'invalid title of survey question' );

                    expect( spy.called ).to.be.false;

                    spy.restore();

                    done();
                }, done );
        } );

    } );

    describe( '.processUpdate( survey, data )', function () {

        it( 'should call ORMSurveyQuestionModel.destroy, ORMSurveyModel.updateAttributes and does not call ORMSurveyQuestionModel.bulkCreate if surveyQuestions is empty array', function ( done ) {
            var data = {
                    id: survey_1.id,
                    title: 'qwqwqwqwq',
                    description: 'Customer satisfaction survey #1 updated',
                    pointsPossible: 1000,
                    surveyQuestions: []
                }
              , pData = Service.prepData ( data, 'update' );

            var spy_update = sinon.spy( survey_1, 'updateAttributes' )
              , spy_destroy = sinon.spy( SurveyQuestionModel, 'destroy' )
              , spy_bulk = sinon.spy( SurveyQuestionModel, 'bulkCreate' );

            Service
                .processUpdate( survey_1, pData )
                .then( function( result ) {

                    expect ( result ).to.be.an ( 'object' ).and.be.ok;
                    expect ( result ).to.have.property ( 'id' ).and.equal ( survey_1.id );
                    expect ( result ).to.have.property ( 'title' ).and.equal ( data.title );
                    expect ( result ).to.have.property ( 'description' ).and.equal ( data.description );
                    expect ( result ).to.have.property ( 'pointsPossible' ).and.equal ( data.pointsPossible );
                    expect ( result ).to.have.property ( 'surveyQuestions' ).and.be.an ( 'array' ).and.be.empty;

                    expect( spy_update.called ).to.be.true;
                    expect( spy_update.calledOnce ).to.be.true;

                    var spyCall_update = spy_update.getCall ( 0 ).args;

                    expect ( spyCall_update ).to    .be.an ( 'array' ).and.have.length ( 1 );
                    expect ( spyCall_update[ 0 ] ).to.be.an ( 'object' ).and.deep.equal ( pData.survey );

                    expect( spy_destroy.called ).to.be.true;
                    expect( spy_destroy.calledOnce ).to.be.true;

                    var spyCall_destroy = spy_destroy.getCall ( 0 ).args;

                    expect ( spyCall_destroy ).to.be.an ( 'array' ).and.have.length ( 1 );
                    expect ( spyCall_destroy[ 0 ] ).to.be.an ( 'object' ).and.deep.equal ( { SurveyId: survey_1.id } );

                    expect( spy_bulk.called ).to.be.false;

                    spy_update.restore();
                    spy_destroy.restore();
                    spy_bulk.restore();

                    done();
                }, done )

        } );

        it( 'should call ORMSurveyQuestionModel.destroy, ORMSurveyModel.updateAttributes and ORMSurveyQuestionModel.bulkCreate if surveyQuestions is not empty array', function ( done ) {
            var data = {
                    id: survey_1.id,
                    title: 'qwqwqwqwq',
                    description: 'Customer satisfaction survey #1 updated',
                    pointsPossible: 1000,
                    surveyQuestions: [
                        {
                            title: 'castom title',
                            placeholder: 'enter your name here ...',
                            fieldType: 'text',
                            orderNum: 1,
                            points: 20
                        }
                    ]
                }
              , pData = Service.prepData ( data, 'update' );

            var spy_update = sinon.spy( survey_1, 'updateAttributes' )
              , spy_destroy = sinon.spy( SurveyQuestionModel, 'destroy' )
              , spy_bulk = sinon.spy( SurveyQuestionModel, 'bulkCreate' );

            Service
                .processUpdate( survey_1, pData )
                .then( function( result ) {

                    expect ( result ).to.be.an ( 'object' ).and.be.ok;
                    expect ( result ).to.have.property ( 'id' ).and.equal ( survey_1.id );
                    expect ( result ).to.have.property ( 'title' ).and.equal ( data.title );
                    expect ( result ).to.have.property ( 'description' ).and.equal ( data.description );
                    expect ( result ).to.have.property ( 'pointsPossible' ).and.equal ( data.pointsPossible );
                    expect ( result ).to.have.property ( 'surveyQuestions' ).and.be.an ( 'array' ).and.have.length ( data.surveyQuestions.length );

                    expect( spy_update.called ).to.be.true;
                    expect( spy_update.calledOnce ).to.be.true;

                    var spyCall_update = spy_update.getCall ( 0 ).args;

                    expect ( spyCall_update ).to    .be.an ( 'array' ).and.have.length ( 1 );
                    expect ( spyCall_update[ 0 ] ).to.be.an ( 'object' ).and.deep.equal ( pData.survey );

                    expect( spy_destroy.called ).to.be.true;
                    expect( spy_destroy.calledOnce ).to.be.true;

                    var spyCall_destroy = spy_destroy.getCall ( 0 ).args;

                    expect ( spyCall_destroy ).to.be.an ( 'array' ).and.have.length ( 1 );
                    expect ( spyCall_destroy[ 0 ] ).to.be.an ( 'object' ).and.deep.equal ( { SurveyId: survey_1.id } );

                    expect( spy_bulk.called ).to.be.true;
                    expect( spy_bulk.calledOnce ).to.be.true;

                    var spyCall_bulk = spy_bulk.getCall ( 0 ).args;

                    expect ( spyCall_bulk ).to.be.an ( 'array' ).and.have.length ( 1 );
                    expect ( spyCall_bulk[ 0 ] ).to.be.an ( 'array' ).and.have.length ( 1 );

                    var qw = spyCall_bulk[ 0 ][ 0 ];

                    expect ( qw ).to.be.an ( 'object' ).and.be.ok;
                    expect ( qw ).to.not.have.property ( 'id' );
                    expect ( qw ).to.have.property ( 'title' ).and.equal ( data.surveyQuestions[ 0 ].title );
                    expect ( qw ).to.have.property ( 'placeholder' ).and.equal ( data.surveyQuestions[ 0 ].placeholder );
                    expect ( qw ).to.have.property ( 'fieldType' ).and.equal ( data.surveyQuestions[ 0 ].fieldType );
                    expect ( qw ).to.have.property ( 'orderNum' ).and.equal ( data.surveyQuestions[ 0 ].orderNum );
                    expect ( qw ).to.have.property ( 'points' ).and.equal ( data.surveyQuestions[ 0 ].points );
                    expect ( qw ).to.have.property ( 'value' ).and.be.a ( 'string' );
                    expect ( qw ).to.have.property ( 'isMultiple' ).and.be.false;
                    expect ( qw ).to.have.property ( 'isAutoGrade' ).and.be.false;
                    expect ( qw ).to.have.property ( 'SurveyId' ).and.equal ( survey_1.id );

                    spy_update.restore();
                    spy_destroy.restore();
                    spy_bulk.restore();

                    done();
                }, done )

        } );

        it( 'should be able to update survey with survey questions', function ( done ) {
            var data = {
                id: survey_1.id,
                title: 'Customer Satisfaction updated',
                description: 'Customer satisfaction survey',
                pointsPossible: 100,
                surveyQuestions: [
                    {
                        title: 'Your name',
                        placeholder: 'enter your name here ...',
                        fieldType: 'text',
                        orderNum: 1,
                        points: 20
                    },
                    {
                        title: 'How long have you used our products/service?',
                        value: [ 'Less than 6 months', '1 year to less than 3 years', '3 years to less than 5 years', '5 years or more' ],
                        fieldType: 'radio',
                        isMultiple: false,
                        orderNum: 2,
                        points: 20
                    },
                    {
                        title: 'Which of our products/services do you use?',
                        value: [ 'Product_1', 'Product_2', 'Product_3', 'Product_4', 'Other' ],
                        fieldType: 'checkbox',
                        isMultiple: true,
                        orderNum: 3,
                        points: 20
                    },
                    {
                        title: 'How frequently do you purchase from us?',
                        value: [ 'Every day', 'Every week', 'Every month', 'Once or twice a year' ],
                        placeholder: 'select ...',
                        fieldType: 'select',
                        isMultiple: false,
                        orderNum: 4,
                        points: 20
                    },
                    {
                        title: 'How likely is it that you would recommend us to a friend/colleague?',
                        value: [ 'Very likely', 'Somewhat likely', 'Neutral', 'Somewhat unlikely', 'Very unlikely' ],
                        placeholder: 'select ...',
                        fieldType: 'select',
                        isMultiple: false,
                        orderNum: 5,
                        points: 20
                    }
                ]
            };

            var pData = Service.prepData ( data, 'update' );

            Service
                .processUpdate( survey_1, pData )
                .then( function ( survey ) {

                    expect ( survey ).to.be.an ( 'object' ).and.be.ok;
                    expect ( survey ).to.have.property ( 'id' ).and.equal ( survey_1.id );
                    expect ( survey ).to.have.property ( 'title' ).and.equal ( data.title );
                    expect ( survey ).to.have.property ( 'description' ).and.equal ( data.description );
                    expect ( survey ).to.have.property ( 'pointsPossible' ).and.equal ( data.pointsPossible );
                    expect ( survey ).to.have.property ( 'surveyQuestions' ).and.be.an ( 'array' ).and.have.length ( data.surveyQuestions.length );

                    expect ( survey ).to.not.have.property ( 'updatedAt' );
                    expect ( survey ).to.not.have.property ( 'createdAt' );

                    Model
                        .find ( survey.id )
                        .then ( function ( _survey ) {

                        expect ( _survey ).to.be.an ( 'object' ).and.be.ok;
                        expect ( _survey ).to.have.property ( 'id' ).and.equal ( survey.id );
                        expect ( _survey ).to.have.property ( 'title' ).and.equal ( data.title );
                        expect ( _survey ).to.have.property ( 'description' ).and.equal ( data.description );
                        expect ( _survey ).to.have.property ( 'pointsPossible' ).and.equal ( data.pointsPossible );

                        SurveyQuestionModel
                            .findAll ( { where: { SurveyId: _survey.id } } )
                            .then ( function ( questions ) {

                            expect ( questions ).to.be.an ( 'array' ).and.have.length ( 5 );

                            expect ( questions[ 0 ] ).to.have.property ( 'id' ).and.be.ok;
                            expect ( questions[ 0 ] ).to.have.property ( 'title' ).and.equal ( data.surveyQuestions[ 0 ].title );
                            expect ( questions[ 0 ] ).to.have.property ( 'value' ).and.be.a( 'string' ).and.be.ok;
                            expect ( questions[ 0 ] ).to.have.property ( 'placeholder' ).and.equal ( data.surveyQuestions[ 0 ].placeholder );
                            expect ( questions[ 0 ] ).to.have.property ( 'fieldType' ).and.equal ( data.surveyQuestions[ 0 ].fieldType );
                            expect ( questions[ 0 ] ).to.have.property ( 'isMultiple' ).and.equal ( false );
                            expect ( questions[ 0 ] ).to.have.property ( 'isAutoGrade' ).and.equal ( false );
                            expect ( questions[ 0 ] ).to.have.property ( 'orderNum' ).and.equal ( data.surveyQuestions[ 0 ].orderNum );
                            expect ( questions[ 0 ] ).to.have.property ( 'points' ).and.equal ( data.surveyQuestions[ 0 ].points );

                            expect ( questions[ 2 ] ).to.have.property ( 'id' ).and.be.ok;
                            expect ( questions[ 2 ] ).to.have.property ( 'title' ).and.equal ( data.surveyQuestions[ 2 ].title );
                            expect ( questions[ 2 ] ).to.have.property ( 'value' ).and.be.a( 'string' ).and.be.ok;
                            expect ( questions[ 2 ] ).to.have.property ( 'placeholder' ).and.be.null;
                            expect ( questions[ 2 ] ).to.have.property ( 'fieldType' ).and.equal ( data.surveyQuestions[ 2 ].fieldType );
                            expect ( questions[ 2 ] ).to.have.property ( 'isMultiple' ).and.equal ( data.surveyQuestions[ 2 ].isMultiple );
                            expect ( questions[ 2 ] ).to.have.property ( 'isAutoGrade' ).and.equal ( false );
                            expect ( questions[ 2 ] ).to.have.property ( 'orderNum' ).and.equal ( data.surveyQuestions[ 2 ].orderNum );
                            expect ( questions[ 2 ] ).to.have.property ( 'points' ).and.equal ( data.surveyQuestions[ 2 ].points );

                            done();
                        }, done );
                    }, done );
                }, done );
        } );

    } );

    describe( '.updateSurvey( data, srvId )', function () {

        it( 'should return an error and do not call ORMSurveyModel.find if title of survey do not exist', function ( done ) {
            var data = {
                id: 1000,
                title: '',
                description: 'Customer satisfaction survey #1 updated',
                pointsPossible: 1000,
                surveyQuestions: []
            };

            var spy = sinon.spy( Model, 'find' );

            Service
                .updateSurvey( data, 1000 )
                .then( function( result ) {

                    expect ( result ).to.be.an ( 'object' ).and.be.ok;
                    expect ( result ).to.have.property ( 'statuscode' ).and.equal ( 403 );
                    expect ( result ).to.have.property ( 'message' ).and.equal ( 'invalid title of survey' );

                    expect( spy.called ).to.be.false;

                    spy.restore();

                    done();
                }, done )

        } );

        it( 'should return an error and do not call ORMSurveyModel.find if title of survey question do not exist', function ( done ) {
            var data = {
                id: 1000,
                title: 'qqq',
                description: 'Customer satisfaction survey #1 updated',
                pointsPossible: 1000,
                surveyQuestions: [
                    {
                        title: '',
                        placeholder: 'enter your name here ...',
                        fieldType: 'text',
                        orderNum: 1,
                        points: 20
                    }
                ]
            };

            var spy = sinon.spy( Model, 'find' );

            Service
                .updateSurvey( data, 1000 )
                .then( function( result ) {

                    expect ( result ).to.be.an ( 'object' ).and.be.ok;
                    expect ( result ).to.have.property ( 'statuscode' ).and.equal ( 403 );
                    expect ( result ).to.have.property ( 'message' ).and.equal ( 'invalid title of survey question' );

                    expect( spy.called ).to.be.false;

                    spy.restore();

                    done();
                }, done )

        } );

        it( 'should return an error and do not call ORMSurveyModel.find if survey id does not match', function ( done ) {
            var data = {
                id: 1000,
                title: 'Customer Satisfaction #1 updated',
                description: 'Customer satisfaction survey #1 updated',
                pointsPossible: 1000,
                surveyQuestions: []
            };

            var spy = sinon.spy( Model, 'find' );

            Service
                .updateSurvey( data, 1001 )
                .then( function( result ) {

                    expect ( result ).to.be.an ( 'object' ).and.be.ok;
                    expect ( result ).to.have.property ( 'statuscode' ).and.equal ( 403 );
                    expect ( result ).to.have.property ( 'message' ).and.equal ( 'invalid id' );

                    expect( spy.called ).to.be.false;

                    spy.restore();

                    done();
                }, done )

        } );

        it( 'should return an error and call ORMSurveyModel.find if survey with such id does not exist', function ( done ) {
            var data = {
                id: 59595959,
                title: 'Customer Satisfaction #1 updated',
                description: 'Customer satisfaction survey #1 updated',
                pointsPossible: 1000,
                surveyQuestions: []
            };

            var spy = sinon.spy( Model, 'find' );

            Service
                .updateSurvey( data, data.id )
                .then( function( result ) {

                    expect ( result ).to.be.an ( 'object' ).and.be.ok;
                    expect ( result ).to.have.property ( 'statuscode' ).and.equal ( 403 );
                    expect ( result ).to.have.property ( 'message' ).and.equal ( 'invalid id' );

                    expect( spy.called ).to.be.true;
                    expect( spy.calledOnce ).to.be.true;

                    var spyCall = spy.getCall ( 0 ).args;

                    expect ( spyCall ).to.be.an ( 'array' ).and.have.length ( 1 );
                    expect ( spyCall[ 0 ] ).to.be.an ( 'number' ).and.equal ( data.id );

                    spy.restore();

                    done();
                }, done )

        } );

        it( 'should call Service.processUpdate with specific parameters', function ( done ) {
            var data = {
                id: survey_1.id,
                title: 'Customer Satisfaction #1 updated',
                description: 'Customer satisfaction survey #1 updated',
                pointsPossible: 1000,
                surveyQuestions: [
                    {
                        title: 'Your name',
                        placeholder: 'enter your name here ...',
                        fieldType: 'text',
                        orderNum: 1,
                        points: 20
                    },
                    {
                        title: 'How long have you used our products/service?',
                        value: [ 'Less than 6 months', '1 year to less than 3 years', '3 years to less than 5 years', '5 years or more' ],
                        fieldType: 'radio',
                        isMultiple: false,
                        orderNum: 2,
                        points: 20
                    },
                    {
                        title: 'Which of our products/services do you use?',
                        value: [ 'Product_1', 'Product_2', 'Product_3', 'Product_4', 'Other' ],
                        fieldType: 'checkbox',
                        isMultiple: true,
                        orderNum: 3,
                        points: 20
                    },
                    {
                        title: 'How frequently do you purchase from us?',
                        value: [ 'Every day', 'Every week', 'Every month', 'Once or twice a year' ],
                        placeholder: 'select ...',
                        fieldType: 'select',
                        isMultiple: false,
                        orderNum: 4,
                        points: 20
                    },
                    {
                        title: 'How likely is it that you would recommend us to a friend/colleague?',
                        value: [ 'Very likely', 'Somewhat likely', 'Neutral', 'Somewhat unlikely', 'Very unlikely' ],
                        placeholder: 'select ...',
                        fieldType: 'select',
                        isMultiple: false,
                        orderNum: 5,
                        points: 20
                    }
                ]
            };

            var spy = sinon.spy( Service, 'processUpdate' );

            Service
                .updateSurvey( data, survey_1.id )
                .then( function( result ) {

                    expect( spy.called ).to.be.true;
                    expect( spy.calledOnce ).to.be.true;

                    var spyCall = spy.getCall ( 0 ).args;

                    var surveyData = {
                        id: survey_1.id,
                        title: 'Customer Satisfaction #1 updated',
                        description: 'Customer satisfaction survey #1 updated',
                        pointsPossible: 1000,
                        surveyQuestions: []
                    };

                    expect ( spyCall ).to.be.an ( 'array' ).and.have.length ( 2 );
                    expect ( spyCall[ 0 ].toJSON() ).to.be.an ( 'object' ).and.deep.equal ( surveyData );

                    var tData = Service.prepData ( data )

                    tData.surveyQuestions.forEach ( function ( x ) {
                        delete x.id;
                        x.SurveyId = result.id;
                    } );

                    expect ( spyCall[ 1 ] ).to.be.an ( 'object' ).and.deep.equal ( tData );

                    spy.restore();

                    done();
                }, done )

        } );

    } );

    describe( '.getSurveyById( srvId )', function () {

        it( 'should be able to find survey by srvId', function ( done ) {

            Service
                .getSurveyById( survey_1.id )
                .then( function( survey ) {

                    expect ( survey ).to.be.an ( 'object' ).and.be.ok;
                    expect ( survey ).to.have.property ( 'id' ).and.equal ( survey_1.id );
                    expect ( survey ).to.have.property ( 'title' ).and.equal ( 'Customer Satisfaction #1 updated' );
                    expect ( survey ).to.have.property ( 'description' ).and.equal ( 'Customer satisfaction survey #1 updated' );
                    expect ( survey ).to.have.property ( 'pointsPossible' ).and.equal ( 1000 );

                    expect ( survey ).to.have.property ( 'surveyQuestions' ).and.be.an ( 'array' ).and.have.length ( 5 );
                    expect ( survey.surveyQuestions[ 0 ] ).to.have.property ( 'id' ).and.be.ok;
                    expect ( survey.surveyQuestions[ 0 ] ).to.have.property ( 'title' ).and.be.ok;
                    expect ( survey.surveyQuestions[ 0 ] ).to.have.property ( 'value' ).and.be.ok;
                    expect ( survey.surveyQuestions[ 0 ] ).to.have.property ( 'placeholder' ).and.be.ok;
                    expect ( survey.surveyQuestions[ 0 ] ).to.have.property ( 'fieldType' ).and.be.ok;
                    expect ( survey.surveyQuestions[ 0 ] ).to.have.property ( 'isMultiple' );
                    expect ( survey.surveyQuestions[ 0 ] ).to.have.property ( 'isAutoGrade' );
                    expect ( survey.surveyQuestions[ 0 ] ).to.have.property ( 'SurveyId' ).and.equal ( survey.id );

                    expect ( survey.surveyQuestions[ 0 ] ).to.not.have.property ( 'updatedAt' );
                    expect ( survey.surveyQuestions[ 0 ] ).to.not.have.property ( 'createdAt' );

                    expect ( survey ).to.not.have.property ( 'updatedAt' );
                    expect ( survey ).to.not.have.property ( 'createdAt' );

                    done();
                }, done )
        } );

        it( 'should be able to get the error if the srvId does not exist', function ( done ) {

            Service
                .getSurveyById( 100000 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.equal ( 'invalid id' );

                    done();
                }, done )
        } );

    } );

    describe( '.getSurveyList()', function () {

        it( 'should be able to get list of surveys', function ( done ) {

            Service
                .getSurveyList()
                .then( function( results ) {

                    expect ( results ).to.be.an ( 'array' ).and.not.empty;
                    expect ( results ).to.have.length.above ( 1 );

                    expect ( results[0] ).to.be.an ( 'object' );
                    expect ( results[0] ).to.have.property ( 'id' ).and.be.ok;
                    expect ( results[0] ).to.have.property ( 'title' ).and.be.ok;
                    expect ( results[0] ).to.have.property ( 'description' ).and.be.ok;
                    expect ( results[0] ).to.have.property ( 'pointsPossible' ).and.be.ok;
                    expect ( results[0] ).to.have.property ( 'surveyQuestions' ).and.be.an ( 'array' ).and.have.length.above ( 1 );

                    expect ( results[0].surveyQuestions[ 0 ] ).to.have.property ( 'id' ).and.be.ok;
                    expect ( results[0].surveyQuestions[ 0 ] ).to.have.property ( 'title' ).and.be.ok;
                    expect ( results[0].surveyQuestions[ 0 ] ).to.have.property ( 'value' ).and.be.ok;
                    expect ( results[0].surveyQuestions[ 0 ] ).to.have.property ( 'placeholder' ).and.be.ok;
                    expect ( results[0].surveyQuestions[ 0 ] ).to.have.property ( 'fieldType' ).and.be.ok;
                    expect ( results[0].surveyQuestions[ 0 ] ).to.have.property ( 'isMultiple' );
                    expect ( results[0].surveyQuestions[ 0 ] ).to.have.property ( 'isAutoGrade' );
                    expect ( results[0].surveyQuestions[ 0 ] ).to.have.property ( 'SurveyId' ).and.equal ( results[0].id );

                    expect ( results[0].surveyQuestions[ 0 ] ).to.not.have.property ( 'updatedAt' );
                    expect ( results[0].surveyQuestions[ 0 ] ).to.not.have.property ( 'createdAt' );

                    expect ( results[0] ).to.not.have.property ( 'updatedAt' );
                    expect ( results[0] ).to.not.have.property ( 'createdAt' );

                    done();
                }, done )
        } );

    } );

    describe( '.removeSurvey( srvId )', function () {

        it( 'should be able to delete survey by srvId', function ( done ) {

            survey_1_Id = survey_1.id;

            Service
                .removeSurvey( survey_1_Id )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 200 );
                    expect( result ).to.have.property( 'message' ).and.equal( 'survey and survey question has been deleted' );

                    Model
                        .find( survey_1_Id )
                        .success( function( result ) {

                            expect( result ).to.not.be.ok;

                            SurveyQuestionModel
                                .findAll ( { where: { SurveyId: survey_1_Id } } )
                                .success( function( results ) {

                                    expect( results ).to.be.an ( 'array' ).and.be.empty;

                                    done();
                                })
                                .error( done );
                        })
                        .error( done );
                }, done )
        } );

        it( 'should be able to get the error if the srvId does not exist', function ( done ) {

            Service
                .removeSurvey( survey_1_Id )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.equal( 'invalid id' );

                    done();
                }, done )
        } );

    } );

} );