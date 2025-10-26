// Global Variables
let posts = [];
const ADMIN_PASSWORD = '123456'; // Change this to a secure password in production
let isAdmin = false;

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('Update found for service worker');

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showNotification('Cập nhật mới đã sẵn sàng. Vui lòng tải lại trang!', 'info');
                        }
                    });
                });
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });

    // Listen for controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        showNotification('Trang web đã được cập nhật!', 'success');
    });
}

// DOM Elements
const adminBtn = document.getElementById('admin-btn');
const adminModal = document.getElementById('admin-modal');
const contentModal = document.getElementById('content-modal');
const adminDashboard = document.getElementById('admin-dashboard');
const backToTopBtn = document.getElementById('back-to-top');
const scrollProgress = document.querySelector('.scroll-progress');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadPosts();
    setupEventListeners();
    initializeScrollProgress();
    checkAdminStatus();
});

// Load posts from JSON file
async function loadPosts() {
    try {
        const response = await fetch('data/posts.json');
        posts = await response.json();
        renderPosts();
        generateTableOfContents();
    } catch (error) {
        console.error('Error loading posts:', error);
        showNotification('Không thể tải nội dung', 'error');
    }
}

// Render posts to the content area
function renderPosts() {
    const content = document.getElementById('content');
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
}

// Format content with hashtags and styling
function formatContent(content) {
    return content
        .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/___(.*?)___/g, '<u>$1</u>')
        .replace(/FROM:(.*?)$/gm, '<div class="source">Nguồn: $1</div>')
        .replace(/\\n/g, '<br>');
}

// Generate table of contents
function generateTableOfContents() {
    const toc = document.getElementById('toc');
    toc.innerHTML = '';

    posts.forEach(post => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#post-${post.id}">${post.title}</a>`;
        toc.appendChild(li);
    });
}

// Setup all event listeners
function setupEventListeners() {
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            adminModal.style.display = 'none';
            contentModal.style.display = 'none';
            adminDashboard.style.display = 'none';
            document.body.classList.remove('modal-open');
        });
    });

    // Admin login
    adminBtn.addEventListener('click', () => {
        if (isAdmin) {
            showAdminDashboard();
        } else {
            adminModal.style.display = 'block';
        }
    });

    // Login form submission
    document.getElementById('login-btn').addEventListener('click', handleLogin);

    // Content form submission
    document.getElementById('add-content-form').addEventListener('submit', handleContentSubmit);

    // Text editor toolbar
    setupTextEditor();

    // Back to top button
    setupBackToTop();

    // Admin dashboard controls
    setupAdminDashboardControls();
}

// Initialize scroll progress indicator
function initializeScrollProgress() {
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        scrollProgress.style.width = `${scrolled}%`;

        backToTopBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
    });
}

// Handle admin login
function handleLogin() {
    const password = document.getElementById('admin-password').value;
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        localStorage.setItem('isAdmin', 'true');
        adminModal.style.display = 'none';
        showAdminDashboard();
        showNotification('Đăng nhập thành công!', 'success');
    } else {
        showNotification('Sai mật khẩu!', 'error');
    }
}

// Check admin status on page load
function checkAdminStatus() {
    isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
        adminBtn.innerHTML = '<i class="fas fa-user-shield"></i> <span>Dashboard</span>';
    }
}

// Show admin dashboard
function showAdminDashboard() {
    adminDashboard.style.display = 'block';
    renderContentTable();
}

// Handle content form submission
async function handleContentSubmit(e) {
    e.preventDefault();
    const formData = {
        id: document.getElementById('content-id').value || Date.now(),
        title: document.getElementById('content-title').value,
        date: document.getElementById('content-date').value,
        content: document.getElementById('content-text').value
    };

    if (document.getElementById('content-id').value) {
        // Edit existing post
        const index = posts.findIndex(p => p.id === parseInt(formData.id));
        posts[index] = { ...posts[index], ...formData };
    } else {
        // Add new post
        posts.unshift({ ...formData, id: parseInt(formData.id) });
    }

    await savePosts();
    contentModal.style.display = 'none';
    renderPosts();
    renderContentTable();
    generateTableOfContents();
    showNotification('Nội dung đã được lưu!', 'success');
}

// Save posts to JSON file
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

// Setup text editor toolbar
function setupTextEditor() {
    const toolbar = document.querySelector('.text-editor-toolbar');
    const textarea = document.getElementById('content-text');

    toolbar.addEventListener('click', (e) => {
        if (e.target.closest('.format-btn')) {
            const button = e.target.closest('.format-btn');
            const format = button.dataset.format;
            const selection = {
                start: textarea.selectionStart,
                end: textarea.selectionEnd,
                text: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
            };

            let replacement = '';
            switch (format) {
                case 'bold':
                    replacement = `**${selection.text}**`;
                    break;
                case 'italic':
                    replacement = `*${selection.text}*`;
                    break;
                case 'underline':
                    replacement = `___${selection.text}___`;
                    break;
                case 'hashtag':
                    replacement = `#${selection.text}`;
                    break;
                case 'from':
                    replacement = `\nFROM:${selection.text}`;
                    break;
            }

            textarea.value = textarea.value.substring(0, selection.start) +
                           replacement +
                           textarea.value.substring(selection.end);
        }
    });
}

// Setup back to top button
function setupBackToTop() {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Setup admin dashboard controls
function setupAdminDashboardControls() {
    // Add new content button
    document.getElementById('add-new-content').addEventListener('click', () => {
        document.getElementById('content-modal-title').textContent = 'Thêm nội dung mới';
        document.getElementById('content-id').value = '';
        document.getElementById('add-content-form').reset();
        document.getElementById('cancel-edit').style.display = 'none';
        contentModal.style.display = 'block';
        document.body.classList.add('modal-open');
    });

    // Import JSON
    document.getElementById('import-json').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    posts = JSON.parse(event.target.result);
                    renderPosts();
                    renderContentTable();
                    generateTableOfContents();
                    showNotification('Nhập dữ liệu thành công!', 'success');
                } catch (error) {
                    showNotification('Lỗi khi nhập file!', 'error');
                }
            };
            reader.readAsText(file);
        }
    });

    // Export JSON
    document.getElementById('export-json').addEventListener('click', () => {
        savePosts();
    });
}

// Render content table in admin dashboard
function renderContentTable() {
    const tableBody = document.getElementById('content-table-body');
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
    }
}

// Delete post
function deletePost(id) {
    if (confirm('Bạn có chắc chắn muốn xóa nội dung này?')) {
        posts = posts.filter(p => p.id !== id);
        renderPosts();
        renderContentTable();
        generateTableOfContents();
        savePosts();
        showNotification('Đã xóa nội dung!', 'success');
    }
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

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 4px;
        color: white;
        z-index: 1000;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
    }

    .notification.show {
        opacity: 1;
        transform: translateY(0);
    }

    .notification.success {
        background-color: #2ecc71;
    }

    .notification.error {
        background-color: #e74c3c;
    }
`;
document.head.appendChild(style);
