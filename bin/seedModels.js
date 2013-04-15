var crypto = require('crypto')
  , async = require('async')
  , inflect = require('i')();

// Get the application config
var config = require('./../config');

// Setup ORM
var Sequelize = require('sequelize');
var sequelize = new Sequelize(
    config.db.database,
    config.db.username,
    config.db.password,
    config.db.options
);

// Get our models
var models = require('./../src/model')(sequelize, config);

var seedData = require('./../schema/seedData.json');

var assocMap = {};

async.forEachSeries(
	Object.keys(seedData),
	function forEachModelType(modelName, cb) {
		var ModelType = models[modelName]
		  , Models = seedData[modelName];

		assocMap[modelName] = [];

		async.forEach(
			Models,
			function forEachModel(data, modelCb) {
				ModelType.create(data).success(function(model) {
					console.log('Created ' + modelName);
					assocMap[modelName].push(model);

					if (data.associations !== undefined) {
						var assocLength = Object.keys(data.associations).length,
							called = 0;

						Object.keys(data.associations).forEach(function(assocModelName) {
							var required = data.associations[assocModelName]
							  , associations = [];

							assocMap[assocModelName].forEach(function(m) {
								var isMatched = null;

								Object.keys(required).forEach(function(reqKey) {
									if (isMatched !== false) {
										if (m[reqKey] == required[reqKey]) {
											isMatched = true;
										} else {
											isMatched = false;
										}
									}
								});

								if (isMatched) {
									associations.push(m);
								}
							});

							if (associations.length) {
								var funcName = 'set'+inflect.pluralize(assocModelName);

								console.log('Calling ' + funcName);
								model[funcName](associations).success(function() {
									called++;

									if (called == assocLength)
										modelCb(null);
								}).error(modelCb);
							}
						});
					} else {
						modelCb(null);
					}
				}).error(modelCb);
			},
			function forEachModelComplete(err) {
				cb(err);
			}
		);
	},
	function forEachModelTypeComplete(err) {
		console.log(err ? 'Error: ' : 'Seed completed with no errors', err)
	}
);