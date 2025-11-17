// server/routes/articles.js
const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// Import our new middleware
const { protect } = require('../middleware/authMiddleware');

// --- @route   POST /api/articles ---
// --- @desc    Create a new article ---
// --- @access  Private (we use our 'protect' middleware) ---
router.post('/', protect, async (req, res) => {
  const { title, content, excerpt, category, imageUrl, status } = req.body;

  if (!title || !content || !excerpt || !category) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }

  try {
    const newArticle = new Article({
      title,
      content,
      excerpt,
      category,
      imageUrl: imageUrl || '',
      status: status || 'draft',
      author: req.user._id, // req.user comes from the 'protect' middleware
    });

    const savedArticle = await newArticle.save();
    res.status(201).json(savedArticle);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating article' });
  }
});

// --- @route   GET /api/articles ---
// --- @desc    Get all published articles ---
// --- @access  Public ---
router.get('/', async (req, res) => {
  try {
    // Find all articles that are 'published' and sort by newest
    const articles = await Article.find({ status: 'published' })
      .populate('author', 'name') // Only get the author's name
      .sort({ createdAt: -1 });

    res.status(200).json(articles);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching articles' });
  }
});

// --- @route   GET /api/articles/:id ---
// --- @desc    Get a single article by its ID ---
// --- @access  Public ---
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'name');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Optional: We can add view-counting logic here later

    res.status(200).json(article);

  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
       return res.status(404).json({ message: 'Article not found (invalid ID)' });
    }
    res.status(500).json({ message: 'Server error while fetching article' });
  }
});

// --- @route   GET /api/articles/trending ---
// --- @desc    Get top 5 most viewed articles ---
// --- @access  Public ---
router.get('/trending', async (req, res) => {
  try {
    const trendingArticles = await Article.find({ status: 'published' })
      .sort({ views: -1 }) // Sort by views, descending (most first)
      .limit(5)             // Get only the top 5
      .populate('author', 'name');

    res.status(200).json(trendingArticles);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching trending articles' });
  }
});

module.exports = router;