/**
 * 3D Effects for Web Confession
 * Adds parallax and 3D tilt effects to elements
 */

// Configuration
const config = {
    // Parallax settings
    parallax: {
        enabled: true,
        intensity: 0.03,
        smoothing: 0.2
    },
    // Tilt settings
    tilt: {
        enabled: true,
        maxTilt: 5, // Maximum tilt angle (degrees)
        perspective: 1000, // Perspective value for 3D effect
        scale: 1.03, // Scale on hover
        speed: 300, // Speed of animation
        glare: true, // Add glare effect
        maxGlare: 0.3 // Maximum glare opacity
    }
};

// Initialize effects when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initParallaxEffect();
    initTiltEffect();
    initScrollReveal();
});

/**
 * Initialize parallax effect for header and content elements
 */
function initParallaxEffect() {
    if (!config.parallax.enabled) return;

    // Elements to apply parallax effect to
    const header = document.querySelector('header');
    const posts = document.querySelectorAll('.post');
    const tocContainer = document.querySelector('.toc-container');
    
    // Mouse move event listener for the whole document
    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 992) return; // Disable on mobile
        
        // Calculate mouse position relative to center of screen
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calculate offset from center (normalized from -1 to 1)
        const offsetX = (mouseX - windowWidth / 2) / (windowWidth / 2);
        const offsetY = (mouseY - windowHeight / 2) / (windowHeight / 2);
        
        // Apply parallax to header
        if (header) {
            applyParallaxToElement(header, offsetX, offsetY, config.parallax.intensity * 0.7);
        }
        
        // Apply parallax to TOC container
        if (tocContainer) {
            applyParallaxToElement(tocContainer, offsetX, offsetY, config.parallax.intensity * 1.2);
        }
        
        // Apply parallax to posts with different intensity for each
        posts.forEach((post, index) => {
            // Vary intensity slightly for each post to create depth
            const intensity = config.parallax.intensity * (1 + (index % 3) * 0.1);
            applyParallaxToElement(post, offsetX, offsetY, intensity);
        });
    });
}

/**
 * Apply parallax effect to a specific element
 */
