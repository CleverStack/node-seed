var BadResponseException = require('./../exceptions/BadResponse')
  , BadRequestException = require('./../exceptions/BadRequest')
  , NoActionException = require('./../exceptions/NoAction')
  , Class = require('uberclass');

module.exports = Class.extend(
/* @Static */
{
	actionsEnabled: true,

	httpMethodsEnabled: true,

	bind: function() {
		return this.callback('newInstance');
	}
},
/* @Prototype */
{
	request: null,
	response: null,
	next: null,
	responseType: 'json',

	setup: function(_request, _response, _next) {
		try {
			return this.performanceSafeSetup(_request, _response, _next);
		} catch(e) {
			return [e];
		}
	},

	performanceSafeSetup: function(_request, _response, _next) {
		var method = null;

		this.next = _next;
		this.request = _request;
		this.response = _response;

		if (typeof this.response != 'object')
			throw new BadResponseException('Response is not an object');

		if (typeof this.response.send != 'function')
			throw new BadResponseException('Response does not have a send function');

		if (typeof this.response.json != 'function')
			throw new BadResponseException('Response does not have a json function');

		if (typeof this.request != 'object')
			throw new BadRequestException('Request is not an object');

		if (typeof this.request.method != 'string')
			throw new BadRequestException('Request does not have that HTTP method ' + this.request.method);

		// Route based on an action first if we can
		if (this.Class.actionsEnabled && typeof this.request.params == 'object' && typeof this.request.params.action != 'undefined') {
			if (isNaN(this.request.params.action)) {
				var funcName = this.request.params.action + 'Action';

				if (typeof this[funcName] == 'function') {
					return [null, funcName, _next];
				} else {
					throw new NoActionException('There is no action/function to handle that request');
				}
			} else {
				method = this.request.method.toLowerCase() + 'Action';
				if (typeof this[method] == 'function') {

					// Swap out the action for the ID
					this.request.params.id = this.request.params.action;
					delete this.request.params.action;

					return [null, method, _next];
				} else {
					throw new NoActionException('There is no action/function to handle that request');
				}
			}
		}

		// Route based on the HTTP Method, otherwise throw an exception
		if (this.Class.httpMethodsEnabled) {
			var method = this.request.method.toLowerCase() + 'Action';
			if (typeof this[method] != 'function')
				throw new NoActionException('There is no method (' + method + ') to handle that request');
		}

		// If we got this far without an action but with a method, then route based on that
		return [null, method, _next];
	},

	init: function(_error, _method, _next) {
		if (_error instanceof BadResponseException) {
			delete this;
			throw _error; // as we can't send a respond
		}

		try {
			if (_error)
				throw _error;

			if (_method != null)
				this[_method]();

		} catch(e) {
			this.send(500, e);
		}
	},

	send: function(_code, _content, _type) {
		this.response[_type || this.responseType](_code, _content);
		delete this;
	}
});