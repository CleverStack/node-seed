var should = require('should'),
    sinon = require('sinon'),
    testEnv = require('./utils').testEnv,
    BaseController = require('../../../src/classes/Controller'),
    BaseService = require('../../../src/service/Base');

describe('classes.Controller', function () {
    var Service,
        service,
        Controller,
        ctrl,
        env,
        objs = [];

    beforeEach(function (done) {
        testEnv().then(function (_env_) {
            env = _env_;

            Service = BaseService.extend();
            Model = env.models.TestModel;
            Service.Model = Model;
            service = new Service();

            Controller = BaseController.extend();
            Controller.service = service;

            var req = {
                params: {},
                method: 'GET'
                },
                res = {
                    json: function () {}
                },
                next = function () {};
            ctrl = new Controller(req, res, next);

            service.create({
                name: 'Joe'
            }).then(function (obj) {
                objs.push(obj); 
                return service.create({
                    name: 'Rachel'
                });
            }).then(function (obj) {
                objs.push(obj); 
                done();
            })
            .fail(done);
        }, done);
    });


  describe('static members', function () {
    describe('.attach()', function () {
      it('should return route calling Controller constructor', function () {
        var route = Controller.attach();
        var save = Controller.newInstance;
        Controller.newInstance = sinon.spy();
        var req = {},
            res = {},
            next = {};
        route(req, res, next);
        var newInstance = Controller.newInstance;
        Controller.newInstance = save;
        sinon.assert.calledWith(newInstance, req, res, next);
      });
    });
  });

  describe('constructor(req, res, next)', function () {
    it('should set .req, .res, .next', function () {
      var req = {
            params: {},
            method: 'GET'
          },
          res = {},
          next = function () {};

      var c = new Controller(req, res, next);
      c.req.should.equal(req);
      c.res.should.equal(res);
      c.next.should.equal(next);
    });

    it('should call next() if requested method not found', function () {
      Controller = Controller.extend({
          listAction: null,
          getAction: null
      });
      var req = {
            params: {},
            method: 'GET'
          },
          res = {},
          next = sinon.spy();
      var c = new Controller(req, res, next);
      sinon.assert.calledOnce(next);
    });

    it('should call action by HTTP method', function () {
      Controller = Controller.extend({
          listAction: null,
          getAction: sinon.spy()
      });

      var req = {
            params: {},
            method: 'GET'
          },
          res = {},
          next = function () {};
      var c = new Controller(req, res, next);
      c.getAction.calledWith(req, res).should.be.ok;
    });

    it('should call `list` action if no action given', function () {
      Controller = Controller.extend({
          listAction: sinon.spy()
      });

      var req = {
            params: {},
            method: 'GET'
          },
          res = {},
          next = function () {};
      var c = new Controller(req, res, next);
      c.listAction.calledWith(req, res).should.be.ok;
    });

    it('should call action by req.params.action', function () {
      Controller = Controller.extend({
        removeAction: sinon.spy()
      });

      var req = {
            params: {
              action: 'remove'
            },
            method: 'GET'
          },
          res = {},
          next = function () {};
      var c = new Controller(req, res, next);
      sinon.assert.calledWith(c.removeAction, req, res);
    });

    it('should set .action to name of action method', function () {
      Controller = Controller.extend({
        removeAction: sinon.spy()
      });

      var req = {
            params: {
              action: 'remove'
            },
            method: 'GET'
          },
          res = {},
          next = function () {};
      var c = new Controller(req, res, next);
      c.action.should.equal('removeAction');
    });

    it('should not call action by req.params.action if .actionsEnabled is false', function () {
      var Ctrl = Controller.extend({
        actionsEnabled: false
      }, {
        getAction: null,
        listAction: null,
        removeAction: sinon.spy()
      });

      var req = {
            params: {
              action: 'remove'
            },
            method: 'GET'
          },
          res = {},
          next = sinon.spy();
      var c = new Ctrl(req, res, next);
      c.removeAction.called.should.be.false;
      next.called.should.be.true;
    });

    it('should not call action by HTTP method if .httpMethodsEnabled is false', function () {
      var Ctrl = Controller.extend({
        httpMethodsEnabled: false
      }, {
        getAction: sinon.spy(),
        listAction: null
      });

      var req = {
            params: {},
            method: 'GET'
          },
          res = {},
          next = sinon.spy();
      var c = new Ctrl(req, res, next);
      c.getAction.called.should.be.false;
      next.called.should.be.true;
    });

    // do we need this brehaviour?
    it('should set req.params.id from req.params.action if it number');
    it('should call action by parsing URL');
  });

  describe('.send(content, code, type)', function () {
    it('should call res[type] if type is given', function () {
      ctrl.res.jsonp = sinon.spy();
      ctrl.send('hello', 200, 'jsonp');
      ctrl.res.jsonp.calledWith(200, 'hello').should.be.true;
    });

    it('should call default response method if type is not given', function () {
      ctrl.res.jsonp = sinon.spy();
      ctrl.resFunc = 'jsonp';
      ctrl.send('hello', 200);
      ctrl.res.jsonp.calledWith(200, 'hello').should.be.true;
    });

    it('should call response function without code if it is not given', function () {
      ctrl.res.json = sinon.spy();
      ctrl.send('hello');
      ctrl.res.json.calledWith('hello').should.be.true;
    });
  });

  describe('.render(template, data)', function () {
    it('should call .res.render(template, data)', function () {
      var data = {};
      ctrl.res.render = sinon.spy();
      ctrl.render('hello', data);
      ctrl.res.render.calledWith('hello', data).should.be.true;
    });
  });

  describe('.handleException(exception)', function () {
    it('should .send() with error info', function () {
      ctrl.send = sinon.spy();
      var e = new Error('hello');
      ctrl.handleException(e);
      ctrl.send.calledWith({
        error: 'Unhandled exception: ' + e,
        stack: e.stack
      }, 500).should.be.true;
    });
  });

    describe('.listAction()', function () {
        it('should call .send() with all Model instances', function (done) {
            ctrl.send = function (result) {
                result.should.have.length(2);
                done();
            };
            ctrl.listAction();
        });
    });

    describe('.getAction()', function () {
        it('should call .send() with Model instance by id', function (done) {
            ctrl.send = function (result) {
                result.name.should.equal(objs[0].name);
                done();
            };
            ctrl.req.params = {
                id: objs[0].id
            };
            ctrl.getAction();
        });
    });

    describe('.postAction()', function () {
        it('should create new Service', function (done) {
            ctrl.send = function (result) {
                service.findAll().then(function (objs) {
                    objs.should.have.length(3);
                    done();
                }, done);
            };

            ctrl.req.body = {
                name: 'Ross'
            };
            ctrl.postAction();
        });

        it('should call .send() with new Model instance', function (done) {
            ctrl.send = function (result) {
                result.name.should.equal('Ross');
                result.id.should.be.ok;
                done();
            };
            ctrl.req.body = {
                name: 'Ross',
            };
            ctrl.postAction();
        });
    });

    describe('.putAction()', function () {
        it('should update Model instance by id', function (done) {
            ctrl.send = function (result) {
                service.findById(objs[0].id)
                .then(function (obj) {
                    obj.name.should.equal('Ross');
                    done();
                }, done);
            };

            ctrl.req.params = {
                id: objs[0].id
            };
            ctrl.req.body = {
                name: 'Ross'
            };
            ctrl.putAction();
        });

        it('should call .send() with updated Model instance', function (done) {
            ctrl.send = function (result) {
                result.name.should.equal('Ross');
                result.id.should.equal(objs[0].id);
                done();
            };
            ctrl.req.params = {
                id: objs[0].id
            };
            ctrl.req.body = {
                name: 'Ross',
            };
            ctrl.putAction();
        });
    });

    describe('.deleteAction()', function () {
        it('should delete Model instance by id', function (done) {
            ctrl.send = function (result) {
                service.findById(objs[0].id)
                .then(function (obj) {
                    should.exist(obj.deletedAt);
                    done();
                }, done);
            };

            ctrl.req.params = {
                id: objs[0].id
            };
            ctrl.deleteAction();
        });
    });
});
