var countries = require( __dirname + '/Countries.json' )
  , statesUSA = require( __dirname + '/StatesUSA.json' )
  , provincesCanada = require( __dirname + '/ProvincesCanada.json' )
  , config = require( '../config' )
  , _ = require( 'lodash' )
  , db = [];

db = config.countries ? _.union( db, countries ) : db;
db = config.statesUSA ? _.union( db, statesUSA ) : db;
db = config.provincesCanada ? _.union( db, provincesCanada ) : db;

module.exports = db;