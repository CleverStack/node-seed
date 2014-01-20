var should = require( 'should' )
    , sinon = require( 'sinon' )
    , testEnv = require( './utils' ).testEnv
    , request = require( 'supertest' )
    , async = require( 'async' )
    , app = require( './../../../index' );

describe('controllers.EmailAlertController', function () {
    this.timeout( 10000 );
    var env, EmailAlertController, ODMAttributeValueModel, ctrl, HRManagerSession, HRManager, EmployeeSession, Employee;

    before(function (done) {
        var self = this;

        testEnv(function ( _ODMAttributeValueModel_ ) {
            Model = _ODMAttributeValueModel_;

            async.parallel( [
                function loginAsHRManager ( next ) {
                    request( app )
                        .post( '/user/login' )
                        .set( 'Accept', 'application/json' )
                        .send( { username: 'bolt-hris@clevertech.biz', password: 'password' })
                        .expect( 'Content-Type' , /json/ )
                        .expect( 200 )
                        .end( function ( err, res ) {
                            HRManagerSession = res.headers[ 'set-cookie' ].pop().split( ';' )[ 0 ];
                            HRManager = res.body;
                            next ( err );
                        });
                },
                function loginAsEmployee ( next ) {
                    request( app )
                        .post( '/user/login' )
                        .set( 'Accept', 'application/json' )
                        .send( { username: 'bolt-employee@clevertech.biz', password: 'password' } )
                        .expect( 'Content-Type' , /json/ )
                        .expect( 200 )
                        .end( function ( err, res ) {
                            EmployeeSession = res.headers[ 'set-cookie' ].pop().split( ';' )[ 0 ];
                            Employee = res.body;
                            next( err );
                        });
                }
            ],
                done );
        });
    });

    describe('.postAction()', function() {
        it('should allow us to make a new e-mail alert with the correct permissions', function ( done ) {
            var req = request( app ).post( '/alerts' );
            var date = ((new Date()).getTime() * 1000);

            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .send ( {
                alert: {
                    alertEmployee: true,
                    alertName: "New Benefit PTO",
                    category: "Benefit Eligibility",
                    customMessage: "My Message",
                    customSubject: "My Subject",
                    list: [],
                    otherFields: {
                        education: true
                    },
                    reminders: [
                        {
                            duration: "",
                            reminderDuration: "1",
                            reminderFrequency: "days",
                            reminderOffset: "before"
                        }
                    ],
                    tables: "Customized Education Table"
                },
                submitted: date
            } )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end( function (err, res) {
                    res.body.should.be.instanceof( Object );
                    res.body.should.have.properties( '_id', 'AttributeDocumentId', 'value' );
                    res.body.value.should.be.instanceof( Object );
                    res.body.value.should.have.properties( 'lastModifiedOn', 'lastModifiedBy', 'accountId', 'tables', 'reminders', 'otherFields', 'list', 'customSubject', 'customMessage', 'category', 'alertName', 'alertEmployee' );
                    res.body.value.lastModifiedOn.value.should.equal( date );
                    res.body.value.lastModifiedBy.value.should.equal( 9 );
                    res.body.value.accountId.value.should.equal( 1 );
                    res.body.value.tables.value.should.equal( 'Customized Education Table' )
                    res.body.value.reminders.value.should.be.instanceOf( Array );
                    res.body.value.reminders.value[0].duration.should.equal( '' );
                    res.body.value.reminders.value[0].reminderDuration.should.equal( '1' );
                    res.body.value.reminders.value[0].reminderFrequency.should.equal( 'days' );
                    res.body.value.reminders.value[0].reminderOffset.should.equal( 'before' );
                    res.body.value.otherFields.value.should.be.instanceof( Object );
                    res.body.value.otherFields.value.should.have.properties( 'education' );
                    res.body.value.otherFields.value.education.should.equal( true );
                    res.body.value.list.value.should.be.instanceof( Array );
                    res.body.value.list.value.length.should.equal( 0 );
                    res.body.value.customSubject.value.should.equal( 'My Subject' );
                    res.body.value.customMessage.value.should.equal( 'My Message' );
                    res.body.value.category.value.should.equal( 'Benefit Eligibility' );
                    res.body.value.alertName.value.should.equal( 'New Benefit PTO' );
                    res.body.value.alertEmployee.value.should.equal( true );
                    done();
                } );
        });

        it.skip('shouldn\'t allow us to make a new e-mail alert if we don\'t have the correct permissions', function ( done ) {
            var req = request( app ).post('/alerts');
            req.cookies = EmployeeSession;
            req.set( 'Accept','application/json' )
                .send ( {
            })
                .expect( 'Content-Type', /json/ )
                .expect( 403 )
                .end(function (err, res) {
                    done();
                });
        });

        it.skip('shouldn\'t allow us to update an e-mail alert if we don\'t have the correct data with the correct permissions', function ( done ) {
            var req = request( app ).post( '/alerts' );
            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .send ( {
            })
                .expect( 'Content-Type', /json/ )
                .expect( 400 )
                .end(function (err, res) {
                    done();
                });
        });

        it.skip('shouldn\'t allow us to save/update am e-mail alert if we don\'t have any data with the correct permissions', function ( done ) {
            var req = request( app ).post( '/alerts' );
            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .send (  )
                .expect( 'Content-Type', /json/ )
                .expect( 400 )
                .end(function (err, res) {
                    done();
                });
        });
    });

    describe('.putAction()', function() {
        before( function ( done ) {
            var self = this
                , req = request( app ).post( '/alerts' );

            var date = ((new Date()).getTime() * 1000);

            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .send ( {
                alert: {
                    alertEmployee: true,
                    alertName: "New Benefit PTO",
                    category: "Benefit Eligibility",
                    customMessage: "My Message",
                    customSubject: "My Subject",
                    list: [],
                    otherFields: {
                        education: true
                    },
                    reminders: [
                        {
                            duration: "",
                            reminderDuration: "1",
                            reminderFrequency: "days",
                            reminderOffset: "before"
                        }
                    ],
                    tables: "Customized Education Table"
                },
                submitted: date
            } )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    self.alert = res.body;
                    done();
                });
        });

        it('should allow us to modify an existing alert', function ( done ) {
            var self = this
                , req = request( app ).put('/alerts');

            var date = (new Date()).getTime() * 1000;

            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .send({
                    alert: {
                        _id: self.alert._id,
                        alertName: '123'
                    },
                    submitted: date
                })
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    res.body.should.be.instanceof( Object );
                    res.body.should.have.properties( '_id', 'AttributeDocumentId', 'value' );
                    res.body.value.should.be.instanceof( Object );
                    res.body.value.lastModifiedOn.value.should.equal( date );
                    res.body.value.lastModifiedBy.value.should.equal( 9 );
                    res.body.value.accountId.value.should.equal( 1 );
                    res.body.value.alertName.value.should.equal( '123' );
                    done();
                });
        });

        it('should give us an error when we try to edit a non-existing alert', function ( done ) {
            var self = this
                , req = request( app ).put('/alerts');

            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .send( {
                    alert: {
                        _id: '1212121212121212',
                        alertName: 'Hello'
                    }
                } )
                .expect( 'Content-Type', /json/ )
                .expect( 404 )
                .end(function (err, res) {
                    done();
                });
        });

        it.skip('should give us an error when we don\'t have the correct permissions', function ( done ) {
            var self = this
                , req = request( app ).put('/alert');

            req.cookies = EmployeeSession;
            req.set( 'Accept','application/json' )
                .send({
                })
                .expect( 'Content-Type', /json/ )
                .expect( 403 )
                .end(function (err, res) {
                    done();
                });
        });
    });

    describe('.deleteAction()', function() {
        before(function ( done ) {
            var self = this;

            async.parallel( [
                function ( next ) {
                    var date = (new Date()).getTime() * 1000;
                    var req = request( app ).post( '/alerts' );
                    req.cookies = HRManagerSession;
                    req.set( 'Accept','application/json' )
                        .send ( {
                        alert: {
                            alertEmployee: true,
                            alertName: "New Benefit PTO",
                            category: "Benefit Eligibility",
                            customMessage: "My Message",
                            customSubject: "My Subject",
                            list: [],
                            otherFields: {
                                education: true
                            },
                            reminders: [
                                {
                                    duration: "",
                                    reminderDuration: "1",
                                    reminderFrequency: "days",
                                    reminderOffset: "before"
                                }
                            ],
                            tables: "Customized Education Table"
                        },
                        submitted: date
                    } )
                        .expect( 'Content-Type', /json/ )
                        .expect( 200 )
                        .end(function (err, res) {
                            self.alert = res.body;
                            next();
                        });
                }
            ], done );
        });

        it.skip('shouldn\'t be able to delete an alert if we don\'t have the permissions', function ( done ) {
            var self = this
                , req = request( app ).del('/alerts');

            req.cookies = EmployeeSession;
            req.set( 'Accept','application/json' )
                .send ( {
            })
                .expect( 'Content-Type', /json/ )
                .expect( 403 )
                .end(function ( err, res ) {
                    done();
                });
        });

        it('should be able to delete an alert', function ( done ) {
            var self = this
                , req = request( app ).del( '/alerts/' + self.alert._id );

            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function ( err, res ) {
                    done( err );
                });
        });

        it('should give us a 404 if we try to delete a non-existant alert', function ( done ) {
            var self = this
                , req = request( app ).del('/alerts/' + self.alert._id );

            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .expect( 'Content-Type', /json/ )
                .expect( 404 )
                .end(function (err, res) {
                    done();
                });
        });
    });

    describe('.listAction()', function() {
        before(function ( done ) {
            var self = this;

            async.parallel( [
                function ( next ) {
                    var date = (new Date()).getTime() * 1000;
                    var req = request( app ).post('/alerts');
                    req.cookies = HRManagerSession;
                    req.set( 'Accept','application/json' )
                        .send ( {
                        alert: {
                            alertEmployee: true,
                            alertName: "New Benefit PTO",
                            category: "Benefit Eligibility",
                            customMessage: "My Message",
                            customSubject: "My Subject",
                            list: [],
                            otherFields: {
                                education: true
                            },
                            reminders: [
                                {
                                    duration: "",
                                    reminderDuration: "1",
                                    reminderFrequency: "days",
                                    reminderOffset: "before"
                                }
                            ],
                            tables: "Customized Education Table"
                        },
                        submitted: date
                    } )
                        .expect( 'Content-Type', /json/ )
                        .expect( 200 )
                        .end(function (err, res) {
                            self.alert = res.body;
                            next();
                        });
                }
            ], done );
        });

        it('should be able to get alerts with permissions', function ( done ) {
            var self = this
                , req = request( app ).get( '/alerts' );

            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    res.body.should.be.instanceof( Array );
                    res.body.length.should.be.above( 0 );
                    res.body[0].should.have.properties( '_id', 'AttributeDocumentId', 'value' );
                    res.body[0].value.should.be.instanceof( Object );
                    res.body[0].value.should.have.properties( 'lastModifiedOn', 'lastModifiedBy', 'accountId', 'tables', 'reminders', 'otherFields', 'list', 'customSubject', 'customMessage', 'category', 'alertName', 'alertEmployee' );
                    res.body[0].value.lastModifiedBy.value.should.equal( 9 );
                    res.body[0].value.accountId.value.should.equal( 1 );
                    res.body[0].value.tables.value.should.equal( 'Customized Education Table' )
                    res.body[0].value.reminders.value.should.be.instanceOf( Array );
                    res.body[0].value.reminders.value[0].duration.should.equal( '' );
                    res.body[0].value.reminders.value[0].reminderDuration.should.equal( '1' );
                    res.body[0].value.reminders.value[0].reminderFrequency.should.equal( 'days' );
                    res.body[0].value.reminders.value[0].reminderOffset.should.equal( 'before' );
                    res.body[0].value.otherFields.value.should.be.instanceof( Object );
                    res.body[0].value.otherFields.value.should.have.properties( 'education' );
                    res.body[0].value.otherFields.value.education.should.equal( true );
                    res.body[0].value.list.value.should.be.instanceof( Array );
                    res.body[0].value.list.value.length.should.equal( 0 );
                    res.body[0].value.customSubject.value.should.equal( 'My Subject' );
                    res.body[0].value.customMessage.value.should.equal( 'My Message' );
                    res.body[0].value.category.value.should.equal( 'Benefit Eligibility' );
                    res.body[0].value.alertName.value.should.equal( 'New Benefit PTO' );
                    res.body[0].value.alertEmployee.value.should.equal( true );
                    done();
                });
        });

        it.skip('shouldn\'t be able to get a list of alerts without permissions', function ( done ) {
            done();
        });

        it('should be able to get a specific alert', function ( done ) {
            var self = this
                , req = request( app ).get( '/alerts/' + self.alert._id );

            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    res.body.should.be.instanceof( Array );
                    res.body.length.should.be.above( 0 );
                    res.body[0].should.have.properties( '_id', 'AttributeDocumentId', 'value' );
                    res.body[0].value.should.be.instanceof( Object );
                    res.body[0].value.should.have.properties( 'lastModifiedOn', 'lastModifiedBy', 'accountId', 'tables', 'reminders', 'otherFields', 'list', 'customSubject', 'customMessage', 'category', 'alertName', 'alertEmployee' );
                    res.body[0].value.lastModifiedBy.value.should.equal( 9 );
                    res.body[0].value.accountId.value.should.equal( 1 );
                    res.body[0].value.tables.value.should.equal( 'Customized Education Table' )
                    res.body[0].value.reminders.value.should.be.instanceOf( Array );
                    res.body[0].value.reminders.value[0].duration.should.equal( '' );
                    res.body[0].value.reminders.value[0].reminderDuration.should.equal( '1' );
                    res.body[0].value.reminders.value[0].reminderFrequency.should.equal( 'days' );
                    res.body[0].value.reminders.value[0].reminderOffset.should.equal( 'before' );
                    res.body[0].value.otherFields.value.should.be.instanceof( Object );
                    res.body[0].value.otherFields.value.should.have.properties( 'education' );
                    res.body[0].value.otherFields.value.education.should.equal( true );
                    res.body[0].value.list.value.should.be.instanceof( Array );
                    res.body[0].value.list.value.length.should.equal( 0 );
                    res.body[0].value.customSubject.value.should.equal( 'My Subject' );
                    res.body[0].value.customMessage.value.should.equal( 'My Message' );
                    res.body[0].value.category.value.should.equal( 'Benefit Eligibility' );
                    res.body[0].value.alertName.value.should.equal( 'New Benefit PTO' );
                    res.body[0].value.alertEmployee.value.should.equal( true );
                    done();
                });
        });

        it('shouldn\'t be able to get a specific alert if we don\'t have the correct permissions', function ( done ) {
            done();
        });
    });
});
