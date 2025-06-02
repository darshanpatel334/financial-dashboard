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
                button.href = 'pages/dashboard.html';
                button.textContent = 'Go to Dashboard';
            }
        }
    });

    // Update navigation based on user status
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (link.textContent === 'Get Started' && hasCompletedOnboarding) {
            link.textContent = 'Dashboard';
            link.href = 'pages/dashboard.html';
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

// Mobile navigation toggle
function toggleMobileNav() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('show');
}

// Add mobile navigation button
const navbar = document.querySelector('.navbar .container');
const mobileNavButton = document.createElement('button');
mobileNavButton.className = 'mobile-nav-toggle';
mobileNavButton.innerHTML = '<i class="fas fa-bars"></i>';
mobileNavButton.onclick = toggleMobileNav;

// Only add mobile nav button on small screens
if (window.innerWidth <= 768) {
    navbar.appendChild(mobileNavButton);
} 