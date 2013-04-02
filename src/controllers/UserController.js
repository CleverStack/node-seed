var User = require('../model/User');

module.exports = function(Service) {
	return (require('./../classes/Controller.js')).extend(
	{
		listAction: function() {
			Service.getAll()
				.then(function(users) {
					this.send(users.map(User.export));
					}.bind(this))
				.fail(this.proxy('handleException'));
		},

		getAction: function() {
			Service.getById(this.req.params.id)
				.then(this.proxy('userExport'))
				.fail(this.proxy('handleException'));
		},

		postAction: function() {
			Service.save(User.hydrate(this.req.body))
				.then(this.proxy('userExport'))
				.fail(this.proxy('handleException'));
		},

		putAction: function() {
			Service.save(user)
				.then(this.proxy('userExport'))
				.fail(this.proxy('handleException'));
		},

		userExport: function(user) {
			this.send(user.export());
		}
	});
};