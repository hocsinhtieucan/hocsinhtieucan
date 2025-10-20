// Prevent caching for GitHub Pages
function preventCaching() {
    // Add timestamp to all fetch requests to prevent caching
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (typeof url === 'string') {
            // Add timestamp to URL to prevent caching
            url = url + (url.includes('?') ? '&' : '?') + '_t=' + new Date().getTime();
        }
        return originalFetch.call(this, url, options);
    };
}

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Constants
const ADMIN_PASSWORD = "admin123"; // Change this to your desired password
const POSTS_JSON_URL = "data/posts.json";

// DOM Elements
const adminBtn = document.getElementById("admin-btn");
const adminModal = document.getElementById("admin-modal");
const adminPassword = document.getElementById("admin-password");
const loginBtn = document.getElementById("login-btn");
const adminDashboard = document.getElementById("admin-dashboard");
const contentModal = document.getElementById("content-modal");
const addNewContentBtn = document.getElementById("add-new-content");
const contentForm = document.getElementById("add-content-form");
const contentTable = document.getElementById("content-table-body");
const contentId = document.getElementById("content-id");
const contentTitle = document.getElementById("content-title");
const contentDate = document.getElementById("content-date");
const contentText = document.getElementById("content-text");
const saveContentBtn = document.getElementById("save-content");
const cancelEditBtn = document.getElementById("cancel-edit");
const contentModalTitle = document.getElementById("content-modal-title");
const exportJsonBtn = document.getElementById("export-json");
const importJsonInput = document.getElementById("import-json");
const backToTopBtn = document.getElementById("back-to-top");
const tocList = document.getElementById("toc");
const contentDiv = document.getElementById("content");

// Global variables
let posts = [];
let isAuthenticated = false;
let isEditing = false;

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    // Prevent caching
    preventCaching();
    
    // Load posts
    loadPosts();
    
    // Close modals when clicking on X or outside
    document.querySelectorAll(".close").forEach(closeBtn => {
        closeBtn.addEventListener("click", () => {
            adminModal.style.display = "none";
            adminDashboard.style.display = "none";
            contentModal.style.display = "none";
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener("click", (event) => {
        if (event.target === adminModal) {
            adminModal.style.display = "none";
        }
        if (event.target === adminDashboard) {
            adminDashboard.style.display = "none";
        }
        if (event.target === contentModal) {
            contentModal.style.display = "none";
        }
    });
    
    // Show admin login modal
    adminBtn.addEventListener("click", () => {
        if (isAuthenticated) {
            adminDashboard.style.display = "block";
        } else {
            adminModal.style.display = "block";
            adminPassword.focus();
        }
    });
    
    // Admin login
    loginBtn.addEventListener("click", login);
    adminPassword.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            login();
        }
    });
    
    // Show add content modal
    addNewContentBtn.addEventListener("click", () => {
        resetContentForm();
        contentModalTitle.textContent = "Thêm nội dung mới";
        contentModal.style.display = "block";
    });
    
    // Save content
    contentForm.addEventListener("submit", (e) => {
        e.preventDefault();
        saveContent();
    });
    
    // Cancel edit
    cancelEditBtn.addEventListener("click", () => {
        contentModal.style.display = "none";
        resetContentForm();
    });
    
    // Export JSON
    exportJsonBtn.addEventListener("click", exportJson);
    
    // Import JSON
    importJsonInput.addEventListener("change", importJson);
    
    // Format text buttons
    document.querySelectorAll(".format-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            formatText(btn.dataset.format);
        });
    });
    
    // Back to top button
    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = "block";
        } else {
            backToTopBtn.style.display = "none";
        }
    });
    
    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
});

// Functions
function loadPosts() {
    fetch(POSTS_JSON_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            posts = data;
            renderPosts();
            renderTableOfContents();
            updateAdminTable();
        })
        .catch(error => {
            console.error("Error loading posts:", error);
            posts = [];
        });
}

function renderPosts() {
    contentDiv.innerHTML = "";
    
    posts.forEach(post => {
        const postElement = document.createElement("div");
        postElement.id = `post-${post.id}`;
        postElement.className = "post";
        
        postElement.innerHTML = `
            <h2 class="post-title">${post.title}</h2>
            <div class="post-date">${post.date}</div>
            <div class="post-content">${post.content}</div>
        `;
        
        contentDiv.appendChild(postElement);
    });
}

function renderTableOfContents() {
    tocList.innerHTML = "";
    
    posts.forEach(post => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#post-${post.id}`;
        a.textContent = post.title;
        a.addEventListener("click", (e) => {
            e.preventDefault();
            document.getElementById(`post-${post.id}`).scrollIntoView({
                behavior: "smooth"
            });
        });
        
        li.appendChild(a);
        tocList.appendChild(li);
    });
}

