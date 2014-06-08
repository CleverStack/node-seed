module.exports = function ( Model ) {
    return Model.extend( 'TestObject',
    {
        type: 'ODM',
        softDeletable: true,
        timeStampable: true
    },
    {
        id: {
            type: Number,
            primaryKey: true
        },
        data: String
    });
};