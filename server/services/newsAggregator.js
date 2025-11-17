// server/services/newsAggregator.js
const cron = require('node-cron');
const axios = require('axios');
const Article = require('../models/Article');
const User = require('../models/User');

// --- 1. Define All Categories to Fetch ---
// This list maps your frontend categories to NewsAPI's query parameters.
const categoriesToFetch = [
    // Standard Categories
    { name: 'Tech', type: 'category', value: 'technology', country: 'us' },
    { name: 'Sports', type: 'category', value: 'sports', country: 'us' },
    { name: 'Health', type: 'category', value: 'health', country: 'us' },
    { name: 'Business', type: 'category', value: 'business', country: 'us' },
    { name: 'Entertainment', type: 'category', value: 'entertainment', country: 'us' },
    { name: 'Science', type: 'category', value: 'science', country: 'us' },

    // --- 2. Custom & "Missing" Categories ---
    // For "Politics", we use the 'q' (keyword) param, as NewsAPI has no 'politics' category
    { name: 'Politics', type: 'q', value: 'politics', country: 'us' },
    // For "Crime", we also use the 'q' param
    { name: 'Crime', type: 'q', value: 'crime', country: 'us' },

    // --- 3. Country-Specific Category ---
    // This is your "Nigeria" section. It fetches 'general' news for the 'ng' country code.
    { name: 'Nigeria', type: 'category', value: 'general', country: 'ng' }
];

let adminUserId;

// Helper to find the Admin user
const findAdminUser = async () => {
    if (adminUserId) return adminUserId;
    try {
        let user = await User.findOne({ role: 'admin' });
        if (!user) {
            user = await User.findOne(); // Fallback to *any* user
        }
        if (user) {
            adminUserId = user._id;
            console.log(`News Aggregator: Using user "${user.name}" as author.`);
            return adminUserId;
        } else {
            console.error('News Aggregator: No users found. Cannot set author.');
            return null;
        }
    } catch (err) {
        console.error('Error finding admin user:', err.message);
        return null;
    }
};

// --- The Main Function to Fetch News (Now a Loop!) ---
const fetchNews = async () => {
    const authorId = await findAdminUser();
    if (!authorId) {
        console.log('News Aggregator: Stopping. No author user found.');
        return; // Stop if we can't find any user
    }

    console.log('News Aggregator: Starting fetch cycle for all categories...');

    for (const cat of categoriesToFetch) {
        let NEWS_API_URL = '';

        // Build the URL dynamically based on the type
        if (cat.type === 'category') {
            NEWS_API_URL = `https://newsapi.org/v2/top-headlines?country=${cat.country}&category=${cat.value}&apiKey=${process.env.NEWS_API_KEY}`;
        } else if (cat.type === 'q') {
            NEWS_API_URL = `https://newsapi.org/v2/top-headlines?country=${cat.country}&q=${cat.value}&apiKey=${process.env.NEWS_API_KEY}`;
        }

        try {
            const response = await axios.get(NEWS_API_URL);
            const articlesToSave = response.data.articles;
            console.log(`  -> Fetched ${articlesToSave.length} articles for [${cat.name}]`);

            for (const article of articlesToSave) {
                // Check if we already saved this article (by title)
                const existingArticle = await Article.findOne({ title: article.title });

                if (!existingArticle && article.title && article.content && article.description) {
                    const newArticle = new Article({
                        title: article.title,
                        excerpt: article.description,
                        content: article.content,
                        category: cat.name, // <-- This is now DYNAMIC
                        author: authorId,
                        status: 'published',
                        imageUrl: article.urlToImage,
                    });
                    await newArticle.save();
                }
            }
        } catch (err) {
            // Don't stop the whole loop if one category fails
            console.error(`Error fetching or saving news for [${cat.name}]:`, err.message);
        }
    }
};

// --- The Cron Job Scheduler ---
const startNewsAggregator = () => {
    console.log('Starting News Aggregator service...');
    
    // Run once on start-up
    fetchNews(); 
    
    // Then, run every 3 hours (as we discussed)
    // This runs at the 0th minute of every 3rd hour
    cron.schedule('0 */3 * * *', fetchNews);
};

module.exports = { startNewsAggregator };