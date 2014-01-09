var config = require( '../config' );

module.exports = {
    'model':    config.mongo ? require( './odm/Country' ) : require( './orm/Country' ),
    'system':   config.mongo ? 'ODM' : 'ORM'
};