/**
 * main.js
 * 
 * Main application entry point and initialization.
 * Coordinates all modules and handles global application state.
 * 
 * This is the glue that ties everything together.
 * 
 * To modify: Add new module initializations or global event handlers.
 */

// Application state
const AppState = {
    isInitialized: false,
    currentUser: null,
    userData: null,
    isLoading: false
};

/**
 * Main initialization function
 */
async function initApp() {
    console.log('Initializing application...');
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Wait for Firebase to initialize
        await waitForFirebase();
        
        // Initialize all modules
        initModules();
        
        // Set up global error handling
        setupGlobalErrorHandling();
        
        // Update app state
        AppState.isInitialized = true;
        
        console.log('Application initialized successfully');
        
        // Dispatch app ready event
        document.dispatchEvent(new CustomEvent('appReady'));
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showCriticalError('Failed to initialize application. Please refresh the page.');
        
    } finally {
        setLoadingState(false);
    }
}

/**
 * Waits for Firebase to be fully initialized
 * @returns {Promise} Promise that resolves when Firebase is ready
 */
function waitForFirebase() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        const checkFirebase = () => {
            attempts++;
            
            if (window.firebaseUtils && window.firebaseUtils.isInitialized()) {
                resolve();
            } else if (attempts >= maxAttempts) {
                reject(new Error('Firebase initialization timeout'));
            } else {
                setTimeout(checkFirebase, 100);
            }
        };
        
        checkFirebase();
    });
}

/**
 * Initializes all application modules
 */
function initModules() {
    // Module initialization order matters
    // 1. Error handler is already loaded
    // 2. Firebase config is loaded via script tag
    // 3. Auth module initializes automatically
    // 4. Auth UI initializes automatically
    
    // Verify all modules are loaded
    const requiredModules = [
        { name: 'firebaseUtils', check: () => window.firebaseUtils },
        { name: 'errorHandler', check: () => window.errorHandler },
        { name: 'authModule', check: () => window.authModule },
        { name: 'authUI', check: () => window.authUI }
    ];
    
    const missingModules = requiredModules.filter(module => !module.check());
    
    if (missingModules.length > 0) {
        throw new Error(`Missing modules: ${missingModules.map(m => m.name).join(', ')}`);
    }
    
    console.log('All modules loaded successfully');
}

/**
 * Sets up global error handling for uncaught errors
 */
function setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        
        // Show user-friendly error for auth errors
        if (event.reason?.code?.startsWith?.('auth/')) {
            window.errorHandler?.handleFirebaseError(event.reason, 'Unhandled auth error');
        }
    });
    
    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        
        // Don't show critical errors for minor issues
        if (!event.error.message?.includes('firebase')) {
            return;
        }
        
        // Show critical error for Firebase issues
        if (event.error.message?.includes('firebase')) {
            showCriticalError('Firebase error occurred. Please check console.');
        }
    });
}

/**
 * Shows a critical error message that blocks the app
 * @param {string} message - Error message to display
 */
function showCriticalError(message) {
    const errorHtml = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #ffcccc, #ff9999);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 2rem;
        ">
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 1rem;
                max-width: 500px;
                text-align: center;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            ">
                <h2 style="color: #cc0000; margin-bottom: 1rem;">⚠️ Application Error</h2>
                <p style="margin-bottom: 1.5rem;">${message}</p>
                <button onclick="window.location.reload()" style="
                    background: linear-gradient(135deg, #ff6666, #cc0000);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 2rem;
                    font-weight: bold;
                    cursor: pointer;
                ">
                    Refresh Page
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', errorHtml);
}

/**
 * Sets loading state for the entire application
 * @param {boolean} isLoading - Whether app is loading
 */
function setLoadingState(isLoading) {
    AppState.isLoading = isLoading;
    
    const loadingIndicator = document.getElementById('appLoadingIndicator');
    
    if (isLoading) {
        // Create loading indicator if it doesn't exist
        if (!loadingIndicator) {
            const indicator = document.createElement('div');
            indicator.id = 'appLoadingIndicator';
            indicator.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
                z-index: 9999;
                animation: loadingPulse 1.5s infinite;
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                @keyframes loadingPulse {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(indicator);
        } else {
            loadingIndicator.style.display = 'block';
        }
        
    } else if (loadingIndicator) {
        // Fade out loading indicator
        loadingIndicator.style.opacity = '0';
        loadingIndicator.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            if (loadingIndicator.parentNode) {
                loadingIndicator.parentNode.removeChild(loadingIndicator);
            }
        }, 300);
    }
}

/**
 * Gets current application state
 * @returns {Object} Current app state
 */
function getAppState() {
    return { ...AppState };
}

/**
 * Updates application state
 * @param {Object} updates - State updates to apply
 */
function updateAppState(updates) {
    Object.assign(AppState, updates);
    
    // Dispatch state change event
    document.dispatchEvent(new CustomEvent('appStateChanged', {
        detail: { state: getAppState() }
    }));
}

/**
 * Listens for auth changes and updates app state
 */
document.addEventListener('authStateChanged', (event) => {
    updateAppState({
        currentUser: event.detail.user,
        userData: event.detail.userData
    });
});

/**
 * Listens for user data updates
 */
document.addEventListener('userDataUpdated', (event) => {
    updateAppState({
        userData: event.detail.userData
    });
});

/**
 * Global helper to check if app is ready
 * @returns {boolean} True if app is fully initialized
 */
function isAppReady() {
    return AppState.isInitialized && !AppState.isLoading;
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export app utilities
window.app = {
    initApp: initApp,
    getState: getAppState,
    updateState: updateAppState,
    isReady: isAppReady,
    setLoading: setLoadingState
};

// Make app state available for debugging (development only)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.AppState = AppState;
}