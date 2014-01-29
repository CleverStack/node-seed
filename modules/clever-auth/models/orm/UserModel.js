module.exports = function ( sequelize, DataTypes ) {
    return sequelize.define( "User",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            title: {
                type: DataTypes.STRING,
                allowNull: true
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true
                }
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            firstname: {
                type: DataTypes.STRING,
                allowNull: true
            },
            lastname: {
                type: DataTypes.STRING,
                allowNull: true
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true
            },
            confirmed: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            hasAdminRight: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            accessedAt: {
                type: DataTypes.DATE
            }
        },
        {
            paranoid: true,
            getterMethods: {
                fullName: function () {
                    return [ this.getDataValue( 'firstname' ), this.getDataValue( 'lastname' )].join( ' ' );
                }
            },
            instanceMethods: {
                toJSON: function () {
                    var values = this.values;
                    values.fullName = this.fullName;
                    delete values.password;
                    return values;
                }
            }
        } );
};