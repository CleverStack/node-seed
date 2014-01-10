module.exports = function( sequelize, DataTypes ) {
    return sequelize.define("Example", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        data: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    },
    {
        paranoid: true
    });
};