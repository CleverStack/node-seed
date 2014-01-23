module.exports = function ( sequelize, DataTypes ) {
    return sequelize.define( "Email",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            subject: {
                type: DataTypes.STRING,
                allowNull: false
            },
            body: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            isDelivered: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                default: true
            },
            sentAttemps: {
                type: DataTypes.INTEGER,
                allowNull: false,
                default: 0
            },
            isOpened: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                default: false
            },
            token: {
                type: DataTypes.STRING,
                allowNull: true
            },
            dump: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            EmailTemplateId : {
                type: DataTypes.INTEGER
            },
            UserId : {
                type: DataTypes.INTEGER
            },
            AccountId : {
                type: DataTypes.INTEGER
            }

        },
        {
            paranoid: true,
            instanceMethods: {
                toJSON: function () {
                    var values = this.values
                      , userData = {};

                    if ( values.user && values.user.id ) {
                        userData = {
                            id: values.user.id,
                            firstName: values.user.firstname,
                            lastName: values.user.lastname,
                            fullName: values.user.fullName,
                            email: values.user.email,
                            source: values.user.source
                        };

                        values.user = userData;
                    }

                    if ( values.dump ) {
                        values.dump = JSON.parse( JSON.stringify( values.dump ) );
                    }

                    return values;
                }
        }
        } );
};