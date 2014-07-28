module.exports = function ( Model ) {
    return Model.extend( 'Test',
    {
        type: 'ORM',
        softDeletable: true,
        timeStampable: true
    },
    {
        id: {
            type: Number,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: String,
            required: true
        }
    });
};