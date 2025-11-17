# PulsePoint 🌍

PulsePoint is a modern, user-friendly news aggregation platform designed to deliver stories from trusted sources without confusion or bias. It features a classic news portal layout, live trending updates, and categorized news feeds.

![alt text](https://github.com/daniel-odulate22/PulsePoint/blob/master/client/assets/pulsepoint_logo.png)

## 🚀 Features

* **Smart News Aggregation:** Automatically fetches and categorizes top headlines from global sources via NewsAPI.org.
* **Categorized Feeds:** Specialized sections for Tech, Sports, Health, Science, Entertainment, and Nigeria.
* **Trending Engine:** Tracks article views and highlights trending stories in a dedicated "Mosaic" sidebar.
* **Classic News Layout:** Professional, responsive design inspired by top-tier news portals (BBC, NYT).
* **User Accounts:** Secure registration and login system using JWT authentication.
* **Admin Publishing:** (Backend ready) Infrastructure for admins to post, edit, and manage original articles.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Grid/Flexbox), JavaScript (ES6+)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Atlas)
* **External APIs:** NewsAPI.org (for aggregation)

## 📂 Project Structure

```text
PulsePoint/
├── client/             # The Static Frontend
│   ├── index.html      # Home Page
│   ├── style.css       # Global Styles
│   ├── app.js          # Frontend Logic & API Calls
│   └── assets/         # Images & Logos
├── server/             # The Node.js Backend
│   ├── models/         # Database Schemas
│   ├── routes/         # API Endpoints
│   ├── services/       # News Fetching Logic (Cron Jobs)
│   └── server.js       # Entry Point
└── vercel.json         # Deployment Configuration
```


## 🔧 Local Setup

Clone the repository

```
git clone [https://github.com/yourusername/pulsepoint.git](https://github.com/yourusername/pulsepoint.git)
cd pulsepoint
```
# Setup Backend

```
cd server
npm install
```

# Create a .env file and add your MONGO_URI, JWT_SECRET, and NEWS_API_KEY
```
npm start
```
# Run Frontend

# Simply open client/index.html in your browser.
# Or use VS Code "Live Server" extension for the best experience.

## 🔑 Environment Variables
To run this project, you will need to add the following environment variables to your .env file (locally) or Vercel project settings (deployment):

MONGO_URI: Your MongoDB Atlas connection string.

JWT_SECRET: A secret string for signing login tokens.

NEWS_API_KEY: Your API key from newsapi.org.

PORT: (Optional) Defaults to 5000.

© 2025 PulsePoint. All Rights Reserved.