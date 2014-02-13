// Bootstrap the testing environmen
var testEnv = require( 'utils' ).testEnv()
  , expect = require( 'chai' ).expect
  , Service;

var surveyId;

describe( 'controllers.SurveyController', function () {
    var ctrl, Controller, Service;

    before( function ( done ) {
        testEnv( function ( _SurveyController_, _SurveyService_ ) {
            var req = {
                params: { action: 'fakeAction'},
                method: 'GET',
                query: {}
            };

            var res = {
                json: function () {}
            };

            var next = function () {};

            Controller = _SurveyController_;
            Service = _SurveyService_;
            ctrl = new Controller( req, res, next );

            done();
        } );
    } );

    afterEach( function ( done ) {

        ctrl.req = {
            params: { action: 'fakeAction'},
            method: 'GET',
            query: {},
            body: {}
        };

        ctrl.res = {
            json: function () {}
        };

        done();
    });

    describe( '.postAction()', function () {

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

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 200 );

                expect ( data ).to.be.an ( 'object' ).and.be.ok;
                expect ( data ).to.have.property ( 'id' ).and.be.ok;
                expect ( data ).to.have.property ( 'title' ).and.equal ( data.title );
                expect ( data ).to.have.property ( 'description' ).and.equal ( data.description );
                expect ( data ).to.have.property ( 'pointsPossible' ).and.equal ( data.pointsPossible );
                expect ( data ).to.have.property ( 'surveyQuestions' ).and.be.an ( 'array' ).and.have.length ( data.surveyQuestions.length );

                expect ( data ).to.not.have.property ( 'updatedAt' );
                expect ( data ).to.not.have.property ( 'createdAt' );

                surveyId = data.id;

                done();
            };

            ctrl.req.body = data;

            ctrl.postAction();
        } );

        it( 'should be able to create survey without survey questions', function ( done ) {

            var data = {
                title: 'Customer Satisfaction',
                description: 'Customer satisfaction survey',
                pointsPossible: 100,
                surveyQuestions: []
            };

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 200 );

                expect ( data ).to.be.an ( 'object' ).and.be.ok;
                expect ( data ).to.have.property ( 'id' ).and.be.ok;
                expect ( data ).to.have.property ( 'title' ).and.equal ( data.title );
                expect ( data ).to.have.property ( 'description' ).and.equal ( data.description );
                expect ( data ).to.have.property ( 'pointsPossible' ).and.equal ( data.pointsPossible );
                expect ( data ).to.have.property ( 'surveyQuestions' ).and.be.empty;

                expect ( data ).to.not.have.property ( 'updatedAt' );
                expect ( data ).to.not.have.property ( 'createdAt' );

                done();
            };

            ctrl.req.body = data;

            ctrl.postAction();
        } );

        it( 'should be able to get the error if title of survey do not exist', function ( done ) {

            var data = {
                title: '',
                description: 'Customer satisfaction survey',
                pointsPossible: 100,
                surveyQuestions: []
            };

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 403 );

                expect( data ).to.be.a ( 'string' ).and.equal( 'invalid title of survey' );

                done();
            };

            ctrl.req.body = data;

            ctrl.postAction();
        } );

        it( 'should be able to get the error if title of survey question do not exist', function ( done ) {

            var data = {
                title: 'qwqwqwqwq',
                description: 'Customer satisfaction survey',
                pointsPossible: 100,
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

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 403 );

                expect( data ).to.be.a ( 'string' ).and.equal( 'invalid title of survey question' );

                done();
            };

            ctrl.req.body = data;

            ctrl.postAction();
        } );

    } );

    describe( '.listAction()', function () {

        it( 'should be able to get list of surveys', function ( done ) {

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 200 );

                expect ( data ).to.be.an ( 'array' ).and.not.empty;
                expect ( data ).to.have.length.above ( 1 );

                expect ( data[0] ).to.be.an ( 'object' );
                expect ( data[0] ).to.have.property ( 'id' ).and.be.ok;
                expect ( data[0] ).to.have.property ( 'title' ).and.be.ok;
                expect ( data[0] ).to.have.property ( 'description' ).and.be.ok;
                expect ( data[0] ).to.have.property ( 'pointsPossible' ).and.be.ok;
                expect ( data[0] ).to.have.property ( 'surveyQuestions' ).and.be.an ( 'array' );

                done();
            };

            ctrl.listAction();
        } );

    } );

    describe( '.getAction()', function () {

        it( 'should be able to find survey by srvId', function ( done ) {

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 200 );

                expect ( data ).to.be.an ( 'object' ).and.be.ok;
                expect ( data ).to.have.property ( 'id' ).and.equal ( surveyId );
                expect ( data ).to.have.property ( 'title' ).and.equal ( 'Customer Satisfaction' );
                expect ( data ).to.have.property ( 'description' ).and.equal ( 'Customer satisfaction survey' );
                expect ( data ).to.have.property ( 'pointsPossible' ).and.equal ( 100 );

                expect ( data ).to.have.property ( 'surveyQuestions' ).and.be.an ( 'array' ).and.have.length ( 5 );
                expect ( data.surveyQuestions[ 0 ] ).to.have.property ( 'id' ).and.be.ok;
                expect ( data.surveyQuestions[ 0 ] ).to.have.property ( 'title' ).and.be.ok;
                expect ( data.surveyQuestions[ 0 ] ).to.have.property ( 'value' ).and.be.ok;
                expect ( data.surveyQuestions[ 0 ] ).to.have.property ( 'placeholder' ).and.be.ok;
                expect ( data.surveyQuestions[ 0 ] ).to.have.property ( 'fieldType' ).and.be.ok;
                expect ( data.surveyQuestions[ 0 ] ).to.have.property ( 'isMultiple' );
                expect ( data.surveyQuestions[ 0 ] ).to.have.property ( 'isAutoGrade' );
                expect ( data.surveyQuestions[ 0 ] ).to.have.property ( 'SurveyId' ).and.equal ( surveyId );

                expect ( data.surveyQuestions[ 0 ] ).to.not.have.property ( 'updatedAt' );
                expect ( data.surveyQuestions[ 0 ] ).to.not.have.property ( 'createdAt' );

                expect ( data ).to.not.have.property ( 'updatedAt' );
                expect ( data ).to.not.have.property ( 'createdAt' );

                done();
            };

            ctrl.req.params = { id: surveyId };

            ctrl.getAction();
        } );

        it( 'should be able to get the error if the srvId does not exist', function ( done ) {

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 403 );

                expect ( data ).to.be.an ( 'string' ).and.equal ( 'invalid id' );

                done();
            };

            ctrl.req.params = { id: 151551515151 };

            ctrl.getAction();
        } );

    } );

    describe( '.putAction()', function () {

        it( 'should be able to get the error if title of survey do not exist', function ( done ) {

            var data = {
                id: surveyId,
                title: '',
                description: 'Customer satisfaction survey',
                pointsPossible: 100,
                surveyQuestions: []
            };

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 403 );

                expect( data ).to.be.an( 'string' ).and.equal ( 'invalid title of survey' );

                done();
            };

            ctrl.req.params = { id: surveyId };

            ctrl.req.body = data;

            ctrl.putAction();
        } );

        it( 'should be able to get the error if title of survey question do not exist', function ( done ) {

            var data = {
                id: surveyId,
                title: 'qwqwqwqwq',
                description: 'Customer satisfaction survey',
                pointsPossible: 100,
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

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 403 );

                expect( data ).to.be.an( 'string' ).and.equal ( 'invalid title of survey question' );

                done();
            };

            ctrl.req.params = { id: surveyId };

            ctrl.req.body = data;

            ctrl.putAction();
        } );

        it( 'should be able to get the error if survey id does not match', function ( done ) {

            var data = {
                id: surveyId,
                title: 'qwqwqwqwq',
                description: 'Customer satisfaction survey',
                pointsPossible: 100,
                surveyQuestions: [
                    {
                        title: 'asasasasas',
                        placeholder: 'enter your name here ...',
                        fieldType: 'text',
                        orderNum: 1,
                        points: 20
                    }
                ]
            };

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 403 );

                expect( data ).to.be.an( 'string' ).and.equal ( 'invalid id' );

                done();
            };

            ctrl.req.params = { id: surveyId + 1 };

            ctrl.req.body = data;

            ctrl.putAction();
        } );

        it( 'should be able to get the error if survey with such id does not exist', function ( done ) {

            var data = {
                id: 151515151515,
                title: 'qwqwqwqwq',
                description: 'Customer satisfaction survey',
                pointsPossible: 100,
                surveyQuestions: [
                    {
                        title: 'asasasasas',
                        placeholder: 'enter your name here ...',
                        fieldType: 'text',
                        orderNum: 1,
                        points: 20
                    }
                ]
            };

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 403 );

                expect( data ).to.be.an( 'string' ).and.equal ( 'invalid id' );

                done();
            };

            ctrl.req.params = { id: data.id };

            ctrl.req.body = data;

            ctrl.putAction();
        } );

        it( 'should be able to get the error if survey with such id does not exist', function ( done ) {

            var data = {
                id: surveyId,
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

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 200 );

                expect ( data ).to.be.an ( 'object' ).and.be.ok;
                expect ( data ).to.have.property ( 'id' ).and.equal ( surveyId );
                expect ( data ).to.have.property ( 'title' ).and.equal ( data.title );
                expect ( data ).to.have.property ( 'description' ).and.equal ( data.description );
                expect ( data ).to.have.property ( 'pointsPossible' ).and.equal ( data.pointsPossible );
                expect ( data ).to.have.property ( 'surveyQuestions' ).and.be.an ( 'array' ).and.have.length ( data.surveyQuestions.length );

                expect ( data ).to.not.have.property ( 'updatedAt' );
                expect ( data ).to.not.have.property ( 'createdAt' );

                done();
            };

            ctrl.req.params = { id: surveyId };

            ctrl.req.body = data;

            ctrl.putAction();
        } );

    } );

    describe( '.deleteAction()', function () {

        it( 'should be able to get the error if the surveyId does not exist', function ( done ) {

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 403 );

                expect( data ).to.be.an( 'string' ).and.equal ( 'invalid id' );

                done();
            };

            ctrl.req.params = { id: 15151515515 };

            ctrl.deleteAction();
        } );

        it( 'should be able to delete survey by surveyId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'string' ).and.equal ( 'survey and survey question has been deleted' );

                done();
            };

            ctrl.req.params = { id: surveyId };

            ctrl.deleteAction();
        } );

    } );

} );