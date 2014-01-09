var m = { 'ORM': {}, 'ODM': {} }
  , packageJson = require( '../../package.json' )
  , modulePaths = []
  , path = require( 'path' )
  , fs = require( 'fs' )
  , sequelize = injector.getInstance( 'sequelize' )
  , mongoose = injector.getInstance( 'mongoose' );

packageJson.bundledDependencies.forEach(function( moduleName ) {
    modulePaths.push( [ path.resolve( __dirname + '/../../modules' ), moduleName, 'models', '' ].join( path.sep ) );
});

modulePaths.forEach(function( modulePath ) {
    if ( fs.existsSync( modulePath ) ) {
        fs.readdirSync( modulePath ).forEach(function( file ) {
            if ( file.match(/.+\.js$/g) !== null && file !== 'index.js' && file !== 'module.js' ) {
                var name = file.replace('.js', '');
                var model = require( [ modulePath, file ].join( '' ) );
                if ( model.system === 'ORM' ) {
                    m[ model.system ][ name ] = sequelize.import( name, model.model );
                    m[ model.system ][ name ].ORM = true;
                } else {
                    var schema = model.model ( mongoose );
                    m[ model.system ][ name ] = mongoose.model( name );
                    m[ model.system ][ name ].ODM = true;
                }
            }
        });
    }
});

module.exports = m;