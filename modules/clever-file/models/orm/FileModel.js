module.exports = function ( sequelize, DataTypes ) {
    return sequelize.define( "File",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            url: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false
            },
            size: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            lastModified: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        },
        {
            paranoid: true,
            instanceMethods: {
                toJSON: function () {
                    var values = this.values;
                    delete values.updatedAt;
                    return values;
                }
            }
        } );
};