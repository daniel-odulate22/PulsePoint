// app.js
const API_URL = 'http://localhost:5000/api';

// --- 1. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();
    
    // If on index.html (Feed exists)
    if (document.getElementById('news-feed')) {
        loadNews(); 
    }
    
    // If on article.html (Content exists)
    if (document.getElementById('article-content')) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if(id) loadFullArticle(id);
    }
});

// --- 2. LOAD NEWS (Bento Grid) ---
async function loadNews(category = '') {
    const feed = document.getElementById('news-feed');
    const title = document.getElementById('page-title');

    feed.innerHTML = '<p style="padding:20px;">Loading news...</p>';
    
    if (category) title.innerText = `${category} News`;
    else title.innerText = 'Hot Headlines';

    try {
        const res = await fetch(`${API_URL}/articles`);
        let articles = await res.json();

        // Client-side filtering
        if (category) {
            articles = articles.filter(a => a.category === category);
        }

        // Client-side Search filtering
        const searchQuery = document.getElementById('search-input')?.value.toLowerCase();
        if(searchQuery) {
             articles = articles.filter(a => a.title.toLowerCase().includes(searchQuery));
             title.innerText = `Search Results: "${searchQuery}"`;
        }

        if (articles.length === 0) {
            feed.innerHTML = '<p>No articles found.</p>';
            return;
        }

        feed.innerHTML = articles.map((article) => createBentoCard(article)).join('');

    } catch (err) {
        console.error(err);
        feed.innerHTML = '<p>Failed to load news. Is the server running?</p>';
    }
}

function createBentoCard(article) {
    const img = article.imageUrl || 'https://via.placeholder.com/600x400?text=PulsePoint';
    const comments = Math.floor(Math.random() * 50); // Demo data
    
    return `
        <div class="news-card">
            <span class="card-category">${article.category}</span>
            <div class="card-img-wrap" onclick="goToArticle('${article._id}')" style="cursor:pointer;">
                <img src="${img}" class="card-img" alt="${article.title}">
            </div>
            <div class="card-content" onclick="goToArticle('${article._id}')" style="cursor:pointer;">
                <h3 class="card-title">${article.title}</h3>
                <p class="card-excerpt">${article.excerpt || ''}</p>
            </div>
            <div class="card-actions">
                <div class="action-btn" onclick="toggleLike(this)">
                    <i class="fa-regular fa-heart"></i> <span>Like</span>
                </div>
                <div class="action-btn">
                    <i class="fa-regular fa-comment"></i> <span>${comments}</span>
                </div>
                <div class="action-btn" onclick="toggleSave(this)">
                    <i class="fa-regular fa-bookmark"></i> <span>Save</span>
                </div>
            </div>
        </div>
    `;
}

// --- 3. FULL ARTICLE PAGE (Handling Truncation) ---
async function loadFullArticle(id) {
    const container = document.getElementById('article-content');
    try {
        const res = await fetch(`${API_URL}/articles/${id}`);
        const article = await res.json();
        const img = article.imageUrl || 'https://via.placeholder.com/800x400';
        
        // Check if text is truncated (common with NewsAPI)
        // NewsAPI usually ends content with chars like "[+1234 chars]"
        const isTruncated = article.content && article.content.includes('[+');
        
        container.innerHTML = `
            <div class="article-view">
                <span style="color:#FF6600; font-weight:bold; text-transform:uppercase;">${article.category}</span>
                <h1 class="article-headline">${article.title}</h1>
                
                <div class="article-meta-row">
                    <span><i class="fa-solid fa-pen-nib"></i> PulsePoint Desk</span>
                    <span><i class="fa-regular fa-calendar"></i> ${new Date(article.createdAt).toDateString()}</span>
                    <span><i class="fa-regular fa-eye"></i> ${article.views} Reads</span>
                </div>

                <img src="${img}" class="article-hero-img">

                <div class="article-text">
                    <p>${article.content}</p>
                    
                    ${isTruncated ? `
                        <div style="background:#f9f9f9; padding:30px; margin-top:40px; border-left:5px solid #FF6600; border-radius:4px;">
                            <h3>Continue Reading</h3>
                            <p>This article is from an external source. Read the full story at the original publisher.</p>
                            <a href="${article.url || '#'}" target="_blank" class="source-btn">
                                Read Full Story <i class="fa-solid fa-arrow-up-right-from-square"></i>
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    } catch (err) {
        container.innerHTML = '<p>Article not found.</p>';
    }
}

// --- 4. ACTIONS & UTILS ---
function toggleLike(btn) {
    const icon = btn.querySelector('i');
    if (icon.classList.contains('fa-regular')) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        btn.style.color = '#FF6600';
    } else {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        btn.style.color = '#888';
    }
}

function toggleSave(btn) {
    const icon = btn.querySelector('i');
    if (icon.classList.contains('fa-regular')) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid'); 
        btn.style.color = '#FF6600';
    } else {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        btn.style.color = '#888';
    }
}

function checkLoginState() {
    const token = localStorage.getItem('token');
    const authContainer = document.getElementById('auth-buttons');
    if (token && authContainer) {
        authContainer.innerHTML = '<button class="btn-auth btn-login" onclick="logout()">Logout</button>';
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.reload();
}

function loadCategory(cat) {
    loadNews(cat);
}

function goToArticle(id) {
    window.location.href = `article.html?id=${id}`;
}

// Search
const searchInput = document.getElementById('search-input');
if(searchInput) {
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            loadNews(); 
        }
    });
}