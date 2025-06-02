document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    checkUserStatus();
});

function initializeAnimations() {
    // Add fade-in animation to sections as they come into view
    const sections = document.querySelectorAll('section');
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
        section.style.opacity = '0';
        observer.observe(section);
    });
}

function checkUserStatus() {
    // Check if user has completed onboarding
    const userState = AppState.personalInfo;
    const hasCompletedOnboarding = userState && userState.name;

    // Update CTA buttons based on user status
    const ctaButtons = document.querySelectorAll('.cta-buttons a');
    ctaButtons.forEach(button => {
        if (hasCompletedOnboarding) {
            if (button.classList.contains('btn-primary')) {
                button.href = '../index.html';
                button.textContent = 'Go to Dashboard';
            }
        }
    });

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