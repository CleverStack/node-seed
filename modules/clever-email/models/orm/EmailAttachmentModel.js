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
            mimeType: {
                type: DataTypes.STRING,
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
                    return this.values;
                }
        }
    } );
};