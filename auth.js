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

// Close all modals
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.style.display = 'none');
}

// Sign Up functionality
function handleSignUp(event) {
    event.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            showStatus('Account created successfully! Please log in.');
            // Clear the form
            document.getElementById('signupEmail').value = '';
            document.getElementById('signupPassword').value = '';
            // Close the modal
            closeAllModals();
            // Switch to login modal
            document.getElementById('loginModal').style.display = 'block';
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
            showStatus('Login successful!');
            // Clear the form
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
            // Close the modal
            closeAllModals();
            // Redirect to networth.html
            window.location.href = 'pages/networth.html';
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
            // Redirect to home page
            window.location.href = 'index.html';
        })
        .catch((error) => {
            showStatus(error.message, true);
        });
}

// Auth state observer
auth.onAuthStateChanged((user) => {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userEmail = document.getElementById('userEmail');
    const getStartedBtn = document.getElementById('getStartedBtn');

    if (user) {
        // User is signed in
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (userEmail) {
            userEmail.textContent = user.email;
            userEmail.style.display = 'block';
        }
        if (getStartedBtn) getStartedBtn.style.display = 'none';

        // If on index page, redirect to networth
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            window.location.href = 'pages/networth.html';
        }
    } else {
        // User is signed out
        if (loginBtn) loginBtn.style.display = 'block';
        if (signupBtn) signupBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userEmail) userEmail.style.display = 'none';
        if (getStartedBtn) getStartedBtn.style.display = 'block';

        // If on protected pages, redirect to index
        if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
            window.location.href = '../index.html';
        }
    }
});

// Add event listeners when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignUp);
    }
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}); 