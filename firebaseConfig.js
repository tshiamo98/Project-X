/**
 * firebaseConfig.js
 * 
 * Firebase configuration and initialization.
 * This file isolates Firebase setup and exports initialized services.
 * 
 * IMPORTANT: Replace the placeholder config with your actual Firebase config.
 * Get this from Firebase Console > Project Settings > Your apps > Config
 * 
 * To modify: Update the firebaseConfig object with your project's credentials.
 */


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAReTKzhf1Q6AS_x4Zh7ofFwVNz0hAWAAY",
  authDomain: "project-x-9f235.firebaseapp.com",
  projectId: "project-x-9f235",
  storageBucket: "project-x-9f235.firebasestorage.app",
  messagingSenderId: "279161870858",
  appId: "1:279161870858:web:309ed5154d6c9255829df3",
  measurementId: "G-9S8RDQMT0Y"
};

// Initialize Firebase
try {
    // Initialize Firebase App
    firebase.initializeApp(firebaseConfig);
    
    // Get Firebase services
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // Enable Firestore offline persistence (optional but recommended)
    db.enablePersistence()
        .catch((err) => {
            console.warn("Firestore offline persistence not enabled:", err.code);
        });
    
    // Log successful initialization
    console.log("Firebase initialized successfully");
    
    // Export services for use in other modules
    window.firebaseServices = {
        auth: auth,
        db: db,
        firebase: firebase
    };
    
} catch (error) {
    console.error("Firebase initialization error:", error);
    
    // Create stub services if Firebase fails to initialize
    window.firebaseServices = {
        auth: null,
        db: null,
        firebase: null
    };
    
    // Show user-friendly error
    document.addEventListener('DOMContentLoaded', () => {
        const authButtons = document.getElementById('authButtons');
        if (authButtons) {
            authButtons.innerHTML = `
                <div class="error-message" style="background: #ffcccc; padding: 1rem; border-radius: 0.5rem;">
                    <p style="color: #cc0000; margin: 0;">
                        ⚠️ Firebase configuration required. Please update firebaseConfig.js with your project credentials.
                    </p>
                </div>
            `;
        }
    });
}

/**
 * Utility function to check if Firebase is properly initialized
 * @returns {boolean} True if Firebase services are available
 */
function isFirebaseInitialized() {
    return window.firebaseServices && 
           window.firebaseServices.auth && 
           window.firebaseServices.db;
}

/**
 * Helper to get Firebase auth instance
 * @returns {Object|null} Firebase auth instance or null
 */
function getAuth() {
    return window.firebaseServices ? window.firebaseServices.auth : null;
}

/**
 * Helper to get Firestore instance
 * @returns {Object|null} Firestore instance or null
 */
function getFirestore() {
    return window.firebaseServices ? window.firebaseServices.db : null;
}

// Export utility functions
window.firebaseUtils = {
    isInitialized: isFirebaseInitialized,
    getAuth: getAuth,
    getFirestore: getFirestore
};