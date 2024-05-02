const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: {type:String, required:true},
    author: {type:String, required:true},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
})

const Book =  mongoose.model('Book', BookSchema);

module.exports = Book;