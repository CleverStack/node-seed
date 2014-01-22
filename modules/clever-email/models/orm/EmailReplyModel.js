module.exports = function ( sequelize, DataTypes ) {
    return sequelize.define( "EmailReply",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            reply: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            from: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            to: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            token: {
                type: DataTypes.STRING,
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
            dump: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            EmailId: {
                type: DataTypes.INTEGER
            }
        },
        {
            paranoid: true,
            instanceMethods: {
                toJSON: function () {
                    var values = this.values;

                    if ( values.dump ) {
                        values.dump = JSON.parse( values.dump );
                    }

                    return value
                }
        }
    } );
};