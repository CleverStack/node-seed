var should = require('should'),
    request = require('supertest'),
    app = require('../../../app');

describe('ExampleController', function () {
    describe('postAction', function () {
        it('should return valid status', function (done) {
            request(app)
                .post('/example')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.should.eql({
                        status: 'Created record!'
                    });
                    done();
                });
        });
    });

    describe('listAction', function () {
        it('should return valid status', function (done) {
            request(app)
                .get('/example')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.should.eql({
                        status: 'Sending you the list of examples.'
                    });
                    done();
                });
        });
    });

    describe('getAction', function () {
        it('should return valid status', function (done) {
            request(app)
                .get('/example/123')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.should.eql({
                        status: 'sending you record with id of 123'
                    });
                    done();
                });
        });
    });

    describe('putAction', function () {
        it('should return valid status', function (done) {
            request(app)
                .put('/example/123')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.should.eql({
                        status: 'updated record with id 123'
                    });
                    done();
                });
        });
    });

    describe('deleteAction', function () {
        it('should return valid status', function (done) {
            request(app)
                .del('/example/123')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.should.eql({
                        status: 'deleted record with id 123'
                    });
                    done();
                });
        });
    });

    describe('customAction', function () {
        it('should return valid status', function (done) {
            request(app)
                .get('/example/custom')
                .expect('Content-Type', /html/)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.text.should.equal('<p>Hello from custom action controller</p>');
                    done();
                });
        });
    });
});
