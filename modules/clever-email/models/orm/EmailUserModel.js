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
            }
        },
        {
            instanceMethods: {
                toJSON: function () {
                    return this.values;
                }
            }
        } );
};
