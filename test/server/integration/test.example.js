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
                .end(done);
        });
    });
});
