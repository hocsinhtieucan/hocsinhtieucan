// Strict mode for better error catching
'use strict';

// DOM Elements
const adminBtn = document.getElementById('admin-btn');
const adminModal = document.getElementById('admin-modal');
const contentModal = document.getElementById('content-modal');
const adminDashboard = document.getElementById('admin-dashboard');
const loginBtn = document.getElementById('login-btn');
const adminPassword = document.getElementById('admin-password');
const closeButtons = document.querySelectorAll('.close');
const addNewContentBtn = document.getElementById('add-new-content');
const saveContentBtn = document.getElementById('save-content');
const contentForm = document.getElementById('add-content-form');
const cancelEditBtn = document.getElementById('cancel-edit');
const exportJsonBtn = document.getElementById('export-json');
const importJsonInput = document.getElementById('import-json');
const contentTitle = document.getElementById('content-title');
const contentDate = document.getElementById('content-date');
const contentText = document.getElementById('content-text');
const contentId = document.getElementById('content-id');
const tocElement = document.getElementById('toc');
const contentElement = document.getElementById('content');
const backToTopBtn = document.getElementById('back-to-top');
const formatButtons = document.querySelectorAll('.format-btn');
const contentModalTitle = document.getElementById('content-modal-title');
const contentTableBody = document.getElementById('content-table-body');

// Global Variables
let posts = [];
const ADMIN_PASSWORD = 'admin123'; // Change to a secure password in production

// Array of pastel background colors for posts
const pastelColors = [
  '#ffebee', // light red
  '#e8f5e9', // light green
  '#e3f2fd', // light blue
  '#f3e5f5', // light purple
  '#fff3e0', // light orange
  '#f1f8e9', // light lime
  '#e0f7fa', // light cyan
  '#fce4ec', // light pink
  '#fffde7', // light yellow
  '#e8eaf6'  // light indigo
];

// Get a random pastel color from the array
function getRandomColor() {
  return pastelColors[Math.floor(Math.random() * pastelColors.length)];
}

// Fetch posts from JSON file
async function fetchPosts() {
  try {
    const response = await fetch('data/posts.json?v=' + new Date().getTime());
    if (!response.ok) throw new Error('Failed to load data');
    posts = await response.json();
    displayPosts();
    generateTOC();
  } catch (error) {
    console.error('Error loading posts:', error);
    contentElement.innerHTML = '<p>Failed to load content. Please try again later.</p>';
  }
}

// Display posts in main content area
function displayPosts() {
  contentElement.innerHTML = '';
  
  // Sort posts by ID in descending order (newest first)
  const sortedPosts = [...posts].sort((a, b) => b.id - a.id);
  
  sortedPosts.forEach(post => {
    const postElement = document.createElement('article');
    postElement.classList.add('post');
    postElement.id = `post-${post.id}`;
    
    const randomColor = getRandomColor();
    // Convert raw newlines to <br> for proper HTML rendering
    const formattedContent = post.content.replace(/\n(?!<)/g, '<br>');
    
    postElement.innerHTML = `
      <div class="post-header">
        <h2 class="post-title"><img src="avatar.jpg" alt="Logo" class="title-logo"> ${post.title}</h2>
        <span class="post-date">${post.date}</span>
      </div>
      <div class="post-content">${formattedContent}</div>
      <div class="blur-avatar-container">
        <img src="avatar.jpg" alt="" class="blur-avatar blur-avatar-1">
        <img src="avatar.jpg" alt="" class="blur-avatar blur-avatar-2">
        <img src="avatar.jpg" alt="" class="blur-avatar blur-avatar-3">
        <img src="avatar.jpg" alt="" class="blur-avatar blur-avatar-4">
        <img src="avatar.jpg" alt="" class="blur-avatar blur-avatar-5">
        <img src="avatar.jpg" alt="" class="blur-avatar blur-avatar-6">
        <img src="avatar.jpg" alt="" class="blur-avatar blur-avatar-7">
        <img src="avatar.jpg" alt="" class="blur-avatar blur-avatar-8">
      </div>
    `;
    postElement.style.backgroundColor = randomColor;
    
    contentElement.appendChild(postElement);
  });
}

