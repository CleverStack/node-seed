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
