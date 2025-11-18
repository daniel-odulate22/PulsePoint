const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// GET PROFILE (Populate saved articles)
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('savedArticles'); // This turns IDs into actual Article data
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// SAVE ARTICLE TOGGLE
router.put('/save/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const articleId = req.params.id;

    // Check if already saved
    if (user.savedArticles.includes(articleId)) {
      user.savedArticles = user.savedArticles.filter(id => id.toString() !== articleId); // Remove
    } else {
      user.savedArticles.push(articleId); // Add
    }

    await user.save();
    res.json(user.savedArticles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;