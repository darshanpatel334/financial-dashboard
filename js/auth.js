document.addEventListener('DOMContentLoaded', function() {
    // Password visibility toggle
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Password validation
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        const requirements = document.querySelectorAll('.requirement');
        
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            
            // Length check
            const lengthReq = document.querySelector('[data-requirement="length"]');
            if (password.length >= 8) {
                lengthReq?.classList.add('valid');
            } else {
                lengthReq?.classList.remove('valid');
            }
            
            // Uppercase check
            const upperReq = document.querySelector('[data-requirement="uppercase"]');
            if (/[A-Z]/.test(password)) {
                upperReq?.classList.add('valid');
            } else {
                upperReq?.classList.remove('valid');
            }
            
            // Number check
            const numberReq = document.querySelector('[data-requirement="number"]');
            if (/[0-9]/.test(password)) {
                numberReq?.classList.add('valid');
            } else {
                numberReq?.classList.remove('valid');
            }
            
            // Special character check
            const specialReq = document.querySelector('[data-requirement="special"]');
            if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                specialReq?.classList.add('valid');
            } else {
                specialReq?.classList.remove('valid');
            }
        });
    }

    // Form submission
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add your login logic here
            console.log('Login form submitted');
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add your signup logic here
            console.log('Signup form submitted');
        });
    }
}); 