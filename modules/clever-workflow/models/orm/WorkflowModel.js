var config = require( 'config' )[ 'clever-workflow' ][ 'WorkflowModel' ];

module.exports = function ( sequelize, DataTypes ) {
    return sequelize.define( "Workflow",
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
            type: {
                type: DataTypes.ENUM,
                values: config.default.type.values,
                allowNull: false,
                defaultValue: config.default.type.defaultValue
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            defaultWorkflow: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            swfDomain: {
                type: DataTypes.STRING,
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
            templateWorkflowId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0
            },
            isEditable: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        },
        {
            paranoid: true,
            instanceMethods: {
                toJSON: function () {
                    return this.values;
                }
            }
        } );
};