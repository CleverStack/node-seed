var config = require( '../config' );

module.exports = config.mongo ? require( './odm/Country' ) : require( './orm/Country' );