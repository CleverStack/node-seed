module.exports = function ( sequelize, DataTypes ) {
    return sequelize.define( "UserGoogle",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            token: {
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
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true
                }
            },
            googleid: {
                type: DataTypes.STRING,
                allowNull: false
            },
            picture: {
                type: DataTypes.STRING,
                allowNull: true
            },
            link: {
                type: DataTypes.STRING,
                allowNull: true
            },
            gender: {
                type: DataTypes.STRING,
                allowNull: true,
                values: [ 'male', 'female' ]
            },
            locale: {
                type: DataTypes.STRING,
                allowNull: true
            },
            verified: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: false
            },
            accessedAt: {
                type: DataTypes.DATE
            },
            UserId: {
                type: DataTypes.INTEGER
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
                    delete values.token;
                    return values;
                }
            }
        } );
};