var User = require('../model/User');

module.exports = function(UserModel) {
	return (require('./../classes/Controller.js')).extend(
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
		}
	});
};