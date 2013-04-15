var NoActionException = require('./../exceptions/NoAction'),
    Class = require('uberclass');

module.exports = Class.extend(
/* @Static */
{
    actionsEnabled: true,

    httpMethodsEnabled: true,

    attach: function() {
        return this.callback('newInstance');
    }
},
/* @Prototype */
{
    req: null,
    res: null,
    next: null,
    resFunc: 'json',
    action: null,

    setup: function(req, res, next) {
        try {
            return this.performanceSafeSetup(req, res, next);
        } catch(e) {
            return [e];
        }
    },

    performanceSafeSetup: function(req, res, next) {
        var method = null,
            funcName = null;

        this.next = next;
        this.req = req;
        this.res = res;

        // Override routes where you attach specifically to a single route
        if (this.Class.actionsEnabled && /\//.test(this.req.url)) {
            funcName = this.req.url.split('/')[2];
            if (isNaN(funcName)) {
                funcName = funcName + 'Action';
                if (typeof this[funcName] == 'function') {
                    return [null, funcName, next];
                }
            }
        }

        // Route based on an action first if we can
        if (this.Class.actionsEnabled && typeof this.req.params.action != 'undefined') {
            // Action Defined Routing
            if (isNaN(this.req.params.action)) {
                funcName = this.req.params.action + 'Action';

                if (typeof this[funcName] == 'function') {
                    return [null, funcName, next];
                } else {
                    throw new NoActionException();
                }
            } else {
                // HTTP Method Based Routing
                method = this.req.method.toLowerCase() + 'Action';
                if (typeof this[method] == 'function') {

                    this.req.params.id = this.req.params.action;
                    delete this.req.params.action;

                    return [null, method, next];
                } else {
                    throw new NoActionException();
                }
            }
        }

        // Route based on the HTTP Method, otherwise throw an exception
        if (this.Class.httpMethodsEnabled) {
            if (this.isGet() && (this.req.params === undefined || this.req.params.id === undefined) && typeof this.listAction == 'function') {
                method = 'listAction';
            } else {
                method = this.req.method.toLowerCase() + 'Action';
                if (typeof this[method] != 'function') {
                    throw new NoActionException();
                }
            }
        }

        // If we got this far without an action but with a method, then route based on that
        return [null, method, next];
    },

    init: function(error, method, next) {
        if (error && error instanceof NoActionException) {
            this.next();
        } else {
            try {
                if (error)
                    throw error;

                if (method !== null) {
                    this.action = method;
                    this[method](this.req, this.res);
                } else {
                    this.next();
                }

            } catch(e) {
                this.handleException(e);
            }
        }
    },

    send: function(content, code, type) {
        var toCall = type || this.resFunc;
        if (code) {
            this.res[toCall](code, content);
        } else {
            this.res[toCall](content);
        }
    },

    render: function(template, data) {
        this.res.render(template, data);
    },

    handleException: function(exception) {
        this.send({ error: 'Unhandled exception: ' + exception, stack: exception.stack }, 500);
    },

    isGet: function() {
        return this.req.method.toLowerCase() == 'get';
    },

    isPost: function() {
        return this.req.method.toLowerCase() == 'post';
    },

    isPut: function() {
        return this.req.method.toLowerCase() == 'put';
    }
});