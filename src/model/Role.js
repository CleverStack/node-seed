module.exports = function(sequelize, DataTypes) {
    return sequelize.define("Role", {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING
    }, 
    {
        paranoid: true
    })
}