function updateAdminTable() {
    if (!isAuthenticated) return;
    
    contentTable.innerHTML = "";
    
    posts.forEach(post => {
        const tr = document.createElement("tr");
        
        tr.innerHTML = `
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.date}</td>
            <td>
                <button class="action-btn edit-btn" title="Sửa" onclick="editPost(${post.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" title="Xóa" onclick="deletePost(${post.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        contentTable.appendChild(tr);
    });
}

// Login function
function login() {
    const password = adminPassword.value;
    
    if (password === ADMIN_PASSWORD) {
        isAuthenticated = true;
        adminModal.style.display = "none";
        adminDashboard.style.display = "block";
        adminPassword.value = "";
        updateAdminTable();
    } else {
        alert("Mật khẩu không đúng. Vui lòng thử lại.");
        adminPassword.value = "";
        adminPassword.focus();
    }
}

// Edit post
function editPost(id) {
    const post = posts.find(p => p.id === id);
    
    if (post) {
        contentId.value = post.id;
        contentTitle.value = post.title;
        contentDate.value = post.date;
        contentText.value = post.content;
        
        contentModalTitle.textContent = "Chỉnh sửa nội dung";
        isEditing = true;
        cancelEditBtn.style.display = "inline-block";
        contentModal.style.display = "block";
    }
}

// Delete post
function deletePost(id) {
    if (confirm("Bạn có chắc chắn muốn xóa nội dung này?")) {
        posts = posts.filter(post => post.id !== id);
        updateAdminTable();
        renderPosts();
        renderTableOfContents();
        alert("Đã xóa nội dung thành công!");
    }
}

// Save content
function saveContent() {
    const title = contentTitle.value;
    const date = contentDate.value;
    const content = contentText.value;
    
    if (!title || !date || !content) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }
    
    if (isEditing) {
        // Update existing post
        const id = parseInt(contentId.value);
        const postIndex = posts.findIndex(post => post.id === id);
        
        if (postIndex !== -1) {
            posts[postIndex] = {
                ...posts[postIndex],
                title,
                date,
                content
            };
            
            alert("Đã cập nhật nội dung thành công!");
        }
    } else {
        // Add new post
        const newId = posts.length > 0 ? Math.max(...posts.map(post => post.id)) + 1 : 1;
        
        const newPost = {
            id: newId,
            title,
            date,
            content
        };
        
        posts.unshift(newPost); // Add to beginning of array
        alert("Đã thêm nội dung mới thành công!");
    }
    
    updateAdminTable();
    renderPosts();
    renderTableOfContents();
    resetContentForm();
    contentModal.style.display = "none";
}

// Reset content form
function resetContentForm() {
    contentId.value = "";
    contentTitle.value = "";
    contentDate.value = "";
    contentText.value = "";
    isEditing = false;
    cancelEditBtn.style.display = "none";
}

// Format text
function formatText(format) {
    const textarea = contentText;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let formattedText = "";
    
    switch(format) {
        case "bold":
            formattedText = `<strong>${selectedText}</strong>`;
            break;
        case "italic":
            formattedText = `<em>${selectedText}</em>`;
            break;
        case "underline":
            formattedText = `<u>${selectedText}</u>`;
            break;
        case "hashtag":
            formattedText = `<span class="hashtag">${selectedText}</span>`;
            break;
        case "from":
            formattedText = `<span class="from">Từ: ${selectedText}</span>`;
            break;
    }
    
    if (selectedText) {
        textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
        textarea.focus();
        textarea.selectionStart = start;
        textarea.selectionEnd = start + formattedText.length;
    }
}

// Export JSON
function exportJson() {
    const jsonString = JSON.stringify(posts, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "posts.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import JSON
function importJson(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedPosts = JSON.parse(e.target.result);
            
            if (Array.isArray(importedPosts)) {
                if (confirm(`Bạn có chắc chắn muốn nhập ${importedPosts.length} bài viết? Điều này sẽ ghi đè lên dữ liệu hiện tại.`)) {
                    posts = importedPosts;
                    updateAdminTable();
                    renderPosts();
                    renderTableOfContents();
                    alert("Nhập dữ liệu thành công!");
                }
            } else {
                alert("Định dạng file không hợp lệ!");
            }
        } catch (error) {
            alert("Lỗi khi đọc file JSON: " + error.message);
        }
        
        // Reset file input
        event.target.value = "";
    };
    
    reader.readAsText(file);
}

// Global functions (accessible from HTML)
window.editPost = editPost;
window.deletePost = deletePost;
