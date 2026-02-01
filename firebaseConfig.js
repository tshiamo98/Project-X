/**
 * firebaseConfig.js - WITH GOOGLE AUTH
 * 
 * Firebase configuration and initialization with Google Authentication.
 */

// Firebase configuration - USE YOUR CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAReTKzhf1Q6AS_x4Zh7ofFwVNz0hAWAAY",
    authDomain: "project-x-9f235.firebaseapp.com",
    projectId: "project-x-9f235",
    storageBucket: "project-x-9f235.firebasestorage.app",
    messagingSenderId: "279161870858",
    appId: "1:279161870858:web:309ed5154d6c9255829df3",
    measurementId: "G-9S8RDQMT0Y"
};

// Global flag to track Firebase initialization
window.firebaseReady = false;
window.firebaseError = null;
window.firebaseServices = null;

/**
 * Initialize Firebase with error handling
 */
function initializeFirebase() {
    console.log("Initializing Firebase...");
    
    // Check if Firebase SDK is loaded
    if (typeof firebase === 'undefined') {
        const error = new Error('Firebase SDK not loaded. Check script tags in HTML.');
        console.error(error);
        window.firebaseError = error;
        showFirebaseError('Firebase SDK not loaded. Check browser console.');
        throw error;
    }
    
    try {
        // Check if Firebase is already initialized
        if (firebase.apps.length > 0) {
            console.log("Firebase already initialized");
            const app = firebase.app();
            setupFirebaseServices(app);
            return app;
        }
        
        // Initialize Firebase
        const app = firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully");
        
        setupFirebaseServices(app);
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
            firebase: firebase
        };
        
        showFirebaseError('Firebase initialization failed. Check console.');
        throw error;
    }
}

/**
 * Sets up Firebase services after initialization
 */
function setupFirebaseServices(app) {
    try {
        // Get services
        const auth = firebase.auth();
        const db = firebase.firestore();
        
        // Enable Google Auth provider
        const googleProvider = new firebase.auth.GoogleAuthProvider();
        googleProvider.addScope('email');
        googleProvider.addScope('profile');
        
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
            firebase: firebase,
            googleProvider: googleProvider
        };
        
        window.firebaseReady = true;
        window.firebaseError = null;
        
        console.log("Firebase services set up successfully");
        console.log("Google Authentication is enabled");
        
        // Dispatch custom event for other modules
        document.dispatchEvent(new CustomEvent('firebaseReady'));
        
    } catch (error) {
        console.error("Failed to set up Firebase services:", error);
        throw error;
    }
}

/**
 * Shows Firebase configuration error to user
 */
function showFirebaseError(message) {
    console.error("Firebase Error:", message);
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => showFirebaseErrorUI(message));
    } else {
        showFirebaseErrorUI(message);
    }
}

/**
 * Shows Firebase error in UI
 */
function showFirebaseErrorUI(message) {
    const authButtons = document.getElementById('authButtons');
    if (authButtons) {
        authButtons.innerHTML = `
            <div class="error-message" style="background: #fff0f0; padding: 1rem; border-radius: 0.5rem; border: 1px solid #ffcccc;">
                <p style="color: #cc0000; margin: 0 0 0.5rem 0; font-weight: bold;">
                    ⚠️ Firebase Error
                </p>
                <p style="color: #666; margin: 0; font-size: 0.9rem;">
                    ${message}<br>
                    Check browser console for details.
                </p>
            </div>
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
 * Helper to get Google Auth provider
 * @returns {Object|null} Google Auth provider or null
 */
function getGoogleProvider() {
    return window.firebaseServices ? window.firebaseServices.googleProvider : null;
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
        const maxAttempts = 50; // 5 seconds max
        
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
                reject(new Error('Firebase initialization timeout after 5 seconds'));
            }
        }, 100);
    });
}

// Initialize Firebase when the script loads
(function init() {
    console.log("Loading Firebase configuration...");
    
    // Wait a bit for Firebase SDK to load if needed
    if (typeof firebase === 'undefined') {
        console.warn("Firebase SDK not loaded yet, waiting...");
        
        // Try again after a short delay
        setTimeout(() => {
            if (typeof firebase !== 'undefined') {
                initializeFirebase();
            } else {
                console.error("Firebase SDK still not loaded after delay");
                showFirebaseError('Firebase SDK failed to load. Check network and script tags.');
            }
        }, 1000);
    } else {
        // Firebase SDK is loaded, initialize now
        try {
            initializeFirebase();
        } catch (error) {
            console.error("Failed to initialize Firebase:", error);
        }
    }
})();

// Export utility functions
window.firebaseUtils = {
    isInitialized: isFirebaseInitialized,
    getAuth: getAuth,
    getFirestore: getFirestore,
    getGoogleProvider: getGoogleProvider,
    getApp: getFirebaseApp,
    waitForReady: waitForFirebase,
    config: firebaseConfig
};

// For debugging
console.log("Firebase utilities module loaded with Google Auth support");