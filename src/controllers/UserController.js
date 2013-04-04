var crypto = require('crypto');

module.exports = function(UserModel, RoleModel) {
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
			UserModel.findAll()
				.success(this.proxy('send'))
				.fail(this.proxy('handleException'));
		},

		getAction: function() {
			UserModel.find(this.req.params.id)
				.success(this.proxy('send'))
				.fail(this.proxy('handleException'));
		},

		postAction: function() {
			UserModel.create(this.req.body)
				.success(this.proxy('send'))
				.fail(this.proxy('handleException'));
		},

		putAction: function() {
			UserModel.update(this.req.body)
				.success(this.proxy('send'))
				.fail(this.proxy('handleException'));
		},

		loginAction: function() {
			var credentials = {
				username: this.req.body.username,
				password: crypto.createHash('sha1').update(credentials.password).digest('hex')
			}

			UserModel.find({ where: credentials })
				.success(this.proxy('authorizedUser'))
				.error(this.proxy('handleException'));
		},

		authorizedUser: function(user) {
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