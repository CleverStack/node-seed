module.exports = function ( sequelize, DataTypes ) {
    return sequelize.define ( "SurveyQuestion",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            title: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            value: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            placeholder: {
                type: DataTypes.STRING,
                allowNull: true
            },
            fieldType: {
                type: DataTypes.STRING,
                allowNull: true
            },
            isMultiple: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                default: false
            },
            isAutoGrade: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                default: false
            },
            orderNum: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            points: {
                type: DataTypes.INTEGER,
                allowNull: true
            }
        },
        {
            instanceMethods: {
                toJSON: function () {
                    var values = this.values;

                    delete values.updatedAt;
                    delete values.createdAt;

                    values.value = JSON.parse ( values.value );

                    return values;
                }
            }
        } );
};