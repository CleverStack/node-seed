module.exports = function( sequelize, DataTypes ) {
    return sequelize.define("Timezone", {
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
        offset: {
            type: DataTypes.STRING(6),
            allowNull: false
        }
    });
};
