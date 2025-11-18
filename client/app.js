// client/app.js
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api' : '/api';

// Global store for user's saved/liked IDs (so we can highlight buttons correctly)
let userSavedIds = [];
let userLikedIds = [];

function getToken() { return localStorage.getItem('token'); }

// --- 1. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    checkLoginState();
    
    // Pre-fetch user preferences (likes/saves) if logged in
    if (getToken()) {
        await loadUserPreferences();
    }

    // Route: Home Page
    if (document.getElementById('news-feed')) {
        loadNews(); 
    }
    
    // Route: Article Page
    if (document.getElementById('article-content')) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if(id) loadFullArticle(id);
    }

    // Init Auth Forms
    setupAuthForms();
});

// --- 2. PRE-LOAD USER DATA (To fix button states) ---
async function loadUserPreferences() {
    try {
        const res = await fetch(`${API_URL}/user/profile`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (res.ok) {
            const user = await res.json();
            // Store IDs in global arrays
            userSavedIds = user.savedArticles.map(a => a._id);
            userLikedIds = user.likedArticles.map(a => a._id);
        }
    } catch (err) { console.error("Error loading prefs:", err); }
}

// --- 3. LOAD NEWS FEED ---
async function loadNews(category = '') {
    const feed = document.getElementById('news-feed');
    const title = document.getElementById('page-title');
    if(feed) feed.innerHTML = '<p style="padding:20px;">Loading news...</p>';
    
    if (category) title.innerText = `${category} News`;
    else title.innerText = 'Hot Headlines';

    try {
        const res = await fetch(`${API_URL}/articles`);
        let articles = await res.json();

        if (category) articles = articles.filter(a => a.category === category);
        
        // Search Filter
        const searchQuery = document.getElementById('search-input')?.value.toLowerCase();
        if(searchQuery) {
             articles = articles.filter(a => a.title.toLowerCase().includes(searchQuery));
             title.innerText = `Search Results: "${searchQuery}"`;
        }

        if (articles.length === 0) {
            if(feed) feed.innerHTML = '<p>No articles found.</p>';
            return;
        }

        if(feed) feed.innerHTML = articles.map((article) => createBentoCard(article)).join('');
    } catch (err) {
        console.error(err);
        if(feed) feed.innerHTML = '<p>Failed to load news.</p>';
    }
}

function createBentoCard(article) {
    const img = article.imageUrl || 'https://via.placeholder.com/600x400';
    
    // Check state for icons
    const isLiked = userLikedIds.includes(article._id);
    const isSaved = userSavedIds.includes(article._id);

    return `
        <div class="news-card">
            <div class="card-img-wrap" onclick="goToArticle('${article._id}')" style="cursor:pointer;">
                <img src="${img}" class="card-img" alt="${article.title}">
                <span class="card-category">${article.category}</span>
            </div>
            <div class="card-content" onclick="goToArticle('${article._id}')" style="cursor:pointer;">
                <h3 class="card-title">${article.title}</h3>
                <p class="card-excerpt">${article.excerpt || ''}</p>
            </div>
            <div class="card-actions">
                <div class="action-btn" onclick="handleLike('${article._id}', this)" style="${isLiked ? 'color:#FF6600' : ''}">
                    <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i> <span>${article.likes || 0}</span>
                </div>
                <div class="action-btn" onclick="goToArticle('${article._id}')">
                    <i class="fa-regular fa-comment"></i> <span>${article.comments ? article.comments.length : 0}</span>
                </div>
                <div class="action-btn" onclick="handleSave('${article._id}', this)" style="${isSaved ? 'color:#FF6600' : ''}">
                    <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i> <span>${isSaved ? 'Saved' : 'Save'}</span>
                </div>
            </div>
        </div>
    `;
}

// --- 4. FULL ARTICLE PAGE ---
async function loadFullArticle(id) {
    const container = document.getElementById('article-content');
    try {
        const res = await fetch(`${API_URL}/articles/${id}`);
        const article = await res.json();
        const img = article.imageUrl || 'https://via.placeholder.com/800x400';
        
        // Check logic (is saved/liked?)
        const isLiked = userLikedIds.includes(article._id);
        const isSaved = userSavedIds.includes(article._id);
        
        // Truncation logic
        const isTruncated = article.content && article.content.includes('[+');
        const sourceLink = article.url ? 
            `<a href="${article.url}" target="_blank" class="source-btn">Read Full Story at Source <i class="fa-solid fa-arrow-up-right-from-square"></i></a>` 
            : '';

        // Comments HTML
        const commentsHTML = article.comments && article.comments.length > 0 
            ? article.comments.map(c => `
                <div style="border-bottom:1px solid #eee; padding:15px 0;">
                    <strong style="color:#333;">${c.user}</strong> 
                    <span style="color:#888; font-size:0.8rem; margin-left:10px;">${new Date(c.date).toLocaleDateString()}</span>
                    <p style="margin-top:5px; color:#444;">${c.text}</p>
                </div>
              `).join('') 
            : '<p style="color:#888; font-style:italic;">No comments yet.</p>';

        container.innerHTML = `
            <div class="article-view">
                <span style="color:#FF6600; font-weight:bold; text-transform:uppercase;">${article.category}</span>
                <h1 class="article-headline">${article.title}</h1>
                
                <div class="article-meta-row">
                    <span>By PulsePoint Desk</span>
                    <span>${new Date(article.createdAt).toDateString()}</span>
                    <span><i class="fa-regular fa-eye"></i> ${article.views || 0} Reads</span>
                </div>

                <img src="${img}" class="article-hero-img">

                <div class="article-text">
                    <p>${article.content}</p>
                    
                    ${isTruncated ? `
                        <div style="background:#f9f9f9; padding:30px; margin-top:40px; border-left:5px solid #FF6600; border-radius:4px;">
                            <h3>Continue Reading</h3>
                            <p>This article is syndicated. Read the full story at the publisher:</p>
                            ${sourceLink}
                        </div>
                    ` : ''}
                </div>

                <div style="margin-top:50px; padding:30px 0; border-top:4px solid #000; border-bottom:1px solid #eee;">
                    <h3 style="margin-bottom:20px;">Interaction</h3>
                    <div style="display:flex; gap:20px;">
                        <button onclick="handleLike('${article._id}', this)" class="action-btn" style="font-size:1.1rem; ${isLiked ? 'color:#FF6600' : ''}">
                            <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i> <span>${article.likes || 0} Likes</span>
                        </button>
                        <button onclick="handleSave('${article._id}', this)" class="action-btn" style="font-size:1.1rem; ${isSaved ? 'color:#FF6600' : ''}">
                            <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i> <span>${isSaved ? 'Saved' : 'Save Article'}</span>
                        </button>
                    </div>
                </div>

                <div style="margin-top:40px;">
                    <h3>Comments (${article.comments ? article.comments.length : 0})</h3>
                    
                    <div style="margin-bottom:30px; background:#f9f9f9; padding:20px; border-radius:8px; margin-top:15px;">
                        <textarea id="comment-text" placeholder="Share your thoughts..." style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px; min-height:80px;"></textarea>
                        <button onclick="postComment('${article._id}')" style="margin-top:10px; background:#FF6600; color:white; border:none; padding:10px 20px; border-radius:4px; cursor:pointer; font-weight:bold;">Post Comment</button>
                    </div>

                    <div id="comments-list">
                        ${commentsHTML}
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        container.innerHTML = '<p>Article not found.</p>';
    }
}

// --- 5. ACTIONS (SAVE / LIKE / COMMENT) ---

// NEW SAVE LOGIC (No Alerts, Toggle Text)
async function handleSave(id, btn) {
    if(!getToken()) return alert("Please login to save");

    try {
        const res = await fetch(`${API_URL}/user/save/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if(res.ok) {
            const icon = btn.querySelector('i');
            const text = btn.querySelector('span');

            // Toggle Logic
            if(icon.classList.contains('fa-regular')) {
                // Saving...
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
                btn.style.color = '#FF6600';
                text.innerText = btn.innerText.includes('Article') ? 'Saved' : 'Saved'; 
            } else {
                // Unsaving...
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
                btn.style.color = '#333'; // Reset color
                text.innerText = btn.innerText.includes('Article') ? 'Save Article' : 'Save';
            }
            // NO ALERT!
        }
    } catch(err) { console.error(err); }
}

async function handleLike(id, btn) {
    if(!getToken()) return alert("Please login to like");

    try {
        const res = await fetch(`${API_URL}/articles/${id}/like`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();
        
        const icon = btn.querySelector('i');
        const text = btn.querySelector('span');
        text.innerText = `${data.likes} ${text.innerText.includes('Likes') ? 'Likes' : ''}`;
        
        if(data.liked) {
            icon.classList.remove('fa-regular'); icon.classList.add('fa-solid'); btn.style.color = '#FF6600';
        } else {
            icon.classList.remove('fa-solid'); icon.classList.add('fa-regular'); btn.style.color = '#333';
        }
    } catch(err) { console.error(err); }
}

async function postComment(id) {
    if(!getToken()) return alert("Please login to comment");
    
    const text = document.getElementById('comment-text').value;
    if(!text) return alert("Please write a comment!");

    try {
        const res = await fetch(`${API_URL}/articles/${id}/comment`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ text })
        });

        if(res.ok) {
            // Reload to see new comment immediately
            window.location.reload();
        } else {
            alert("Failed to post comment");
        }
    } catch(err) { console.error(err); }
}

