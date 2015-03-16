var expect      = require('chai').expect
  , sinon       = require('sinon')
  , underscore  = require('underscore')
  , injector    = require('injector')
  , moduleLdr   = injector.getInstance('moduleLoader')
  , ormEnabled  = moduleLdr.moduleIsEnabled('clever-orm')
  , odmEnabled  = moduleLdr.moduleIsEnabled('clever-odm')
  , models
  , testModule
  , TestMiddlewareAndRouteCtrl
  , drivers     = [];

describe('Controller', function () {
  before(function(done) {
    testModule = injector.getInstance('testModule');
    done();
  });

  function fakeResponse(cb) {
    return {
      json: function(code, message) {
        setTimeout(function() {
          cb(code, JSON.parse(JSON.stringify(message)));
        }, 10);
      },

      send: function(code, message) {
        setTimeout(function() {
          cb(code, message);
        }, 10);
      }
    };
  }

  if (ormEnabled) {
    drivers.push({
      name       : 'ORM',
      model      : 'TestModel',
      controller : 'TestController'
    });
  }

  if (odmEnabled) {
    drivers.push({
      name       : 'ODM',
      model      : 'TestObjectModel',
      controller : 'TestObjectController'
    });
  }

  describe('With Service:', function() {
    before(function(done) {
      TestMiddlewareAndRouteCtrl = testModule.controllers.TestMiddlewareAndRouteController;
      done();
    });

    drivers.forEach(function(driver) {
      describe('Using the ' + driver.name + ': (' + (driver.name === 'ORM' ? 'Object Relational Mapper' : 'Object Document Mapper') + ')', function() {
        var Model      = driver.model
          , Controller = driver.controller;

        before(function(done) {
          models     = [{ name: 'Testing' }, { name: 'Testing' }];
          
          Model      = testModule.models[Model];
          Controller = testModule.controllers[Controller];

          done();
        });

        function fakeRequest(req) {
          req.method  = req.method || 'GET';
          req.url     = req.url || ('/' + driver.name === 'ORM' ? 'test' : 'testobject');
          req.query   = req.query || {};
          req.body    = req.body || {};
          req.params  = req.params || {};

          return req;
        }

        it('Allows route to be strictly defined as string', function(done) {
          expect(TestMiddlewareAndRouteCtrl.route).to.eql('/testcustomroute|/testcustomroutes');
          done();
        });

        it('Allows route to be strictly defined as an array');

        it('Allows route (non plural and plural) to be guessed based on filename', function(done) {
          expect(Controller.route).to.eql(driver.name === 'ORM' ? '[POST] /test/?|/test/:id/?|/test/:id/:action/?|/tests/?|/tests/:action/?' : '[POST] /testobject/?|/testobject/:id/?|/testobject/:id/:action/?|/testobjects/?|/testobjects/:action/?');
          done();
        });

        it('Routes to functions that have "Action" on the end of their name', function(done) {
          var ctrl = null;

          var req = fakeRequest({
            method: 'GET',
            url: (driver.name === 'ORM' ? '/tests' : '/testobjects') + '/custom'
          });

          var res = fakeResponse(function(code, result) {
            expect(result).to.eql({ message: 'Hello from customAction' });
            expect(code).to.equal(200);
            expect(ctrl.action).to.equal('customAction');

            done();
          });

          this.timeout(10000);
          ctrl = Controller.callback('newInstance')(req, res);
        });

        it('Doesn\'t route to functions that don\'t have "Action" on the end of their name', function(done) {
          var ctrl = null;

          var req = fakeRequest({
            method: 'GET',
            url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/hidden'
          });

          // Should fall through to the listAction (based on restfulRouting)
          var res = fakeResponse(function(code, result) {
            expect(result).to.eql([]);
            expect(code).to.equal(200);
            expect(ctrl.action).to.equal('listAction');

            done();
          });

          this.timeout(10000);
          ctrl = Controller.callback('newInstance')(req, res);
        });

        it('Allows for multiple strict override routes separated by "|", like "/testcustomroute|/testcustomroutes"', function(done) {
          var ctrlOne = null
            , ctrlTwo = null
            , called = 0;

          var reqOne = fakeRequest({
            method: 'GET',
            uri: '/customroute'
          });

          var resOne = fakeResponse(function(code, result) {
            expect(result).to.eql({ message: 'Hello from TestMiddlewareAndRouteController' });
            expect(code).to.equal(200);
            expect(ctrlOne.action).to.equal('listAction');

            called++;

            if (called === 2) {
              done();
            }
          });

          var reqTwo = fakeRequest({
            method: 'GET',
            url: '/customroutes'
          });

          var resTwo = fakeResponse(function(code, result) {
            expect(result).to.eql({ message: 'Hello from TestMiddlewareAndRouteController' });
            expect(code).to.equal(200);
            expect(ctrlTwo.action).to.equal('listAction');

            called++;

            if (called === 2) {
              done();
            }
          });

          this.timeout(10000);
          ctrlOne = TestMiddlewareAndRouteCtrl.callback('newInstance')(reqOne, resOne);
          ctrlTwo = TestMiddlewareAndRouteCtrl.callback('newInstance')(reqTwo, resTwo);
        });

        describe('RESTful Routes:', function() {
          describe('.postAction():  Using route "POST /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '" or "POST /' + (driver.name === 'ORM' ? 'tests' : 'testobjects') + '"', function() {
            it('Should create a new model instance and save it in the database', function(done) {
              var ctrl = null
                , model = models[0];

              var req = fakeRequest({
                  method: 'POST',
                  body: underscore.extend({}, model)
                });

              var res = fakeResponse(function(code, result) {
                expect(result).to.be.an('object');
                expect(code).to.equal(200);
                expect(ctrl.action).to.equal('postAction');

                expect(result).to.have.property('id');
                expect(result).to.have.property('name', model.name);
                expect(result).to.have.property('createdAt');
                expect(result).to.have.property('updatedAt');
                
                model.id           = result.id;
                model.createdAt    = result.createdAt;
                model.updatedAt    = result.updatedAt;

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });

            it('Should not be able to create a new model without posting data', function(done) {
              var ctrl = null;

              var req = fakeRequest({
                method: 'POST'
              });

              var res = fakeResponse(function(code, result) {
                expect(code).to.equal(400);

                expect(result).to.be.an('object');
                expect(result).to.have.property('statusCode').and.to.eql(400);
                expect(result).to.have.property('message').and.to.eql('name is required.');

                expect(spy.called).to.eql(true);
                expect(ctrl.action).to.equal('postAction');

                spy.restore();

                done();
              });

              var spy = sinon.spy(Controller.prototype, 'postAction');

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });

            it('Should redirect/call .putAction() if you post data with an id /' + (driver.name === 'ORM' ? 'test' : 'testobject'), function(done) {
              var ctrl    = null
                , model   = models[0];

              model.name  = 'Should call putAction() if you post data with an id like POST /model';

              var req     = fakeRequest({
                method  : 'POST',
                body    : underscore.extend({}, model)
              });

              var res     = fakeResponse(function(code, result) {
                expect(result).to.be.an('object');
                expect(code).to.equal(200);
                expect(ctrl.action).to.equal('putAction');

                expect(result).to.have.property('id');
                expect(result.id).to.equal(model.id);

                expect(result).to.have.property('updatedAt');
                model.updatedAt = result.updatedAt;

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });

            it('Should redirect/call .putAction() if you post data with an id like /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '/1', function(done) {
              var ctrl = null
                , model = models[0];

              model.name = 'Should call putAction() if you post data without an id like POST /model/:id';

              var req = fakeRequest({
                method: 'POST',
                params: { id: model.id },
                body: underscore.extend({ }, model)
              });

              // Remove the id from the POST data
              delete req.body.id;

              var res = fakeResponse(function(code, result) {
                expect(result).to.be.an('object');
                expect(code).to.equal(200);
                expect(ctrl.action).to.equal('putAction');

                expect(result).to.have.property('id');
                expect(result.id).to.equal(model.id);

                expect(result).to.have.property('updatedAt');
                model.updatedAt = result.updatedAt;
                model.deletedAt = null;

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });
          });

          describe('.listAction():  Using route "GET /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '" or "GET /' + (driver.name === 'ORM' ? 'tests' : 'testobjects') + '"', function() {
            it('Should send all existing model instances as an array', function(done) {
              var ctrl = null;

              var req = fakeRequest({
                method: 'GET'
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.eql([models[0]]);
                expect(code).to.equal(200);
                expect(ctrl.action).to.equal('listAction');

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });

            it('Should send an array of matching model instances, using QueryString (/' + (driver.name === 'ORM' ? 'test' : 'testobject') + '?field=value&)', function(done) {
              var ctrl = null;

              var req = fakeRequest({
                method: 'GET',
                query: {
                  name: models[0].name
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.eql([models[0]]);
                expect(code).to.equal(200);
                expect(ctrl.action).to.equal('listAction');

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });
          });

          describe('.getAction():  Using route "GET /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '" or "GET /' + (driver.name === 'ORM' ? 'tests' : 'testobjects') + '"', function() {
            it('Should send an existing model instance by id when its specified in the uri/url like /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '/:id', function(done) {
              var ctrl = null;

              var req = fakeRequest({
                method: 'GET',
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/' + models[0].id,
                params: {
                  id: models[0].id
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.eql(models[0]);
                expect(code).to.equal(200);
                expect(ctrl.action).to.equal('getAction');

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });

            it('Should send an existing model instance by id when using the QueryString like /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '?id=1', function(done) {
              var ctrl = null;

              var req = fakeRequest({
                method: 'GET',
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/' + models[0].id,
                query: {
                  id: models[0].id
                },
                params: {
                  id: models[0].id
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.eql(models[0]);
                expect(code).to.equal(200);
                expect(ctrl.action).to.equal('getAction');

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });

            it('Should not return non existant models (or crash) for either QueryString or URI', function(done) {
              var ctrl = null
                , rand = driver.name === 'ORM' ? 99999999 : '550152f519c531f3648838b8';

              var req = fakeRequest({
                method: 'GET',
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/' + rand,
                query: {
                  id: rand
                },
                params: {
                  id: rand
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.eql({ statusCode: 404, message: (driver.name === 'ORM' ? 'Test' : 'TestObject') + ' doesn\'t exist.' });
                expect(code).to.equal(404);
                expect(ctrl.action).to.equal('getAction');

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });

            it('Should call listAction() when there is no id specified in either the QueryString or URI', function(done) {
              var ctrl = null;

              var req = fakeRequest({
                method: 'GET'
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.eql([models[0]]);
                expect(code).to.equal(200);
                expect(ctrl.action).to.equal('listAction');

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });
          });

          describe('.putAction():  Using route "PUT /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '/:id" or "PUT /' + (driver.name === 'ORM' ? 'tests' : 'testobjects') + '?id=1"', function() {
            it('Update a model when the id is in QueryString like /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '?id=1', function(done) {
              var ctrl = null;
              
              models[0].name = 'putAction updated with querystring id';

              var model = underscore.extend({}, models[0])
                , id    = model.id;

              delete model.id;

              var req = fakeRequest({
                method: 'PUT',
                body: model,
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/' + id,
                query: {
                  id: id
                },
                params: {
                  id: id
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.be.an('object');
                expect(code).to.equal(200);
                expect(ctrl.action).to.equal('putAction');

                expect(result).to.have.property('id');
                expect(result.id).to.equal(id);
                model.id = id;

                expect(result).to.have.property('name');
                expect(result.name).to.equal('putAction updated with querystring id');
                models[0].name = result.name;

                expect(result).to.have.property('updatedAt');
                model.updatedAt = result.updatedAt;

                expect(result).to.have.property('deletedAt');
                expect(result.deletedAt).to.equal(null);

                model.deletedAt = result.deletedAt;

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });

            it('Update a model when the id is in URL like /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '/1', function(done) {
              var ctrl = null;
              
              models[0].name = 'putAction updated with id in url';

              var model = underscore.extend({}, models[0]);

              var req = fakeRequest({
                method: 'PUT',
                body: model,
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/' + model.id,
                params: {
                  id: model.id
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.be.an('object');
                expect(code).to.equal(200);
                expect(ctrl.action).to.equal('putAction');

                expect(result).to.have.property('id');
                expect(result.id).to.equal(model.id);

                expect(result).to.have.property('name');
                expect(result.name).to.equal('putAction updated with id in url');
                models[0].name = result.name;

                expect(result).to.have.property('updatedAt');
                model.updatedAt = result.updatedAt;

                expect(result).to.have.property('deletedAt');
                expect(result.deletedAt).to.equal(null);

                model.deletedAt = result.deletedAt;

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });

            it('Should not update non existant models (or crash) for either QueryString or URI', function(done) {
              var ctrl = null
                , rand = driver.name === 'ORM' ? 99999999 : '550152f519c531f3648838b8';
              
              var req = fakeRequest({
                method: 'PUT',
                body: { id: rand, name: 'foobar' },
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/' + rand,
                params: {
                  id: rand
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.eql({ statusCode: 404, message: (driver.name === 'ORM' ? 'Test' : 'TestObject') + ' doesn\'t exist.' });
                expect(code).to.equal(404);
                expect(ctrl.action).to.equal('putAction');

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });
          });

          describe('.deleteAction():  Using route "DELETE /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '/:id" or "DELETE /' + (driver.name === 'ORM' ? 'tests' : 'testobjects') + '?id=1"', function() {
            it('Delete a model instances with id in the QueryString or URL like /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '/1', function(done) {
              var ctrl = null;

              var req = fakeRequest({
                method: 'DELETE',
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/' + models[0].id,
                params: {
                  id: models[0].id
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.eql({});
                expect(code).to.equal(200);
                expect(ctrl.action).to.equal('deleteAction');

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });

            it('Should not delete non existant models (or crash) for either QueryString or URI', function(done) {
              var ctrl = null
                , rand = driver.name === 'ORM' ? 99999999 : '550152f519c531f3648838b8';
              
              var req = fakeRequest({
                method: 'DELETE',
                body: { id: rand },
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/' + rand,
                params: {
                  id: rand
                },
                query: {
                  id: rand
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.eql({ statusCode: 404, message: (driver.name === 'ORM' ? 'Test' : 'TestObject') + ' doesn\'t exist.' });
                expect(code).to.equal(404);
                expect(ctrl.action).to.equal('deleteAction');

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });
          });
        });

        describe('Action Routes:', function() {
          describe('.postAction():  Using route "POST /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '/post" or "POST /' + (driver.name === 'ORM' ? 'tests' : 'testobjects') + '/post"', function() {
            it('Should create a new model instance and save it in the database', function(done) {
              var ctrl = null
                , model = models[1];

              var req = fakeRequest({
                  method  : 'POST',
                  body    : underscore.extend({}, model),
                  url     : (driver.name === 'ORM' ? '/test' : '/testobject') + '/post',
                  params  : {
                    action  : 'post'
                  }
                });

              var res = fakeResponse(function(code, result) {
                expect(code).to.equal(200);
                expect(result).to.be.an('object');
                expect(ctrl.action).to.equal('postAction');

                expect(result).to.have.property('id');
                expect(result).to.have.property('name', model.name);
                expect(result).to.have.property('createdAt');
                expect(result).to.have.property('updatedAt');
                
                model.id                        = result.id;
                model.createdAt    = result.createdAt;
                model.updatedAt    = result.updatedAt;

                model.deletedAt    = null;

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });

            it('Should not be able to create a new model without posting data', function(done) {
              var ctrl = null;

              var req = fakeRequest({
                method: 'POST',
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/post',
                params: {
                  action: 'post'
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(code).to.equal(400);
                expect(result).to.be.an('object');
                expect(spy.called).to.eql(true);
                expect(ctrl.action).to.equal('postAction');

                spy.restore();

                done();
              });

              var spy = sinon.spy(Controller.prototype, 'postAction');

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });
          });

          describe('.listAction():  Using route "GET /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '/list" or "GET /' + (driver.name === 'ORM' ? 'tests' : 'testobjects') + '/list"', function() {
            it('Should send all existing model instances as an array', function(done) {
              var ctrl = null;

              var req = fakeRequest({
                method: 'GET',
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/list',
                params: {
                  action: 'list'
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.eql([models[1]]);
                expect(code).to.equal(200);
                expect(ctrl.action).to.equal('listAction');

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });

            it('Should send an array of matching model instances, using QueryString (/' + (driver.name === 'ORM' ? 'test' : 'testobject') + '/list?field=value&)', function(done) {
              var ctrl = null;

              var req = fakeRequest({
                method: 'GET',
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/list',
                params: {
                  action: 'list'
                },
                query: {
                  name: models[1].name
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.eql([models[1]]);
                expect(code).to.equal(200);
                expect(ctrl.action).to.equal('listAction');

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });
          });

          describe('.getAction():  Using route "GET /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '" or "GET /' + (driver.name === 'ORM' ? 'tests' : 'testobjects') + '"', function() {
            it('Should send an existing model instance by id when its specified in the uri/url like /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '/:id', function(done) {
              var ctrl = null;

              var req = fakeRequest({
                method: 'GET',
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/get/' + models[1].id,
                params: {
                  action: 'get',
                  id: models[1].id
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.eql(models[1]);
                expect(code).to.equal(200);
                expect(ctrl.action).to.equal('getAction');

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });

            it('Should send an existing model instance by id when using the QueryString like /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '?id=1', function(done) {
              var ctrl = null;

              var req = fakeRequest({
                method: 'GET',
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/get/' + models[1].id,
                query: {
                  id: models[1].id
                },
                params: {
                  action: 'get',
                  id: models[1].id
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.eql(models[1]);
                expect(code).to.equal(200);
                expect(ctrl.action).to.equal('getAction');

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });

            it('Should not return non existant models (or crash) for either QueryString or URI', function(done) {
              var ctrl = null
                , rand = driver.name === 'ORM' ? 99999999 : '550152f519c531f3648838b8';

              var req = fakeRequest({
                method: 'GET',
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/get/' + rand,
                query: {
                  id: rand
                },
                params: {
                  action: 'get',
                  id: rand
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.eql({ statusCode: 404, message: (driver.name === 'ORM' ? 'Test' : 'TestObject') + ' doesn\'t exist.' });
                expect(code).to.equal(404);
                expect(ctrl.action).to.equal('getAction');

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });
          });

          describe('.putAction():  Using route "PUT /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '/:id" or "PUT /' + (driver.name === 'ORM' ? 'tests' : 'testobjects') + '?id=1"', function() {
            it('Update a model when the id is in QueryString like /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '?id=1', function(done) {
              var ctrl = null;
              
              models[1].name = 'putAction updated with querystring id';

              var model = underscore.extend({}, models[1])
                , id = model.id;

              delete model.id;

              var req = fakeRequest({
                method: 'POST',
                body: model,
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/put/' + id,
                query: {
                  id: id
                },
                params: {
                  action: 'put',
                  id: id
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.be.an('object');
                expect(code).to.equal(200);
                expect(ctrl.action).to.equal('putAction');

                expect(result).to.have.property('id');
                expect(result.id).to.equal(id);
                model.id = id;

                expect(result).to.have.property('name');
                expect(result.name).to.equal('putAction updated with querystring id');
                models[1].name = result.name;

                expect(result).to.have.property('updatedAt');
                model.updatedAt = result.updatedAt;

                expect(result).to.have.property('deletedAt');
                expect(result.deletedAt).to.equal(null);

                model.deletedAt = result.deletedAt;

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });

            it('Update a model when the id is in URL like /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '/1', function(done) {
              var ctrl = null;
              
              models[1].name = 'putAction updated with id in url';

              var model = underscore.extend({}, models[1]);

              var req = fakeRequest({
                method: 'POST',
                body: model,
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/put/' + model.id,
                params: {
                  action: 'put',
                  id: model.id
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.be.an('object');
                expect(code).to.equal(200);
                expect(ctrl.action).to.equal('putAction');

                expect(result).to.have.property('id');
                expect(result.id).to.equal(model.id);

                expect(result).to.have.property('name');
                expect(result.name).to.equal('putAction updated with id in url');
                models[1].name = result.name;

                expect(result).to.have.property('updatedAt');
                model.updatedAt = result.updatedAt;

                expect(result).to.have.property('deletedAt');
                expect(result.deletedAt).to.equal(null);

                model.deletedAt = result.deletedAt;

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });

            it('Should not update non existant models (or crash) for either QueryString or URI', function(done) {
              var ctrl = null
                , rand = driver.name === 'ORM' ? 99999999 : '550152f519c531f3648838b8';
              
              var req = fakeRequest({
                method: 'PUT',
                body: { id: rand, name: 'foobar' },
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/put/' + rand,
                params: {
                  action: 'put',
                  id: rand
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.eql({ statusCode: 404, message: (driver.name === 'ORM' ? 'Test' : 'TestObject') + ' doesn\'t exist.' });
                expect(code).to.equal(404);
                expect(ctrl.action).to.equal('putAction');

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });
          });

          describe('.deleteAction():  Using route "DELETE /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '/:id" or "DELETE /' + (driver.name === 'ORM' ? 'tests' : 'testobjects') + '?id=1"', function() {
            it('Delete a model instance with id in the QueryString or URL like /' + (driver.name === 'ORM' ? 'test' : 'testobject') + '/1', function(done) {
              var ctrl = null;

              var req = fakeRequest({
                method: 'GET',
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/delete/' + models[1].id,
                params: {
                  action: 'delete',
                  id: models[1].id
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.eql({});
                expect(code).to.equal(200);
                expect(ctrl.action).to.equal('deleteAction');

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });

            it('Should not delete non existant models (or crash) for either QueryString or URI', function(done) {
              var ctrl = null
                , rand = driver.name === 'ORM' ? 99999999 : '550152f519c531f3648838b8';
              
              var req = fakeRequest({
                method: 'GET',
                body: { id: rand },
                url: (driver.name === 'ORM' ? '/test' : '/testobject') + '/delete/' + rand,
                params: {
                  action: 'delete',
                  id: rand
                }
              });

              var res = fakeResponse(function(code, result) {
                expect(result).to.eql({ statusCode: 404, message: (driver.name === 'ORM' ? 'Test' : 'TestObject') + ' doesn\'t exist.' });
                expect(code).to.equal(404);
                expect(ctrl.action).to.equal('deleteAction');

                done();
              });

              this.timeout(10000);
              ctrl = Controller.callback('newInstance')(req, res);
            });
          });
        });
      });
    });
  });
});
