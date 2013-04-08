module.exports = function(sequelize, config) {
	var exports = m = {};

	// Add them to exports
	config.models.forEach(function(model, i) {
		m[model] = sequelize.import(__dirname + '/' + model);
	})

	// Define relationships
	config.models.forEach(function(modelName) {
		if (config.modelAssociations[modelName] != undefined) {
			Object.keys(config.modelAssociations[modelName]).forEach(function(assocType) {
				var associatedWith = config.modelAssociations[modelName][assocType];
				if (!associatedWith instanceof Array) {
					associatedWith = [associatedWith];
				}

				associatedWith.forEach(function(assocTo) {
					// Support second argument
					if (assocTo instanceof Array) {
						// console.log([modelName, assocType, assocTo[1]].join(' '));
						m[modelName][assocType](m[assocTo[0]], assocTo[1]);
					} else {
						// console.log([modelName, assocType, assocTo].join(' '));
						m[modelName][assocType](m[assocTo]);
					}
				})
			})
		}
	});

	return m;
}