var User = require('../model/User');

module.exports = function(Service) {
	return (require('./../classes/Controller.js')).extend(
	{
		listAction: function() {
			Service.getAll()
				.then(function(users) {
					this.res.send(200, users.map(User.export));
				}.bind(this))
				.fail(this.proxy('handleException'))
		},

		getAction: function() {
			Service.getById(this.req.params.id)
				.then(function(user) {
					this.res.send(200, user.export());
				}.bind(this))
				.fail(this.proxy('handleException'));
		},

		postAction: function() {
			Service.save(User.hydrate(this.req.body))
				.then(function(user) {
					this.res.json(200, user.export());
				}.bind(this))
				.fail(this.proxy('handleException'))
		},

		putAction: function() {
			Service.save(user)
				.then(function(user) {
					this.res.json(200, user.export());
				}.bind(this))
				.fail(this.proxy('handleException'))
		}
	});
};