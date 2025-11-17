// server/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the Mongoose User model
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // We need this for login

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = await User.create({
      name,
      email,
      password,
    });

    // Don't send the password back
    const safeUser = { id: user._id, name: user.name, email: user.email };
    res.status(201).json({ user: safeUser });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Use the comparePassword method we defined in the model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    const safeUser = { id: user._id, name: user.name, email: user.email };
    res.json({ token, user: safeUser });

  } catch (err){ 
    console.error(err); res.status(500).json({ message: 'Server error' });
 } });

  module.exports = router;