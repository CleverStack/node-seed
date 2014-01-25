module.exports = function ( sequelize, DataTypes ) {
    return sequelize.define( "EmailUser",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            status: {
                type: DataTypes.ENUM,
                values: ['cc', 'bcc'],
                allowNull: false
            },
            EmailId: {
                type: DataTypes.INTEGER
            },
            UserId: {
                type: DataTypes.INTEGER
            }
        },
        {
            paranoid: true,
            instanceMethods: {
                toJSON: function () {
                    return this.values;
                }
            }
        } );
};