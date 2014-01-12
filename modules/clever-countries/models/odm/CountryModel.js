module.exports = function ( mongoose ) {
    var ModelSchema = new mongoose.Schema( {
        category: { 
            type: String,
            required: true
        },
        name: { 
            type: String,
            required: true,
            unique: true
        },
        code: { 
            type: String,
            required: true
        }
    },
    {
        autoIndex: true
    });

    return mongoose.model( 'Country', ModelSchema );
};