/**
 * main.js - SIMPLIFIED VERSION
 * 
 * Main application entry point and initialization.
 */

// Application state
const AppState = {
    isInitialized: false,
    currentUser: null,
    userData: null,
    isLoading: false,
    firebaseReady: false
};

/**
 * Main initialization function
 */
async function initApp() {
    console.log('Initializing application...');
    
    try {
        // Simple check for Firebase
        await checkFirebase();
        
        // Wait for modules to load
        await waitForModules();
        
        // Update UI
        if (window.authUI && window.authUI.updateAuthUI) {
            window.authUI.updateAuthUI();
        }
        
        AppState.isInitialized = true;
        AppState.firebaseReady = true;
        
        console.log('Application initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showSimpleError('Failed to initialize. Check console for details.');
    }
}

/**
 * Simple Firebase check
 */
async function checkFirebase() {
    console.log("Checking Firebase...");
    
    // Wait for firebaseUtils to be available
    let attempts = 0;
    while (!window.firebaseUtils && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (!window.firebaseUtils) {
        throw new Error('Firebase utilities not loaded');
    }
    
    // Wait for Firebase to be ready
    if (window.firebaseUtils.waitForReady) {
        await window.firebaseUtils.waitForReady();
    }
    
    console.log("Firebase check passed");
}

/**
 * Wait for modules to load
 */
async function waitForModules() {
    const modules = ['errorHandler', 'authModule', 'authUI'];
    
    for (const moduleName of modules) {
        let attempts = 0;
        while (!window[moduleName] && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window[moduleName]) {
            console.warn(`Module ${moduleName} not loaded`);
        }
    }
    
    console.log("All modules loaded");
}

/**
 * Show simple error
 */
function showSimpleError(message) {
    const authMessage = document.getElementById('authMessage');
    if (authMessage) {
        authMessage.innerHTML = `
            <div style="background: #fff0f0; padding: 1rem; border-radius: 0.5rem; border: 1px solid #ffcccc;">
                <p style="color: #cc0000; margin: 0 0 0.5rem 0; font-weight: bold;">
                    ⚠️ Application Error
                </p>
                <p style="color: #666; margin: 0;">
                    ${message}
                </p>
                <button onclick="window.location.reload()" style="
                    margin-top: 0.5rem;
                    background: #ff6666;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                ">
                    Refresh Page
                </button>
            </div>
        `;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM already loaded
    setTimeout(initApp, 500);
}

// Export for debugging
window.AppState = AppState;