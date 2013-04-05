var crypto = require('crypto');

module.exports = function(UserService) {
	return (require('./../classes/Controller.js')).extend(
	{
		requiresLogin: function(req, res, next) {
			if (!req.session.user)
				return res.send(401);
			next();
		},

		requiresRole: function(roleName) {
			return function(req, res, next) {
				if (!req.session.user ||
					!req.session.user.roles ||
					req.session.user.roles.indexOf(roleName) === -1)
					return res.send(401);
				next();
			};
		}
	},
	{
		listAction: function() {
			UserService.findAll()
				.then(this.proxy('send'))
				.fail(this.proxy('handleException'));
		},

		getAction: function() {
			UserService.findById(this.req.params.id)
				.then(this.proxy('send'))
				.fail(this.proxy('handleException'));
		},

		postAction: function() {
			UserService.create(this.req.body)
				.then(this.proxy('send'))
				.fail(this.proxy('handleException'));
		},

		putAction: function() {
			UserService.update(this.req.body)
				.then(this.proxy('send'))
				.fail(this.proxy('handleException'));
		},

		loginAction: function() {
			var credentials = {
				username: this.req.body.username,
				password: crypto.createHash('sha1').update(this.req.body.password).digest('hex')
			}

			UserService.authenticate(credentials)
				.then(this.proxy('authorizedUser'))
				.fail(this.proxy('handleException'));
		},

		authorizedUser: function(user) {
			console.dir(user);
			if (user) {
				this.req.session.user = user;
				this.res.send(200);	
			} else {
				this.res.send(403);
			}
		},

		logoutAction: function() {
			this.req.session.user = null;
			this.res.send(200);
		}
	});
};