// app.js
const API_URL = 'http://localhost:5000/api';

/* --- 1. HOME PAGE LOGIC --- */
async function loadNews(category = '') {
    const newsFeed = document.getElementById('news-feed');
    const heroContainer = document.getElementById('hero-container');
    const title = document.getElementById('page-title');
    
    if (!newsFeed) return; // Not on home page

    if (category) title.innerText = `${category} News`;
    
    try {
        // Fetch data
        const res = await fetch(`${API_URL}/articles`);
        let articles = await res.json();

        // Filter if category selected
        if (category) {
            articles = articles.filter(a => a.category === category);
        }

        // Render Hero (First Article)
        if (articles.length > 0) {
            const hero = articles[0];
            renderHero(hero, heroContainer);
            
            // Render Rest (Skip first)
            const rest = articles.slice(1);
            newsFeed.innerHTML = rest.map(article => createNewsCard(article)).join('');
        } else {
            newsFeed.innerHTML = '<p>No articles found.</p>';
        }

    } catch (err) {
        console.error(err);
        newsFeed.innerHTML = '<p>Error loading news.</p>';
    }
}

// Render Sidebar (Trending)
async function loadTrending() {
    const container = document.getElementById('trending-list');
    if (!container) return;

    try {
        const res = await fetch(`${API_URL}/articles/trending`);
        const articles = await res.json();

        container.innerHTML = articles.slice(0, 5).map(article => `
            <div class="trending-item" onclick="goToArticle('${article._id}')">
                <div class="trending-rank"></div>
                <div class="trending-info">
                    <span>${article.category}</span>
                    <h4>${article.title}</h4>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
    }
}

/* --- 2. HTML GENERATORS --- */
function renderHero(article, container) {
    const img = article.imageUrl || 'https://via.placeholder.com/800x400?text=PulsePoint';
    container.innerHTML = `
        <div class="hero-article" onclick="goToArticle('${article._id}')">
            <img src="${img}" class="hero-img" alt="${article.title}">
            <div class="hero-text">
                <span class="hero-category">${article.category}</span>
                <h2 class="hero-title">${article.title}</h2>
                <p class="hero-excerpt">${article.excerpt}</p>
            </div>
        </div>
    `;
}

function createNewsCard(article) {
    const img = article.imageUrl || 'https://via.placeholder.com/300x200?text=PulsePoint';
    return `
        <div class="news-card" onclick="goToArticle('${article._id}')">
            <img src="${img}" alt="${article.title}">
            <div class="news-info">
                <div class="news-meta">
                    <span>${article.category}</span>
                    <span>${new Date(article.createdAt).toLocaleDateString()}</span>
                </div>
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
                <div class="actions">
                    <button class="icon-btn" title="Like">♥</button>
                    <button class="icon-btn" title="Save">🔖</button>
                </div>
            </div>
        </div>
    `;
}

/* --- 3. NAVIGATION & ACTIONS --- */
function goToArticle(id) {
    window.location.href = `article.html?id=${id}`;
}

function loadCategory(cat) {
    loadNews(cat);
}

/* --- 4. ARTICLE DETAIL PAGE --- */
async function loadArticleDetail(id) {
    const container = document.getElementById('article-content');
    try {
        const res = await fetch(`${API_URL}/articles/${id}`);
        const article = await res.json();

        const img = article.imageUrl || 'https://via.placeholder.com/800x400';
        
        container.innerHTML = `
            <div class="article-header">
                <h1>${article.title}</h1>
                <div class="article-meta">
                    <span>By ${article.author?.name || 'PulsePoint Team'}</span>
                    <span>${new Date(article.createdAt).toDateString()}</span>
                </div>
            </div>
            <img src="${img}" class="full-img">
            <div class="article-body">
                <p>${article.content}</p>
            </div>
            <div class="actions" style="margin-top:30px;">
                 <button class="auth-btn" style="width:auto;">Like Article</button>
            </div>
        `;
    } catch (err) {
        container.innerHTML = '<p>Article not found.</p>';
    }
}

/* --- 5. SEARCH --- */
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            alert('Search functionality requires backend update to support query params. Filtering frontend for now...');
            // You can implement frontend filtering here if you fetched all articles
        }
    });
}

/* --- 6. AUTH LOGIC --- */
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-pass').value;
        
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                alert('Login Successful');
                window.location.href = 'index.html';
            } else {
                alert(data.msg || 'Login failed');
            }
        } catch (err) {
            console.error(err);
        }
    });
}

const regForm = document.getElementById('register-form');
if (regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-pass').value;
        
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                alert('Registration Successful');
                window.location.href = 'index.html';
            } else {
                alert(data.msg || 'Failed to register');
            }
        } catch (err) {
            console.error(err);
        }
    });
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadNews(); // Load Home
    loadTrending(); // Load Sidebar
    
    // Check Login Status
    const token = localStorage.getItem('token');
    if(token) {
        const authBtns = document.getElementById('auth-buttons');
        if(authBtns) authBtns.innerHTML = '<button class="btn-auth btn-login" onclick="logout()">Logout</button>';
    }
});

function logout() {
    localStorage.removeItem('token');
    window.location.reload();
}