function applyParallaxToElement(element, offsetX, offsetY, intensity) {
    // Calculate translation values
    const translateX = offsetX * -intensity * 100; // px
    const translateY = offsetY * -intensity * 100; // px
    
    // Apply smooth transition with requestAnimationFrame
    requestAnimationFrame(() => {
        element.style.transition = `transform ${config.parallax.smoothing}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
        element.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    });
}

/**
 * Initialize tilt effect for posts
 */
function initTiltEffect() {
    if (!config.tilt.enabled) return;

    // Elements to apply tilt effect to
    const posts = document.querySelectorAll('.post');
    const buttons = document.querySelectorAll('#admin-btn, .primary-button, .secondary-button');
    
    // Apply tilt to posts
    posts.forEach(post => {
        applyTiltToElement(post, {
            maxTilt: config.tilt.maxTilt * 0.7,
            scale: config.tilt.scale
        });
    });
    
    // Apply tilt to buttons with different settings
    buttons.forEach(button => {
        applyTiltToElement(button, {
            maxTilt: config.tilt.maxTilt * 1.5,
            scale: config.tilt.scale * 1.05,
            perspective: config.tilt.perspective * 0.8
        });
    });
}

/**
 * Apply tilt effect to a specific element
 */
function applyTiltToElement(element, options = {}) {
    if (window.innerWidth < 992) return; // Disable on mobile
    
    // Default options
    const settings = {
        maxTilt: options.maxTilt || config.tilt.maxTilt,
        perspective: options.perspective || config.tilt.perspective,
        scale: options.scale || config.tilt.scale,
        speed: options.speed || config.tilt.speed,
        glare: options.hasOwnProperty('glare') ? options.glare : config.tilt.glare,
        maxGlare: options.maxGlare || config.tilt.maxGlare
    };
    
    // Add a glare element if enabled
    let glareElement = null;
    if (settings.glare) {
        // Create glare element
        glareElement = document.createElement('div');
        glareElement.className = 'tilt-glare';
        glareElement.style.position = 'absolute';
        glareElement.style.top = '0';
        glareElement.style.left = '0';
        glareElement.style.width = '100%';
        glareElement.style.height = '100%';
        glareElement.style.overflow = 'hidden';
        glareElement.style.pointerEvents = 'none';
        
        // Create glare inner element
        const glareInner = document.createElement('div');
        glareInner.className = 'tilt-glare-inner';
        glareInner.style.position = 'absolute';
        glareInner.style.top = '50%';
        glareInner.style.left = '50%';
        glareInner.style.backgroundImage = 'linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)';
        glareInner.style.width = `${element.offsetWidth * 2}px`;
        glareInner.style.height = `${element.offsetHeight * 2}px`;
        glareInner.style.transform = 'rotate(180deg) translate(-50%, -50%)';
        glareInner.style.transformOrigin = '0% 0%';
        glareInner.style.opacity = '0';
        
        // Add glare elements to DOM
        glareElement.appendChild(glareInner);
        
        // Make sure the element has position relative
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.position === 'static') {
            element.style.position = 'relative';
        }
        
        element.appendChild(glareElement);
    }
    
    // Prepare element for 3D transforms
    element.style.willChange = 'transform';
    element.style.transition = `transform ${settings.speed}ms cubic-bezier(.03,.98,.52,.99)`;
    
    // Handle mouse enter
    element.addEventListener('mouseenter', () => {
        element.style.transition = `transform ${settings.speed}ms cubic-bezier(.03,.98,.52,.99)`;
        if (settings.scale !== 1) {
            element.style.transform = `perspective(${settings.perspective}px) scale3d(${settings.scale}, ${settings.scale}, ${settings.scale})`;
        }
    });
    
    // Handle mouse move
    element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        // Calculate mouse position relative to element center (from -1 to 1)
        const mouseX = ((e.clientX - rect.left) / width) * 2 - 1;
        const mouseY = ((e.clientY - rect.top) / height) * 2 - 1;
        
        // Calculate tilt angles
        const tiltX = (settings.maxTilt / 2 - mouseY * settings.maxTilt).toFixed(2);
        const tiltY = (mouseX * settings.maxTilt - settings.maxTilt / 2).toFixed(2);
        
        // Apply transform
        element.style.transform = `perspective(${settings.perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) 
                                  ${settings.scale !== 1 ? `scale3d(${settings.scale}, ${settings.scale}, ${settings.scale})` : ''}`;
        
        // Update glare position
        if (settings.glare && glareElement) {
            const glareInner = glareElement.querySelector('.tilt-glare-inner');
            
            // Calculate glare position
            const glareX = mouseX * 100;
            const glareY = mouseY * 100;
            
            // Apply glare effect
            glareInner.style.transform = `rotate(180deg) translate(-50%, -50%)`;
            glareInner.style.opacity = `${Math.min(Math.max(Math.abs(mouseX) + Math.abs(mouseY), 0), 1) * settings.maxGlare}`;
            glareInner.style.top = `${50 + glareY}%`;
            glareInner.style.left = `${50 + glareX}%`;
        }
    });
    
    // Handle mouse leave
    element.addEventListener('mouseleave', () => {
        element.style.transition = `transform ${settings.speed}ms cubic-bezier(.03,.98,.52,.99)`;
        element.style.transform = `perspective(${settings.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        
        // Reset glare
        if (settings.glare && glareElement) {
            const glareInner = glareElement.querySelector('.tilt-glare-inner');
            glareInner.style.opacity = '0';
        }
    });
}

/**
 * Initialize scroll reveal animation for elements
 */
function initScrollReveal() {
    const elements = document.querySelectorAll('.post, .toc-container, .content');
    
    // Options for IntersectionObserver
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    // Create observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add 3D reveal animation class
                entry.target.classList.add('revealed');
                
                // Stop observing this element
                observer.unobserve(entry.target);
            }
        });
    }, options);
    
    // Observe each element
    elements.forEach((element, index) => {
        // Add base class for animation
        element.classList.add('reveal-3d');
        
        // Add delay based on index
        element.style.animationDelay = `${index * 0.1}s`;
        
        // Start observing
        observer.observe(element);
    });
}

// Add 3D effect to admin modals
function add3DModalEffect() {
    const modalContents = document.querySelectorAll('.modal-content');
    
    modalContents.forEach(modal => {
        // Add 3D effect to modal on open
        modal.addEventListener('animationstart', () => {
            if (modal.parentElement.style.display === 'block') {
                applyTiltToElement(modal, {
                    maxTilt: 2,
                    scale: 1,
                    glare: true,
                    maxGlare: 0.2
                });
            }
        });
    });
}

// Initialize modal effects
setTimeout(add3DModalEffect, 500);

// Update effects on window resize
window.addEventListener('resize', () => {
    // Re-initialize effects if needed
    if (window.innerWidth >= 992) {
        initParallaxEffect();
        initTiltEffect();
    }
});

// Export functions for use in main script
window.effects3D = {
    applyTiltToElement,
    applyParallaxToElement
};