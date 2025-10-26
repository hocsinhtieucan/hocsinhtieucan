// Global Variables
let posts = [];
const ADMIN_PASSWORD = '123456'; // Change this to a secure password in production
let isAdmin = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadPosts();
        initializeElements();
        setupEventListeners();
        initializeScrollProgress();
        checkAdminStatus();
        initializeSearch();
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Lỗi khởi tạo ứng dụng', 'error');
    }
});

// Initialize elements
function initializeElements() {
    const elements = {
        adminBtn: document.getElementById('admin-btn'),
        adminModal: document.getElementById('admin-modal'),
        contentModal: document.getElementById('content-modal'),
        adminDashboard: document.getElementById('admin-dashboard'),
        backToTopBtn: document.getElementById('back-to-top'),
        scrollProgress: document.querySelector('.scroll-progress'),
        loginForm: document.getElementById('admin-login-form'),
        loginBtn: document.getElementById('login-btn'),
        passwordInput: document.getElementById('admin-password')
    };

    // Check if all required elements exist
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Required element '${key}' not found`);
            throw new Error('Missing required elements');
        }
        // Add elements to window for global access
        window[key] = element;
    }

    // Setup event listeners for admin functionality
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleAdminLogin();
        });
    }

    elements.adminBtn.addEventListener('click', () => {
        if (isAdmin) {
            showAdminDashboard();
        } else {
            showAdminLoginModal();
        }
    });
}

// Handle admin login
function handleAdminLogin() {
    const password = passwordInput.value;
    if (password === ADMIN_PASSWORD) {
        loginSuccess();
    } else {
        loginFailed();
    }
}

// Handle successful login
function loginSuccess() {
    isAdmin = true;
    localStorage.setItem('isAdmin', 'true');
    adminBtn.innerHTML = '<i class="fas fa-user-shield"></i> <span>Dashboard</span>';
    closeAllModals();
    showNotification('Đăng nhập thành công!', 'success');
    showAdminDashboard();
}

// Handle failed login
function loginFailed() {
    showNotification('Sai mật khẩu!', 'error');
    passwordInput.value = '';
    passwordInput.focus();
}

// Show admin login modal
function showAdminLoginModal() {
    adminModal.style.display = 'block';
    document.body.classList.add('modal-open');
    passwordInput.value = '';
    passwordInput.focus();
}

// Show admin dashboard
function showAdminDashboard() {
    if (!isAdmin) {
        showAdminLoginModal();
        return;
    }
    adminDashboard.style.display = 'block';
    document.body.classList.add('modal-open');
    renderContentTable();
}

// Close all modals
function closeAllModals() {
    const modals = [adminModal, contentModal, adminDashboard];
    modals.forEach(modal => {
        if (modal) modal.style.display = 'none';
    });
    document.body.classList.remove('modal-open');
}

// Check admin status
function checkAdminStatus() {
    isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
        adminBtn.innerHTML = '<i class="fas fa-user-shield"></i> <span>Dashboard</span>';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Click outside to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    // Content form
    const addContentForm = document.getElementById('add-content-form');
    if (addContentForm) {
        addContentForm.addEventListener('submit', handleContentSubmit);
    }

    // Admin controls
    setupAdminControls();
}

// Setup admin controls
function setupAdminControls() {
    const addNewBtn = document.getElementById('add-new-content');
    const importJson = document.getElementById('import-json');
    const exportJson = document.getElementById('export-json');

    if (addNewBtn) {
        addNewBtn.addEventListener('click', () => {
            document.getElementById('content-modal-title').textContent = 'Thêm nội dung mới';
            document.getElementById('content-id').value = '';
            document.getElementById('add-content-form').reset();
            document.getElementById('cancel-edit').style.display = 'none';
            contentModal.style.display = 'block';
            document.body.classList.add('modal-open');
        });
    }

    if (importJson) {
        importJson.addEventListener('change', handleImportJSON);
    }

    if (exportJson) {
        exportJson.addEventListener('click', savePosts);
    }
}

// Handle content submission
async function handleContentSubmit(e) {
    e.preventDefault();
    const formData = {
        id: document.getElementById('content-id').value || Date.now(),
        title: document.getElementById('content-title').value,
        date: document.getElementById('content-date').value,
        content: document.getElementById('content-text').value
    };

    if (formData.id) {
        const index = posts.findIndex(p => p.id === parseInt(formData.id));
        if (index !== -1) {
            posts[index] = { ...posts[index], ...formData };
        }
    } else {
        posts.unshift({ ...formData, id: parseInt(formData.id) });
    }

    await savePosts();
    closeAllModals();
    renderPosts();
    renderContentTable();
    showNotification('Nội dung đã được lưu!', 'success');
}

// Load posts
async function loadPosts() {
    try {
        const response = await fetch('data/posts.json');
        posts = await response.json();
        renderPosts();
    } catch (error) {
        console.error('Error loading posts:', error);
        showNotification('Không thể tải nội dung', 'error');
    }
}

// Render posts
function renderPosts() {
    const content = document.getElementById('content');
    if (!content) return;

    content.innerHTML = '';
    posts.sort((a, b) => b.id - a.id).forEach(post => {
        const article = document.createElement('article');
        article.className = 'post';
        article.id = `post-${post.id}`;
        article.innerHTML = `
            <h2 class="post-title">${post.title}</h2>
            <div class="post-date">${post.date}</div>
            <div class="post-content">${formatContent(post.content)}</div>
        `;
        content.appendChild(article);
    });
    generateTableOfContents();
}

// Format content
function formatContent(content) {
    if (!content) return '';
    
    if (content.includes('</span>') || content.includes('</div>') || 
        content.includes('</p>') || content.includes('</strong>') || 
        content.includes('</em>')) {
        return content;
    }

    return content
        .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/___(.*?)___/g, '<u>$1</u>')
        .replace(/(?:FROM:|Từ:)(.*?)(?:\n|$)/gi, '<span class="from">Từ:$1</span>')
        .split('\n').map(line => `<p>${line}</p>`).join('');
}

// Generate table of contents
function generateTableOfContents() {
    const toc = document.getElementById('toc');
    if (!toc) return;

    toc.innerHTML = '';
    posts.forEach(post => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#post-${post.id}">${post.title}</a>`;
        toc.appendChild(li);
    });
}

