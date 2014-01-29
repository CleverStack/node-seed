module.exports = function ( sequelize, DataTypes ) {
    return sequelize.define( "Subscription",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                validate: {
                    len: [ 2, 32 ]
                }
            },
            description: {
                type: DataTypes.STRING,
                validate: {
                    len: [ 10, 100 ]
                }

            },
            price: {
                type: DataTypes.DECIMAL( 10, 2 ),
                allowNull: false
            },
            period: {
                type: DataTypes.STRING,
                validate: {
                    len: [ 1, 20 ]
                }
            }

        },
        {} );
};