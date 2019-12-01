const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true }); //este 2do argumento que pasamos a Schema es un objeto que puede configurar
//varias cosas en mongoose, entre ellas que asigne automaticamente timestamps createdAt y ubdatedAt!!

module.exports = mongoose.model('Post', postSchema);