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
                window.location.href = 'personal-info.html';
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
                window.location.href = 'personal-info.html';
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
            window.location.href = 'index.html';
        })
        .catch((error) => {
            showStatus(error.message, true);
        });
}

// Auth state observer
auth.onAuthStateChanged((user) => {
    const loginBtn = document.querySelector('.btn-login');
    const signupBtn = document.querySelector('.btn-signup');
    const logoutBtn = document.querySelector('.btn-logout');
    const skipBtn = document.querySelector('.btn-skip');
    const userEmail = document.querySelector('.user-email');

    if (user) {
        // User is signed in
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
            logoutBtn.addEventListener('click', handleLogout);
        }
        if (skipBtn) skipBtn.style.display = 'none';
        if (userEmail) {
            userEmail.textContent = user.email;
            userEmail.style.display = 'block';
        }
    } else {
        // User is signed out
        if (loginBtn) loginBtn.style.display = 'block';
        if (signupBtn) signupBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userEmail) userEmail.style.display = 'none';
    }
}); 