// Generate Table of Contents
function generateTOC() {
  tocElement.innerHTML = '';
  
  // Sort posts by ID in descending order (newest first)
  const sortedPosts = [...posts].sort((a, b) => b.id - a.id);
  
  sortedPosts.forEach(post => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="#post-${post.id}">${post.title}</a>`;
    tocElement.appendChild(li);
  });
}

// Initialize Back to Top button
function initBackToTop() {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });
  
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Format text in editor
function formatText(format) {
  const textarea = contentText;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  let formattedText = '';
  
  switch (format) {
    case 'bold':
      formattedText = `<strong>${selectedText}</strong>`;
      break;
    case 'italic':
      formattedText = `<em>${selectedText}</em>`;
      break;
    case 'underline':
      formattedText = `<u>${selectedText}</u>`;
      break;
    case 'hashtag':
      formattedText = `<span class="hashtag">#${selectedText}</span>`;
      break;
    case 'from':
      formattedText = `<span class="from">Từ: ${selectedText}</span>`;
      break;
  }
  
  textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
  textarea.focus();
  textarea.selectionStart = start + formattedText.length;
  textarea.selectionEnd = start + formattedText.length;
}

// Admin Authentication
function authenticateAdmin() {
  const password = adminPassword.value.trim();
  if (password === ADMIN_PASSWORD) {
    adminModal.style.display = 'none';
    adminDashboard.style.display = 'block';
    populateAdminTable();
    adminPassword.value = '';
  } else {
    alert('Invalid password. Please try again.');
  }
}

