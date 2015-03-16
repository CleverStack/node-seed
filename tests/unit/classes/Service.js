var expect        = require('chai').expect
  , injector      = require('injector')
  , Exceptions    = require('exceptions')
  , ServiceClass  = injector.getInstance('Service')
  , ModelClass    = injector.getInstance('Model')
  , moduleLdr     = injector.getInstance('moduleLoader')
  , ormEnabled    = moduleLdr.moduleIsEnabled('clever-orm')
  , odmEnabled    = moduleLdr.moduleIsEnabled('clever-odm')
  , drivers       = []
  , testModule;

describe('Service', function () {
  before(function(done) {
    testModule = injector.getInstance('testModule');
    done();
  });

  if (ormEnabled) {
    drivers.push({
      name    : 'ORM',
      model   : 'TestModel',
      service : 'TestService'
    });
  }

  if (odmEnabled) {
    drivers.push({
      name    : 'ODM',
      model   : 'TestObjectModel',
      service : 'TestObjectService'
    });
  }

  describe('With Model:', function() {
    drivers.forEach(function(driver) {
      var Service
        , Model
        , test;

      before(function(done) {
        Model   = testModule.models[driver.model];
        Service = testModule.services[driver.service];
        test    = { name: 'test.class.Service' };

        done();
      });

      describe('Using the ' + driver.name + ': (' + (driver.name === 'ORM' ? 'Object Relational Mapper' : 'Object Document Mapper') + ')', function() {
        it('should have loaded the service and model', function(done) {
          expect(Service instanceof ServiceClass.Class).to.eql(true);
          expect(Service.on).to.be.a('function');
          expect(Service.find).to.be.a('function');
          expect(Service.findAll).to.be.a('function');
          expect(Service.create).to.be.a('function');
          expect(Service.update).to.be.a('function');
          expect(Service.destroy).to.be.a('function');
          expect(Service.query).to.be.a('function');
          expect(Service.model).to.equal(Model);

          done();
        });

        describe('query(query, raw)', function() {
          it('should run a query and return wrapped model instances');
          it('should run a rawQuery (through options) and return a plain object');
        });

        describe('create(data)', function() {
          it('should create a new model instance through the usage of a service', function(done) {
            Service
              .create(test)
              .then(function(model) {
                expect(model instanceof ModelClass).to.eql(true);
                expect(model).to.be.an('object');
                expect(model).to.have.property('id');
                expect(model).to.have.property('name').and.to.eql('test.class.Service');

                test.id = model.id.toString();

                done();
              })
              .catch(done);
          });

          it('should validate models before saving them in the database', function(done) {
            Service
              .create({
                foobar: true
              })
              .then(done.bind('should not have called .then()'))
              .catch(function(err) {
                expect(err instanceof Exceptions.ModelValidation).to.eql(true);
                expect(err).to.have.property('message').and.to.eql('name is required.');

                done();
              });
          });
        });

        describe('find(idOrWhere)', function() {
          it('should find a model instance by id', function(done) {
            Service
              .find(test.id.toString())
              .then(function(model) {
                expect(model instanceof ModelClass).to.eql(true);
                // expect(model).to.have.property('id').and.eql(test.id);
                expect(model).to.have.property('id');
                expect(model).to.have.property('name').and.eql(test.name);

                done();
              })
              .catch(done);
          });

          it('should find a model instance by where object', function(done) {
            Service
              .find({
                where: {
                  id: test.id
                }
              })
              .then(function(model) {
                expect(model instanceof ModelClass).to.eql(true);
                expect(model).to.have.property('id');
                expect(model).to.have.property('name').and.eql(test.name);

                done();
              })
              .catch(done);
          });

          it('should not find non existant models', function(done) {
            Service
              .find({
                where: {
                  id: driver.name === 'ORM' ? 99999999 : '550152f519c531f3648838b8'
                }
              })
              .then(done)
              .catch(function(err) {
                expect(err instanceof Exceptions.ModelNotFound).to.eql(true);
                expect(err).to.have.property('message').and.to.eql((driver.name === 'ORM' ? 'Test' : 'TestObject') + ' doesn\'t exist.');

                done();
              });
          });
        });

        describe('findAll(idOrWhere)', function() {
          it('should be able to find models and return a list', function(done) {
            Service
              .findAll({})
              .then(function(models) {
                expect(models).to.be.an('array');
                expect(models.length).to.be.a('number');
                expect(models.length >= 1).equals(true);
                expect(models[ 0 ] instanceof ModelClass).to.equal(true);

                done();
              })
              .catch(done);
          });
          it('should be able to find models and return a list', function(done) {
            Service
              .findAll({
                where: {
                  name: 'test.class.Service'
                }
              })
              .then(function(models) {
                expect(models).to.be.an('array');
                expect(models.length).to.be.a('number');
                expect(models.length === 1).equals(true);
                expect(models[ 0 ] instanceof ModelClass).to.equal(true);
                expect(models[ 0 ]).to.have.property('name').and.to.equal('test.class.Service');

                done();
              })
              .catch(done);
          });
          it('should be able to use limit:{}');
          it('should be able to use include:{}');
        });

        describe('update(idOrWhere, data)', function() {
          it('should be able to update a ' + (driver.name === 'ORM' ? 'Test' : 'TestObject') + ' model', function(done) {
            test.name = 'test.class.Service - updated';
            Service
              .update(test, test.id)
              .then(function(model) {
                // expect(model).to.have.property('id').and.to.equal(test.id);
                expect(model).to.have.property('id');
                expect(model).to.have.property('name').and.to.equal(test.name);

                done();
              })
              .catch(done);
          });
          it('should not be able to update an invalid ' + (driver.name === 'ORM' ? 'Test' : 'TestObject') + ' model', function(done) {
            Service
              .update({name: 'invalid'}, { id: driver.name === 'ORM' ? 99999999 : '550152f519c531f3648838b8' })
              .then(done)
              .catch(function(err) {
                expect(err instanceof Exceptions.ModelNotFound).to.eql(true);
                expect(err).to.have.property('message').and.to.eql((driver.name === 'ORM' ? 'Test' : 'TestObject') + ' doesn\'t exist.');

                done();
              });
          });
        });

        describe('destroy(idOrWhere)', function() {
          it('should destroy (delete) a ' + (driver.name === 'ORM' ? 'Test' : 'TestObject') + ' model', function(done) {
            Service
              .destroy(test.id)
              .then(function(model) {
                expect(model).to.be.an('object');

                done();
              })
              .catch(done);
          });
          it('should not be able to destroy (delete) a non existant ' + (driver.name === 'ORM' ? 'Test' : 'TestObject') + ' model', function(done) {
            Service
              .update(driver.name === 'ORM' ? 99999999 : '550152f519c531f3648838b8')
              .then(done)
              .catch(function(err) {
                expect(err instanceof Exceptions.InvalidData).to.eql(true);
                expect(err).to.have.property('message').and.to.eql('Unable to update ' + (driver.name === 'ORM' ? 'Test' : 'TestObject') + ', you did not provide any data.');

                done();
              });
          });
        });
      });
    });
  });
});
