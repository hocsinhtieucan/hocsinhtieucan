/* Simple 3D effects for WEBCONFESSION */

document.addEventListener('DOMContentLoaded', () => {
  // Add tilt effect to cards
  const addTiltEffect = () => {
    const cards = document.querySelectorAll('.content-card');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  };
  
  // Add observer to apply effects when elements come into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  // Apply effects when content is loaded
  const applyEffects = () => {
    const cards = document.querySelectorAll('.content-card');
    cards.forEach(card => {
      observer.observe(card);
      card.style.transition = 'all 0.3s ease';
    });
    
    // Add tilt effect after posts are loaded
    addTiltEffect();
  };
  
  // Add event listener to the custom event that fires when posts are loaded
  document.addEventListener('postsLoaded', applyEffects);
});