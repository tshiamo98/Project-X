/**
 * auth.js
 * 
 * Core authentication logic using Firebase Authentication.
 * Handles user sign up, login, logout, and session management.
 * 
 * This module is pure business logic - no UI manipulation.
 * UI updates are handled by uiAuth.js.
 * 
 * To modify: Add new authentication methods or change user data structure.
 */

// Wait for Firebase to initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase is initialized
    if (!window.firebaseUtils || !window.firebaseUtils.isInitialized()) {
        console.error('Firebase not initialized. Check firebaseConfig.js');
        return;
    }
    
    // Initialize auth module
    initAuth();
});

/**
 * Main authentication initialization
 */
function initAuth() {
    const auth = window.firebaseUtils.getAuth();
    
    if (!auth) {
        console.error('Firebase Auth not available');
        return;
    }
    
    // Set up auth state listener
    auth.onAuthStateChanged(handleAuthStateChange);
    
    console.log('Auth module initialized');
}

/**
 * Handles authentication state changes
 * @param {Object|null} user - Firebase user object or null if logged out
 */
function handleAuthStateChange(user) {
    // This function is called whenever auth state changes
    // UI updates are handled by uiAuth.js via events
    
    if (user) {
        // User is signed in
        console.log('User signed in:', user.email);
        
        // Ensure user document exists in Firestore
        createUserDocument(user).catch(console.error);
        
        // Dispatch custom event for UI updates
        const event = new CustomEvent('authStateChanged', { 
            detail: { 
                isLoggedIn: true, 
                user: user,
                userData: null // Will be populated by UI layer if needed
            } 
        });
        document.dispatchEvent(event);
        
    } else {
        // User is signed out
        console.log('User signed out');
        
        // Dispatch custom event for UI updates
        const event = new CustomEvent('authStateChanged', { 
            detail: { 
                isLoggedIn: false, 
                user: null,
                userData: null
            } 
        });
        document.dispatchEvent(event);
    }
}

/**
 * Creates or updates user document in Firestore
 * @param {Object} user - Firebase user object
 * @returns {Promise} Promise resolving when document is saved
 */
async function createUserDocument(user) {
    const db = window.firebaseUtils.getFirestore();
    
    if (!db) {
        console.warn('Firestore not available, skipping user document creation');
        return;
    }
    
    try {
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        
        const userData = {
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            createdAt: userDoc.exists ? userDoc.data().createdAt : firebase.firestore.FieldValue.serverTimestamp(),
            lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await userRef.set(userData, { merge: true });
        
        console.log('User document saved/updated for:', user.email);
        
        // Dispatch event with user data
        const event = new CustomEvent('userDataUpdated', { 
            detail: { 
                userData: userData 
            } 
        });
        document.dispatchEvent(event);
        
    } catch (error) {
        console.error('Error creating user document:', error);
        // Don't throw - this shouldn't block auth flow
    }
}

/**
 * Signs up a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {Object} additionalData - Additional user data (optional)
 * @returns {Promise<Object>} Promise resolving to user object
 */
async function signUp(email, password, additionalData = {}) {
    const auth = window.firebaseUtils.getAuth();
    
    if (!auth) {
        throw new Error('Authentication service not available');
    }
    
    try {
        // Create user with email/password
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update profile with additional data if provided
        if (additionalData.displayName) {
            await user.updateProfile({
                displayName: additionalData.displayName
            });
        }
        
        console.log('User signed up successfully:', email);
        return user;
        
    } catch (error) {
        console.error('Sign up error:', error);
        throw error; // Re-throw for error handling
    }
}

/**
 * Signs in an existing user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Promise resolving to user object
 */
async function signIn(email, password) {
    const auth = window.firebaseUtils.getAuth();
    
    if (!auth) {
        throw new Error('Authentication service not available');
    }
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('User signed in successfully:', email);
        return user;
        
    } catch (error) {
        console.error('Sign in error:', error);
        throw error; // Re-throw for error handling
    }
}

/**
 * Signs out the current user
 * @returns {Promise<void>} Promise resolving when sign out is complete
 */
async function signOut() {
    const auth = window.firebaseUtils.getAuth();
    
    if (!auth) {
        throw new Error('Authentication service not available');
    }
    
    try {
        await auth.signOut();
        console.log('User signed out successfully');
        
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
}

/**
 * Gets the current authenticated user
 * @returns {Object|null} Current user or null if not authenticated
 */
function getCurrentUser() {
    const auth = window.firebaseUtils.getAuth();
    return auth ? auth.currentUser : null;
}

/**
 * Checks if a user is currently authenticated
 * @returns {boolean} True if user is logged in
 */
function isUserLoggedIn() {
    return getCurrentUser() !== null;
}

/**
 * Gets the current user's authentication token
 * @returns {Promise<string|null>} Promise resolving to token or null
 */
async function getAuthToken() {
    const user = getCurrentUser();
    if (!user) return null;
    
    try {
        const token = await user.getIdToken();
        return token;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
}

/**
 * Sends a password reset email
 * @param {string} email - User's email address
 * @returns {Promise<void>} Promise resolving when email is sent
 */
async function sendPasswordResetEmail(email) {
    const auth = window.firebaseUtils.getAuth();
    
    if (!auth) {
        throw new Error('Authentication service not available');
    }
    
    try {
        await auth.sendPasswordResetEmail(email);
        console.log('Password reset email sent to:', email);
        
    } catch (error) {
        console.error('Password reset error:', error);
        throw error;
    }
}

/**
 * Updates user profile information
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<void>} Promise resolving when profile is updated
 */
async function updateUserProfile(profileData) {
    const user = getCurrentUser();
    
    if (!user) {
        throw new Error('No user is currently signed in');
    }
    
    try {
        await user.updateProfile(profileData);
        console.log('User profile updated');
        
        // Trigger auth state change to update UI
        handleAuthStateChange(user);
        
    } catch (error) {
        console.error('Profile update error:', error);
        throw error;
    }
}

// Export authentication functions
window.authModule = {
    // Core functions
    signUp: signUp,
    signIn: signIn,
    signOut: signOut,
    
    // Utility functions
    getCurrentUser: getCurrentUser,
    isUserLoggedIn: isUserLoggedIn,
    getAuthToken: getAuthToken,
    
    // Account management
    sendPasswordResetEmail: sendPasswordResetEmail,
    updateUserProfile: updateUserProfile,
    
    // Event names (for UI layer to listen to)
    events: {
        AUTH_CHANGED: 'authStateChanged',
        USER_DATA_UPDATED: 'userDataUpdated'
    }
};