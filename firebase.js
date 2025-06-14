// Firebase Modular SDK v11.9.1 Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { getAuth, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';
import { getFirestore, connectFirestoreEmulator } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js';

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
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Export the initialized services for use in other modules
export { app, auth, db }; 