// Populate Admin Table with posts
function populateAdminTable() {
  contentTableBody.innerHTML = '';
  
  // Sort posts by ID in descending order (newest first)
  const sortedPosts = [...posts].sort((a, b) => b.id - a.id);
  
  sortedPosts.forEach(post => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${post.id}</td>
      <td>${post.title}</td>
      <td>${post.date}</td>
      <td>
        <button class="edit-btn" data-id="${post.id}"><i class="fas fa-edit"></i></button>
        <button class="delete-btn" data-id="${post.id}"><i class="fas fa-trash"></i></button>
      </td>
    `;
    contentTableBody.appendChild(row);
  });
  
  // Add event listeners to edit and delete buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => editPost(parseInt(btn.dataset.id)));
  });
  
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deletePost(parseInt(btn.dataset.id)));
  });
}

// Edit a post
function editPost(id) {
  const post = posts.find(p => p.id === id);
  if (post) {
    contentId.value = post.id;
    contentTitle.value = post.title;
    contentDate.value = post.date;
    contentText.value = post.content;
    
    contentModalTitle.textContent = 'Chỉnh sửa nội dung';
    cancelEditBtn.style.display = 'inline-block';
    
    adminDashboard.style.display = 'none';
    contentModal.style.display = 'block';
  }
}

// Delete a post
function deletePost(id) {
  if (confirm('Bạn có chắc muốn xóa nội dung này?')) {
    posts = posts.filter(post => post.id !== id);
    savePostsToLocalStorage();
    populateAdminTable();
  }
}

// Save posts to local storage
function savePostsToLocalStorage() {
  localStorage.setItem('posts', JSON.stringify(posts));
  displayPosts();
  generateTOC();
}

// Export posts to JSON
function exportPostsToJson() {
  const jsonString = JSON.stringify(posts, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'posts.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import posts from JSON
function importPostsFromJson(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedPosts = JSON.parse(e.target.result);
      if (Array.isArray(importedPosts)) {
        posts = importedPosts;
        savePostsToLocalStorage();
        populateAdminTable();
        alert('Import successful!');
      } else {
        throw new Error('Invalid JSON format');
      }
    } catch (error) {
      alert('Error importing JSON: ' + error.message);
    }
  };
  reader.readAsText(file);
}

// Save Content Form Handler
function saveContentFormHandler(event) {
  event.preventDefault();
  
  const title = contentTitle.value.trim();
  const date = contentDate.value.trim();
  const text = contentText.value.trim();
  
  if (!title || !date || !text) {
    alert('Vui lòng nhập đầy đủ thông tin!');
    return;
  }
  
  const idValue = contentId.value;
  
  if (idValue) {
    // Edit existing post
    const index = posts.findIndex(post => post.id === parseInt(idValue));
    if (index !== -1) {
      posts[index] = {
        id: parseInt(idValue),
        title,
        date,
        content: text
      };
    }
  } else {
    // Add new post
    const newId = posts.length > 0 ? Math.max(...posts.map(post => post.id)) + 1 : 1;
    posts.push({
      id: newId,
      title,
      date,
      content: text
    });
  }
  
  savePostsToLocalStorage();
  resetContentForm();
  contentModal.style.display = 'none';
  adminDashboard.style.display = 'block';
  populateAdminTable();
}

// Reset Content Form
function resetContentForm() {
  contentId.value = '';
  contentTitle.value = '';
  contentDate.value = '';
  contentText.value = '';
  contentModalTitle.textContent = 'Thêm nội dung mới';
  cancelEditBtn.style.display = 'none';
}

// Initialize scroll animations
function initScrollAnimations() {
  const scrollProgress = document.querySelector('.scroll-progress');
  
  // Handle scroll animations for elements
  function handleScrollAnimations() {
    // Update scroll progress bar
    const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    scrollProgress.style.transform = `scaleX(${scrollPercentage / 100})`;
    
    // Animate elements when they come into view - only within the content area
    document.querySelectorAll('#content .animate-on-scroll').forEach(post => {
      const elementTop = post.getBoundingClientRect().top;
      const triggerPoint = window.innerHeight * 0.85;
      
      if (elementTop < triggerPoint) {
        post.classList.add('in-view');
      } else if (elementTop > window.innerHeight) {
        // Reset animation when post is far out of view (for scrolling back up)
        post.classList.remove('in-view');
      }
    });
  }
  
  // Apply animation classes to posts after they're loaded
  function applyAnimationClasses() {
    // Only apply animations to elements within the content area
    document.querySelectorAll('#content .post').forEach((post, index) => {
      // Add animation class with slight delay based on index
      post.classList.add('animate-on-scroll');
      post.style.animationDelay = `${index * 0.1}s`;
      
      // Randomize the starting positions of blur avatars for variety
      const avatarContainer = post.querySelector('.blur-avatar-container');
      if (avatarContainer) {
        const avatars = avatarContainer.querySelectorAll('.blur-avatar');
        
        // Randomize which avatars are visible in each post for more variety
        const visibleAvatarCount = 5 + Math.floor(Math.random() * 4); // 5-8 visible avatars
        const avatarArray = Array.from(avatars);
        
        // Shuffle the avatars randomly
        for (let i = avatarArray.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [avatarArray[i], avatarArray[j]] = [avatarArray[j], avatarArray[i]];
        }
        
        // Apply random animation delays and opacity to each avatar
        avatarArray.forEach((avatar, i) => {
          // Random delay for each avatar's animation
          const delay = Math.random() * 8; // 0-8s delay
          avatar.style.animationDelay = `${delay}s`;
          
          // Give some avatars slightly higher opacity for dynamic effect
          if (i < visibleAvatarCount) {
            const baseOpacity = 0.05 + (Math.random() * 0.07); // 0.05-0.12
            avatar.style.opacity = baseOpacity.toFixed(2);
          } else {
            avatar.style.opacity = '0';
          }
        });
      }
    });
    
    // Initialize animation on visible elements
    handleScrollAnimations();
  }
  
  // Remove click handler for progress avatar
  
  // Listen for scroll events
  window.addEventListener('scroll', handleScrollAnimations);
  
  // Apply animations after content loads
  if (contentElement.children.length > 0) {
    applyAnimationClasses();
  } else {
    // If posts aren't loaded yet, wait for them
    const observer = new MutationObserver((mutations) => {
      if (contentElement.children.length > 0) {
        applyAnimationClasses();
        observer.disconnect();
      }
    });
    
    observer.observe(contentElement, { childList: true });
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  fetchPosts();
  initBackToTop();
  initScrollAnimations();
  
  // Try to load posts from localStorage first
  const storedPosts = localStorage.getItem('posts');
  if (storedPosts) {
    try {
      posts = JSON.parse(storedPosts);
      displayPosts();
      generateTOC();
    } catch (e) {
      console.error('Error parsing stored posts:', e);
      fetchPosts();
    }
  } else {
    fetchPosts();
  }
  
  // Admin Button Click
  adminBtn.addEventListener('click', () => {
    adminModal.style.display = 'block';
  });
  
  // Login Button Click
  loginBtn.addEventListener('click', authenticateAdmin);
  
  // Add New Content Button Click
  addNewContentBtn.addEventListener('click', () => {
    resetContentForm();
    adminDashboard.style.display = 'none';
    contentModal.style.display = 'block';
  });
  
  // Content Form Submit
  contentForm.addEventListener('submit', saveContentFormHandler);
  
  // Cancel Edit Button Click
  cancelEditBtn.addEventListener('click', () => {
    resetContentForm();
    contentModal.style.display = 'none';
    adminDashboard.style.display = 'block';
  });
  
  // Export JSON Button Click
  exportJsonBtn.addEventListener('click', exportPostsToJson);
  
  // Import JSON Input Change
  importJsonInput.addEventListener('change', importPostsFromJson);
  
  // Close Buttons Click
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      adminModal.style.display = 'none';
      contentModal.style.display = 'none';
      adminDashboard.style.display = 'none';
    });
  });
  
  // Format Buttons Click
  formatButtons.forEach(btn => {
    btn.addEventListener('click', () => formatText(btn.dataset.format));
  });
  
  // Enter key in password field
  adminPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      authenticateAdmin();
    }
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === adminModal) adminModal.style.display = 'none';
    if (event.target === contentModal) contentModal.style.display = 'none';
    if (event.target === adminDashboard) adminDashboard.style.display = 'none';
  });
});
