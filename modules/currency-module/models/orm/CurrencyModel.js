module.exports = function( sequelize, DataTypes ) {
    return sequelize.define("Currency", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        code: {
            type: DataTypes.STRING(3),
            allowNull: false,
            unique: true
        }
    });
};
