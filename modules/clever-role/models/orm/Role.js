module.exports = function ( sequelize, DataTypes ) {
    return sequelize.define( "Role", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: [ 2, 32 ]
                }
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true
            }
        },
        {
            instanceMethods: {
                toJSON: function () {
                    var values = this.values;
                    delete values.createdAt;
                    delete values.updatedAt;
                    delete values.AccountId;
                    return values;
                }
            }
        } );
};
