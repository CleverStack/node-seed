module.exports = function( sequelize, config ) {
    var exports = {},
        m = {};

    // Add them to exports
    config.controllers.forEach( function(ctrl, i) {
        //console.log("Importing "+model);
        m[ctrl] = sequelize.import( __dirname + '/' + ctrl );
    });

    // Define relationships
    config.controllers.forEach( function(modelName) {
        //console.log("Defining relationships for "+modelName);
        if ( typeof config.modelAssociations[modelName] !== 'undefined' ) {
            Object.keys( config.modelAssociations[modelName] ).forEach( function( assocType ) {
                var associatedWith = config.modelAssociations[modelName][assocType];
                if ( ! associatedWith instanceof Array ) {
                    associatedWith = [ associatedWith ];
                }

                associatedWith.forEach( function(assocTo) {
                    //console.log(modelName+" "+assocType+" of "+assocTo);
                    // Support second argument
                    if ( assocTo instanceof Array ) {
                        //console.log([modelName, assocType, assocTo[0]].join(' '), assocTo[1]);
                        m[ modelName ][ assocType ]( m[ assocTo[0] ], assocTo[1] );
                    } else {
                        //console.log([modelName, assocType, assocTo].join(' '));
                        m[ modelName ][ assocType ]( m[ assocTo ] );
                    }
                });
            });
        } else {
            throw modelName + ' cannot be found in modelAssocations scope';
        }
    });

    return m;
};
