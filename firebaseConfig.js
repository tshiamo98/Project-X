/**
 * firebaseConfig.js - UPDATED
 * 
 * Firebase configuration and initialization.
 * This file isolates Firebase setup and exports initialized services.
 * 
 * IMPORTANT: Replace the placeholder config with your actual Firebase config.
 * Get this from Firebase Console > Project Settings > Your apps > Config
 * 
 * To modify: Update the firebaseConfig object with your project's credentials.
 */

// Firebase configuration - REPLACE WITH YOUR CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyDummyKey-Example-ReplaceWithYours",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};

// Global flag to track Firebase initialization
window.firebaseReady = false;
window.firebaseError = null;

/**
 * Initialize Firebase with error handling
 */
function initializeFirebase() {
    try {
        // Check if Firebase is already initialized
        if (firebase.apps.length > 0) {
            console.log("Firebase already initialized");
            window.firebaseReady = true;
            return window.firebase.app();
        }
        
        // Initialize Firebase
        const app = firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully");
        
        // Get services
        const auth = firebase.auth();
        const db = firebase.firestore();
        
        // Try to enable persistence (optional)
        try {
            db.enablePersistence()
                .catch((err) => {
                    console.warn("Firestore offline persistence not enabled:", err.code);
                });
        } catch (persistenceError) {
            console.warn("Could not enable persistence:", persistenceError);
        }
        
        // Export services
        window.firebaseServices = {
            app: app,
            auth: auth,
            db: db,
            firebase: firebase
        };
        
        window.firebaseReady = true;
        window.firebaseError = null;
        
        // Dispatch custom event for other modules
        document.dispatchEvent(new CustomEvent('firebaseReady'));
        
        return app;
        
    } catch (error) {
        console.error("Firebase initialization error:", error);
        window.firebaseReady = false;
        window.firebaseError = error;
        
        // Create stub services
        window.firebaseServices = {
            app: null,
            auth: null,
            db: null,
            firebase: null
        };
        
        // Show user-friendly error after DOM loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', showFirebaseError);
        } else {
            showFirebaseError();
        }
        
        throw error;
    }
}

/**
 * Shows Firebase configuration error to user
 */
function showFirebaseError() {
    const authButtons = document.getElementById('authButtons');
    if (authButtons) {
        authButtons.innerHTML = `
            <div class="error-message" style="background: #fff0f0; padding: 1rem; border-radius: 0.5rem; border: 1px solid #ffcccc;">
                <p style="color: #cc0000; margin: 0 0 0.5rem 0; font-weight: bold;">
                    ⚠️ Firebase Configuration Required
                </p>
                <p style="color: #666; margin: 0; font-size: 0.9rem;">
                    1. Open <strong>js/firebaseConfig.js</strong><br>
                    2. Replace placeholder values with your Firebase config<br>
                    3. Refresh the page
                </p>
            </div>
        `;
    }
    
    // Also update hero message
    const authMessage = document.getElementById('authMessage');
    if (authMessage) {
        authMessage.innerHTML = `
            <p><strong>Setup Required:</strong> Please configure Firebase to enable authentication.</p>
            <p>Check the browser console for detailed instructions.</p>
        `;
    }
}

/**
 * Utility function to check if Firebase is properly initialized
 * @returns {boolean} True if Firebase services are available
 */
function isFirebaseInitialized() {
    return window.firebaseReady === true && 
           window.firebaseServices && 
           window.firebaseServices.auth !== null;
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

/**
 * Helper to get Firebase app instance
 * @returns {Object|null} Firebase app instance or null
 */
function getFirebaseApp() {
    return window.firebaseServices ? window.firebaseServices.app : null;
}

/**
 * Wait for Firebase to be ready
 * @returns {Promise} Resolves when Firebase is ready
 */
function waitForFirebase() {
    return new Promise((resolve, reject) => {
        if (window.firebaseReady) {
            resolve(window.firebaseServices);
            return;
        }
        
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds max
        
        const checkInterval = setInterval(() => {
            attempts++;
            
            if (window.firebaseReady) {
                clearInterval(checkInterval);
                resolve(window.firebaseServices);
            } else if (window.firebaseError) {
                clearInterval(checkInterval);
                reject(window.firebaseError);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                reject(new Error('Firebase initialization timeout'));
            }
        }, 100);
    });
}

// Initialize Firebase immediately
try {
    initializeFirebase();
} catch (error) {
    console.error("Failed to initialize Firebase:", error);
}

// Export utility functions
window.firebaseUtils = {
    isInitialized: isFirebaseInitialized,
    getAuth: getAuth,
    getFirestore: getFirestore,
    getApp: getFirebaseApp,
    waitForReady: waitForFirebase,
    config: firebaseConfig
};

// For debugging
console.log("Firebase utilities loaded");