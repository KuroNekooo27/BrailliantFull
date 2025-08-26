const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  author: {
    type: String,
    required: true,
    trim: true,
  },

  datePublished: {
    type: Date,
    required: true,
  },

  genre: {
    type: String,
    required: true,
    trim: true,
  },

  gradeLevel: {
    type: String, // e.g., "Grade 1", "Grade 2"
    required: true,
  },

  picture: {
    type: String, // URL or path to the cover image
    required: false,
  },

  file: {
    type: String, // Path or URL to the Braille or book file (PDF, TXT, etc.)
    required: false,
  },
  
}, {
  timestamps: true,
});

module.exports = mongoose.model('Book', bookSchema);
