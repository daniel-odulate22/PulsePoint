// server/models/Article.js
const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
  },
  excerpt: {
    type: String,
    required: [true, 'Please provide an excerpt'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Tech', 'Sports', 'Politics', 'Health', 'Entertainment', 'World', 'Business', 'Science', 'Crime', 'Nigeria'],
  },
  author: {
    // This links the article to the User who wrote it
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This 'User' must match the name you used in mongoose.model('User', ...)
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  imageUrl: {
    type: String,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true // Adds 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model('Article', ArticleSchema);