var config = require( 'config' )[ 'clever-workflow' ][ 'WorkflowStepsModel' ];

module.exports = function ( sequelize, DataTypes ) {
    return sequelize.define( "WorkflowSteps",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            statusType: {
                type: DataTypes.ENUM,
                values: config.default.statusType.values,
                allowNull: false,
                defaultValue: config.default.statusType.defaultValue
            },
            data: {
                type: DataTypes.TEXT,
                allowNull: true,
                defaultValue: null
            },
            swfVersion: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            swfRegistrationCompleted: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            swfRegistrationAttempts: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            position: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        {
            paranoid: true,
            instanceMethods: {
                toJSON: function () {
                    var values = this.values;
                    values.data = JSON.parse( values.data );
                    return values;
                }
            }
        } );
};