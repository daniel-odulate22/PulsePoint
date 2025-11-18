const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const { startNewsAggregator } = require('./services/newsAggregator');

// --- 1. EXPLICITLY IMPORT ROUTES ---
// If these files are missing or broken, the server will crash here with a clear error.
const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const userRoutes = require('./routes/user');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- 2. DEBUG MIDDLEWARE ---
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
    startNewsAggregator();
  } catch (err) {
    console.error('❌ DB Error:', err);
    process.exit(1);
  }
};
connectDB();

// --- 3. MOUNT ROUTES ---
// This connects the imported files to the URLs
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => res.send('PulsePoint API is Running'));

app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));