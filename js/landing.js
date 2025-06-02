document.addEventListener('DOMContentLoaded', function() {
    checkUserStatus();
    initializeAnimations();
});

function initializeAnimations() {
    // Add fade-in animation to sections as they come into view
    const sections = document.querySelectorAll('section');
    
    // Add initial CSS classes
    sections.forEach(section => {
        section.classList.add('animate-on-scroll');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    sections.forEach(section => {
        observer.observe(section);
    });
}

function checkUserStatus() {
    // Check if user has completed onboarding
    const userState = AppState.personalInfo;
    const hasCompletedOnboarding = userState && userState.name;

    // Update navigation based on user status
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (link.textContent === 'Get Started' && hasCompletedOnboarding) {
            link.textContent = 'Dashboard';
            link.href = '../index.html';
        }
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}); 