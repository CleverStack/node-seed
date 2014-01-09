module.exports = function ( sequelize, DataTypes ) {
    return sequelize.define( "Country",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            category: {
                type: DataTypes.STRING,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            code: {
                type: DataTypes.STRING,
                allowNull: false
            }
        },
        {
        } );
};