// --- 6. PROFILE PAGE ---
async function loadProfile() {
    if(!getToken()) { window.location.href = 'login.html'; return; }
    try {
        const res = await fetch(`${API_URL}/user/profile`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const user = await res.json();
        document.getElementById('profile-name').innerText = `Hello, ${user.name}`;
        
        // Load saved IDs so buttons look correct inside the profile too
        userSavedIds = user.savedArticles.map(a => a._id);
        userLikedIds = user.likedArticles.map(a => a._id);

        const feed = document.getElementById('saved-feed');
        if(!user.savedArticles || user.savedArticles.length === 0) {
            feed.innerHTML = `<p style="padding:20px; color:#777;">You haven't saved any articles yet.</p>`;
        } else {
            feed.innerHTML = user.savedArticles.map(article => createBentoCard(article)).join('');
        }
    } catch(err) { console.error(err); }
}

// --- 7. SETUP FORMS ---
function setupAuthForms() {
    const loginForm = document.getElementById('login-form');
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({email, password})
                });
                const data = await res.json();
                if(res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', data.user.name);
                    window.location.href = 'index.html';
                } else alert(data.msg || 'Login failed');
            } catch(err) { console.error(err); }
        });
    }

    const regForm = document.getElementById('reg-form');
    if(regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({name, email, password})
                });
                const data = await res.json();
                if(res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', data.user.name);
                    window.location.href = 'index.html';
                } else alert(data.msg || 'Registration failed');
            } catch(err) { console.error(err); }
        });
    }
}

function checkLoginState() {
    const token = getToken();
    const authContainer = document.getElementById('auth-buttons');
    if (token && authContainer) {
        const name = localStorage.getItem('username') || 'User';
        authContainer.innerHTML = `
            <a href="profile.html" class="btn-auth btn-login" style="background:#f4f4f4;">
                <i class="fa-solid fa-user"></i> ${name}
            </a>
        `;
    }
}

function logout() { localStorage.clear(); window.location.href = 'index.html'; }
function loadCategory(cat) { loadNews(cat); }
function goToArticle(id) { window.location.href = `article.html?id=${id}`; }

// Search
const searchInput = document.getElementById('search-input');
if(searchInput) {
    searchInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') loadNews(); });
}