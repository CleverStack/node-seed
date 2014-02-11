module.exports = function ( sequelize, DataTypes ) {
    return sequelize.define( "UserDropbox",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true
                }
            },
            firstname: {
                type: DataTypes.STRING,
                allowNull: true
            },
            lastname: {
                type: DataTypes.STRING,
                allowNull: true
            },
            dropboxid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            link: {
                type: DataTypes.STRING,
                allowNull: true
            },
            locale: {
                type: DataTypes.STRING,
                allowNull: true
            },
            token: {
                type: DataTypes.STRING,
                allowNull: false
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