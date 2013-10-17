var fs = require( 'fs' )
  , m = module.exports = { ORM: {}, ODM: {} };

injector.inject(function( sequelize, config, mongoose ) {
    
    if ( config.orm ) {
        //load ORM models
        config.orm.models.forEach( function( model, i ) {

            if ( fs.existsSync( __dirname + '/' + 'orm' + '/' + model + '.js' ) ) {
                m['ORM'][model] = sequelize.import( __dirname + '/' + 'orm' + '/' + model );
                m['ORM'][model].ORM = true;

                // Define relationships
                if ( typeof config.orm.modelAssociations[model] !== 'undefined' ) {
                    Object.keys( config.orm.modelAssociations[model] ).forEach( function( assocType ) {
                        var associatedWith = config.orm.modelAssociations[model][assocType];
                        if ( ! associatedWith instanceof Array ) {
                            associatedWith = [ associatedWith ];
                        }

                        associatedWith.forEach( function(assocTo) {
                            //console.log(modelName+" "+assocType+" of "+assocTo);
                            // Support second argument
                            if ( assocTo instanceof Array ) {
                                //console.log([modelName, assocType, assocTo[0]].join(' '), assocTo[1]);
                                m['ORM'][ model ][ assocType ]( m[ assocTo[0] ], assocTo[1] );
                            } else {
                                //console.log([modelName, assocType, assocTo].join(' '));
                                m['ORM'][ model ][ assocType ]( m[ assocTo ] );
                            }
                        });
                    });
                } else {
                    throw model + ' cannot be found in modelAssocations scope';
                }
            }
        });
    }

    if ( config.odm ) {
        // load ODM models
        config.odm.models.forEach( function( model, i ) {
            if ( fs.existsSync( __dirname + '/' + 'odm' + '/' + model + '.js' ) ) {
                m['ODM'][model] = require(__dirname + '/' + 'odm' + '/' + model)(mongoose);
                m['ODM'][model].ODM = true;
            }            
        });
    } 

    return m;
});
