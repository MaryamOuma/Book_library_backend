// server/models/Book.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const BookSchema = new Schema({
  bookname: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Book = mongoose.model('book', BookSchema);
