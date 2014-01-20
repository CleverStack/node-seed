module.exports = function ( sequelize, DataTypes ) {
    return sequelize.define( "EmailAttachment",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            fileName: {
                type: DataTypes.STRING,
                allowNull: true
            },
            filePath: {
                type: DataTypes.STRING,
                allowNull: false
            },
            fileType: {
                type: DataTypes.STRING,
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
