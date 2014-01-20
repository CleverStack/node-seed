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
            }
        },
        {
            paranoid: true, instanceMethods: {
            toJSON: function () {
                return this.values;
            }
        }
        } );
};
