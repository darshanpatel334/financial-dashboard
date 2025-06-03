// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAh66rMg38jmbbuKghE4N06I8y6ytpLOyk",
    authDomain: "niveshmatrix.firebaseapp.com",
    projectId: "niveshmatrix",
    storageBucket: "niveshmatrix.firebasestorage.app",
    messagingSenderId: "209873776029",
    appId: "1:209873776029:web:f8e71cb0bd0f014a841374",
    measurementId: "G-MRDPMD15GZ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Status message display function
function showStatus(message, isError = false) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status-message ${isError ? 'error' : 'success'}`;
        statusElement.style.display = 'block';
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
    }
}

// Sign Up functionality
function handleSignUp(event) {
    event.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            showStatus('Account created successfully! Redirecting...');
            // Redirect to personal info page
            setTimeout(() => {
                window.location.href = '../dashboard/personal-info.html';
            }, 1500);
        })
        .catch((error) => {
            showStatus(error.message, true);
        });
}

// Login functionality
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            showStatus('Login successful! Redirecting...');
            // Redirect to personal info page
            setTimeout(() => {
                window.location.href = '../dashboard/personal-info.html';
            }, 1500);
        })
        .catch((error) => {
            showStatus(error.message, true);
        });
}

// Logout functionality
function handleLogout() {
    auth.signOut()
        .then(() => {
            showStatus('Logged out successfully!');
            // Redirect to landing page
            window.location.href = '../pages/landing.html';
        })
        .catch((error) => {
            showStatus(error.message, true);
        });
}

// Auth state observer
auth.onAuthStateChanged((user) => {
    const loginBtn = document.querySelector('.auth-buttons .btn-secondary');
    const signupBtn = document.querySelector('.auth-buttons .btn-primary');
    const skipBtn = document.querySelector('.btn-outline-light');
    const getStartedBtns = document.querySelectorAll('a[href="signup.html"]');

    if (user) {
        // User is signed in
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) {
            signupBtn.textContent = 'Dashboard';
            signupBtn.href = '../dashboard/personal-info.html';
        }
        if (skipBtn) skipBtn.style.display = 'none';
        getStartedBtns.forEach(btn => {
            btn.textContent = 'Go to Dashboard';
            btn.href = '../dashboard/personal-info.html';
        });
    } else {
        // User is signed out
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signupBtn) {
            signupBtn.textContent = 'Sign Up';
            signupBtn.href = 'signup.html';
        }
        // Don't show skip button when logged out
        if (skipBtn) skipBtn.style.display = 'none';
        getStartedBtns.forEach(btn => {
            btn.textContent = 'Get Started Free';
            btn.href = 'signup.html';
        });
    }
});

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