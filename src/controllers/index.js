module.exports = function( sequelize, config ) {
    var exports = {},
        m = {};

    // Add them to exports
    config.controllers.forEach( function(ctrl, i) {
        //console.log("Importing "+model);
        m[ctrl] = sequelize.import( __dirname + '/' + ctrl );
    });

    // Define relationships
    config.controllers.forEach( function(ctrlName) {
        //console.log("Defining relationships for "+ctrlName);
        if ( typeof config.modelAssociations[ctrlName] !== 'undefined' ) {
            Object.keys( config.modelAssociations[ctrlName] ).forEach( function( assocType ) {
                var associatedWith = config.modelAssociations[ctrlName][assocType];
                if ( ! associatedWith instanceof Array ) {
                    associatedWith = [ associatedWith ];
                }

                associatedWith.forEach( function(assocTo) {
                    //console.log(ctrlName+" "+assocType+" of "+assocTo);
                    // Support second argument
                    if ( assocTo instanceof Array ) {
                        //console.log([ctrlName, assocType, assocTo[0]].join(' '), assocTo[1]);
                        m[ ctrlName ][ assocType ]( m[ assocTo[0] ], assocTo[1] );
                    } else {
                        //console.log([ctrlName, assocType, assocTo].join(' '));
                        m[ ctrlName ][ assocType ]( m[ assocTo ] );
                    }
                });
            });
        } else {
            throw ctrlName + ' cannot be found in modelAssocations scope';
        }
    });

    return m;
};
