module.exports = function( sequelize, DataTypes ) {
    return sequelize.define("Test", {
        name: DataTypes.STRING
    },
    {
        paranoid: true
    });
};