// Initialize scroll progress
function initializeScrollProgress() {
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        scrollProgress.style.width = `${scrolled}%`;
        backToTopBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }, 100);
}

// Handle JSON import
function handleImportJSON(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                posts = JSON.parse(event.target.result);
                renderPosts();
                renderContentTable();
                showNotification('Nhập dữ liệu thành công!', 'success');
            } catch (error) {
                showNotification('Lỗi khi nhập file!', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Save posts
async function savePosts() {
    try {
        const blob = new Blob([JSON.stringify(posts, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'posts.json';
        a.click();
        URL.revokeObjectURL(a.href);
    } catch (error) {
        console.error('Error saving posts:', error);
        showNotification('Không thể lưu nội dung', 'error');
    }
}

// Render content table
function renderContentTable() {
    const tableBody = document.getElementById('content-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    posts.forEach(post => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.date}</td>
            <td>
                <button onclick="editPost(${post.id})" class="primary-button">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button onclick="deletePost(${post.id})" class="secondary-button">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Edit post
function editPost(id) {
    const post = posts.find(p => p.id === id);
    if (post) {
        document.getElementById('content-modal-title').textContent = 'Sửa nội dung';
        document.getElementById('content-id').value = post.id;
        document.getElementById('content-title').value = post.title;
        document.getElementById('content-date').value = post.date;
        document.getElementById('content-text').value = post.content;
        document.getElementById('cancel-edit').style.display = 'inline-block';
        contentModal.style.display = 'block';
        document.body.classList.add('modal-open');
    }
}

// Delete post
function deletePost(id) {
    if (confirm('Bạn có chắc chắn muốn xóa nội dung này?')) {
        posts = posts.filter(p => p.id !== id);
        renderPosts();
        renderContentTable();
        savePosts();
        showNotification('Đã xóa nội dung!', 'success');
    }
}

// Initialize search
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchClear = document.getElementById('search-clear');
    
    if (!searchInput || !searchResults || !searchClear) return;

    searchInput.addEventListener('input', debounce(() => {
        const query = searchInput.value.trim().toLowerCase();
        searchClear.style.display = query ? 'block' : 'none';
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        const results = posts.filter(post => 
            post.title.toLowerCase().includes(query) ||
            post.content.toLowerCase().includes(query)
        );

        if (results.length > 0) {
            renderSearchResults(results, query);
        } else {
            searchResults.innerHTML = '<div class="search-result-item">Không tìm thấy kết quả</div>';
        }
        searchResults.style.display = 'block';
    }, 300));

    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchResults.style.display = 'none';
        searchClear.style.display = 'none';
    });
}

// Render search results
function renderSearchResults(results, query) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = results
        .map(post => {
            const title = highlightText(post.title, query);
            const content = getContentPreview(post.content, query);
            return `
                <div class="search-result-item" data-id="${post.id}">
                    <div class="result-title">${title}</div>
                    ${content ? `<div class="result-preview">${content}</div>` : ''}
                </div>
            `;
        })
        .join('');
}

// Highlight search text
function highlightText(text, query) {
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Get content preview
function getContentPreview(content, query) {
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return '';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 50);
    let preview = content.slice(start, end);
    
    if (start > 0) preview = '...' + preview;
    if (end < content.length) preview = preview + '...';
    
    return highlightText(preview, query);
}

// Escape regex special characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}