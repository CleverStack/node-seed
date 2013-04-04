module.exports = function(sequelize) {
	var exports = m = {};
	var models = [
		// Define the names of your models here
		'User',
		'Role'
	]

	// Add them to exports
	models.forEach(function(model, i) {
		m[model] = sequelize.import(__dirname + '/' + model);
	})

	// Define relationships
	
	m.User.hasMany(m.Role);
	m.Role.hasMany(m.User);

	return m;
}