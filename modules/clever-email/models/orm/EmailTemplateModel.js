module.exports = function ( sequelize, DataTypes ) {
    return sequelize.define( "EmailTemplate",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: [ 2, 256 ]
                }
            },
            subject: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: [ 2, 256 ]
                }
            },
            body: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                default: false
            },
            isDefault: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                default: false
            },
            useDefault: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                default: false
            },
            hasPermission: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                default: true
            }
        },
        {
            instanceMethods: {
                toJSON: function () {
                    var values = this.values;
                    values['permittedToUsers'] = [];
                    values['permittedToTeams'] = [];

                    delete hasPermission;

                    function uniqueValues( arr, attr ) {
                        var o = {}, i, l = arr.length, r = [];
                        for ( i = 0; i < l; i += 1 ) o[arr[i][attr]] = arr[i];
                        for ( i in o ) r.push( o[i] );
                        return r;
                    }

                    if ( values['users'] && values['users'].length ) {
                        values['permittedToUsers'] = uniqueValues( values['users'], 'id' ).map( function ( user ) {
                            return user.id;
                        } );
                        delete values['users'];
                    }

                    if ( values['teams'] && values['teams'].length ) {
                        values['permittedToTeams'] = uniqueValues( values['teams'], 'id' ).map( function ( team ) {
                            return team.id;
                        } );
                        delete values['teams'];
                    }

                    return values;
                }
            }
        } );
};
