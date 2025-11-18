// server/routes/articles.js
const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const User = require('../models/User'); // <--- CRITICAL IMPORT
const { protect } = require('../middleware/authMiddleware');

// 1. GET ALL ARTICLES
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find({ status: 'published' }).sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. GET TRENDING
router.get('/trending', async (req, res) => {
  try {
    const articles = await Article.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(5);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. GET SINGLE ARTICLE (AND COUNT VIEW)
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    // Increment view count
    article.views = (article.views || 0) + 1;
    await article.save();

    res.json(article);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 4. LIKE ARTICLE
router.put('/:id/like', protect, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    const user = await User.findById(req.user._id);

    // Initialize likes if undefined
    if (!article.likes) article.likes = 0;
    if (!user.likedArticles) user.likedArticles = [];

    // Check if already liked
    const isLiked = user.likedArticles.includes(article._id);

    if (isLiked) {
      article.likes = Math.max(0, article.likes - 1); // Unlike
      user.likedArticles = user.likedArticles.filter(id => id.toString() !== article._id.toString());
    } else {
      article.likes += 1; // Like
      user.likedArticles.push(article._id);
    }

    await article.save();
    await user.save();

    res.json({ likes: article.likes, liked: !isLiked });
  } catch (err) {
    console.error("Like Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 5. POST COMMENT
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const article = await Article.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!article) return res.status(404).json({ message: 'Article not found' });

    const newComment = {
      user: user.name, // Store user name
      text: text,
      date: new Date()
    };

    // Add to beginning of array
    article.comments.unshift(newComment);

    await article.save();
    res.json(article.comments);
  } catch (err) {
    console.error("Comment Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;