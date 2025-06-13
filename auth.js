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

// Configure Google Sign-In provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

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
    console.log('handleSignUp called'); // Debug log
    event.preventDefault();
    const firstName = document.getElementById('signupFirstName').value;
    const lastName = document.getElementById('signupLastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    console.log('Signup data:', { firstName, lastName, email, passwordLength: password.length }); // Debug log

    if (!firstName || !lastName || !email || !password) {
        showStatus('Please fill in all fields', true);
        return;
    }

    if (password.length < 6) {
        showStatus('Password must be at least 6 characters long', true);
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('Sign up successful:', userCredential.user.email); // Debug log
            
            // Store user's name information
            const userData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                signupDate: new Date().toISOString()
            };
            
            // Save to localStorage
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Also save as personal info to kickstart the journey
            const personalInfo = {
                firstName: firstName,
                lastName: lastName,
                email: email
            };
            localStorage.setItem('personalInfo', JSON.stringify(personalInfo));
            
            showStatus('Account created successfully! Redirecting...');
            
            // Use smart redirect to determine where to go
            setTimeout(() => {
                const nextPage = window.smartRedirect ? window.smartRedirect() : 'personal-info.html';
                window.location.href = nextPage;
            }, 1500);
        })
        .catch((error) => {
            console.error('Sign up error:', error); // Debug log
            showStatus(error.message, true);
        });
}

// Login functionality
function handleLogin(event) {
    console.log('handleLogin called'); // Debug log
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    console.log('Login attempt for:', email); // Debug log

    if (!email || !password) {
        showStatus('Please fill in all fields', true);
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('Login successful:', userCredential.user.email); // Debug log
            showStatus('Login successful! Redirecting...');
            
            // Use smart redirect to determine where to go
            setTimeout(() => {
                const nextPage = window.smartRedirect ? window.smartRedirect() : 'personal-info.html';
                window.location.href = nextPage;
            }, 1500);
        })
        .catch((error) => {
            console.error('Login error:', error); // Debug log
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

// Google Sign-In functionality
function handleGoogleSignIn() {
    console.log('Google Sign-In initiated'); // Debug log
    
    auth.signInWithPopup(googleProvider)
        .then((result) => {
            console.log('Google Sign-In successful:', result.user.email); // Debug log
            const user = result.user;
            
            // Extract user information
            const userData = {
                firstName: user.displayName ? user.displayName.split(' ')[0] : '',
                lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
                email: user.email,
                photoURL: user.photoURL,
                signupDate: new Date().toISOString(),
                provider: 'google'
            };
            
            // Save to localStorage
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Also save as personal info to kickstart the journey
            const personalInfo = {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email
            };
            localStorage.setItem('personalInfo', JSON.stringify(personalInfo));
            
            showStatus('Google Sign-In successful! Redirecting...');
            
            // Close any open modals
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => modal.style.display = 'none');
            
            // Use smart redirect to determine where to go
            setTimeout(() => {
                const nextPage = window.smartRedirect ? window.smartRedirect() : 'personal-info.html';
                window.location.href = nextPage;
            }, 1500);
        })
        .catch((error) => {
            console.error('Google Sign-In error:', error); // Debug log
            let errorMessage = 'Google Sign-In failed';
            
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    errorMessage = 'Sign-in was cancelled';
                    break;
                case 'auth/popup-blocked':
                    errorMessage = 'Popup was blocked. Please allow popups and try again';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your connection';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            showStatus(errorMessage, true);
        });
}

// Utility function to get user's display name
function getUserDisplayName() {
    // First try to get from stored user data
    const userData = localStorage.getItem('userData');
    if (userData) {
        const parsedData = JSON.parse(userData);
        if (parsedData.firstName) {
            return parsedData.firstName;
        }
    }
    
    // Fallback to personal info
    const personalInfo = localStorage.getItem('personalInfo');
    if (personalInfo) {
        const parsedInfo = JSON.parse(personalInfo);
        if (parsedInfo.firstName) {
            return parsedInfo.firstName;
        }
    }
    
    // Last resort: extract first name from email
    const currentUser = firebase.auth().currentUser;
    if (currentUser && currentUser.email) {
        const emailPart = currentUser.email.split('@')[0];
        // Try to extract first name from email (before any numbers or dots)
        const namePart = emailPart.replace(/[0-9]/g, '').split('.')[0];
        return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    
    return 'User';
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
            userEmail.textContent = getUserDisplayName();
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