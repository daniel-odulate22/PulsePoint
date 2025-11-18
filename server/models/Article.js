const mongoose = require('mongoose');

// Comment Schema
const CommentSchema = new mongoose.Schema({
  user: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

// Main Schema
const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  category: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'published' },
  imageUrl: { type: String },
  url: { type: String },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  
  // THIS IS THE KEY PART FOR COMMENTS:
  comments: [CommentSchema] 
}, { timestamps: true });

module.exports = mongoose.model('Article', ArticleSchema);