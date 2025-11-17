const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const {startNewsAggregator} = require('./services/newsAggregator');

// Load environment variables (from .env file)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allows your React frontend to talk to this backend
app.use(express.json()); // Allows the server to accept JSON data

// --- Database Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit process with failure
  }
};

// Run the database connection function
connectDB().then(() => {
  startNewsAggregator(); // Start the news aggregator after DB connection 
});

// --- API Routes ---
app.get('/', (req, res) => {
  res.send('PulsePoint API is running...');
});

app.use('/api/auth', authRoutes); 
app.use('/api/articles', articleRoutes);

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});