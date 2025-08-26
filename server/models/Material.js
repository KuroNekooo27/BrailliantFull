const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  title: String,
  author: String,
  genre: String,
  imageUrl: String,
  datePublished: String
});

module.exports = mongoose.model('Material', MaterialSchema);
