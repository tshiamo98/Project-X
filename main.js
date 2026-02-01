/**
 * main.js - UPDATED
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
    isLoading: false,
    firebaseReady: false
};

/**
 * Main initialization function
 */
async function initApp() {
    console.log('Initializing application...');
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        // Wait for Firebase to initialize
        await waitForFirebaseWithRetry();
        
        // Initialize all modules
        initModules();
        
        // Set up global error handling
        setupGlobalErrorHandling();
        
        // Update app state
        AppState.isInitialized = true;
        AppState.firebaseReady = true;
        
        console.log('Application initialized successfully');
        
        // Dispatch app ready event
        document.dispatchEvent(new CustomEvent('appReady'));
        
        // Initial UI update
        if (window.authUI && window.authUI.updateAuthUI) {
            window.authUI.updateAuthUI();
        }
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        
        // Show appropriate error message
        if (error.message.includes('Firebase configuration')) {
            showConfigurationError();
        } else if (error.message.includes('timeout')) {
            showTimeoutError();
        } else {
            showCriticalError('Failed to initialize application. Please check console for details.');
        }
        
        // Update UI to show error state
        updateUIForErrorState();
        
    } finally {
        setLoadingState(false);
    }
}

/**
 * Waits for Firebase with retry logic
 * @returns {Promise} Promise that resolves when Firebase is ready
 */
async function waitForFirebaseWithRetry() {
    const maxRetries = 2;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Waiting for Firebase (attempt ${attempt}/${maxRetries})...`);
            
            if (window.firebaseUtils && window.firebaseUtils.waitForReady) {
                await window.firebaseUtils.waitForReady();
                console.log('Firebase is ready');
                return;
            } else {
                // Fallback: wait for global firebaseReady flag
                await waitForFirebaseFlag();
                return;
            }
            
        } catch (error) {
            console.warn(`Firebase wait attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

/**
 * Waits for Firebase using the global flag
 * @returns {Promise} Promise that resolves when Firebase is ready
 */
function waitForFirebaseFlag() {
    return new Promise((resolve, reject) => {
        if (window.firebaseReady) {
            resolve();
            return;
        }
        
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds
        
        const checkFirebase = () => {
            attempts++;
            
            if (window.firebaseReady) {
                resolve();
            } else if (window.firebaseError) {
                reject(new Error('Firebase configuration error'));
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
 * Shows configuration error
 */
function showConfigurationError() {
    const errorHtml = `
        <div class="config-error" style="
            background: linear-gradient(135deg, #fff0f0, #ffe6e6);
            padding: 2rem;
            border-radius: 1rem;
            margin: 2rem auto;
            max-width: 600px;
            border: 2px solid #ffcccc;
        ">
            <h2 style="color: #cc0000; margin-bottom: 1rem;">🔧 Firebase Setup Required</h2>
            
            <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
                <h3 style="color: #333; margin-bottom: 1rem;">Follow these steps:</h3>
                
                <ol style="margin-left: 1.5rem; color: #555;">
                    <li style="margin-bottom: 0.5rem;">Go to <a href="https://firebase.google.com" target="_blank">Firebase Console</a></li>
                    <li style="margin-bottom: 0.5rem;">Create a new project or use existing one</li>
                    <li style="margin-bottom: 0.5rem;">Enable Authentication (Email/Password method)</li>
                    <li style="margin-bottom: 0.5rem;">Enable Firestore Database</li>
                    <li style="margin-bottom: 0.5rem;">Register a web app and copy configuration</li>
                    <li>Open <strong>js/firebaseConfig.js</strong> and replace placeholder values</li>
                </ol>
            </div>
            
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
                <h4 style="color: #333; margin-bottom: 0.5rem;">Example configuration:</h4>
                <pre style="
                    background: #2d2d2d;
                    color: #f8f8f2;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    overflow-x: auto;
                    font-size: 0.9rem;
                ">
const firebaseConfig = {
    apiKey: "AIzaSyABC123...",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};</pre>
            </div>
            
            <div style="text-align: center;">
                <button onclick="window.location.reload()" style="
                    background: linear-gradient(135deg, #ff6666, #cc0000);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 2rem;
                    font-weight: bold;
                    cursor: pointer;
                    margin-right: 1rem;
                ">
                    🔄 Refresh After Configuring
                </button>
                
                <button onclick="showTestMode()" style="
                    background: transparent;
                    color: #666;
                    border: 1px solid #ccc;
                    padding: 0.75rem 1.5rem;
                    border-radius: 2rem;
                    font-weight: bold;
                    cursor: pointer;
                ">
                    🚀 Enable Test Mode
                </button>
            </div>
        </div>
    `;
    
    const mainContent = document.querySelector('main .container');
    if (mainContent) {
        const hero = mainContent.querySelector('.hero');
        if (hero) {
            hero.insertAdjacentHTML('afterend', errorHtml);
        }
    }
}

/**
 * Shows test mode instructions
 */
function showTestMode() {
    alert(`Test Mode Instructions:
    
1. For quick testing without Firebase:
   - Open js/firebaseConfig.js
   - Comment out the firebase.initializeApp() call
   - Uncomment the TEST MODE section
   - Refresh the page
   
2. This will enable a mock authentication system
   - Use any email/password (no validation)
   - Data won't be saved to Firebase
   - Perfect for UI testing

Note: This is for development only. Replace with real Firebase config for production.`);
}

/**
 * Shows timeout error
 */
function showTimeoutError() {
    const errorHtml = `
        <div style="
            background: #fff8e6;
            padding: 1.5rem;
            border-radius: 0.5rem;
            margin: 2rem auto;
            max-width: 500px;
            border: 1px solid #ffd166;
            text-align: center;
        ">
            <h3 style="color: #e6a700; margin-bottom: 1rem;">⏱️ Connection Timeout</h3>
            <p style="color: #666; margin-bottom: 1.5rem;">
                The application is taking too long to connect to Firebase.
                This might be due to network issues or Firebase service delays.
            </p>
            <button onclick="window.location.reload()" style="
                background: #ffd166;
                color: #333;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 2rem;
                font-weight: bold;
                cursor: pointer;
            ">
                Retry Connection
            </button>
        </div>
    `;
    
    const mainContent = document.querySelector('main .container');
    if (mainContent) {
        const hero = mainContent.querySelector('.hero');
        if (hero) {
            hero.insertAdjacentHTML('afterend', errorHtml);
        }
    }
}

/**
 * Updates UI for error state
 */
function updateUIForErrorState() {
    // Disable auth buttons
    const loginBtn = document.getElementById('showLoginBtn');
    const signupBtn = document.getElementById('showSignupBtn');
    
    if (loginBtn) loginBtn.disabled = true;
    if (signupBtn) signupBtn.disabled = true;
    
    // Update auth message
    const authMessage = document.getElementById('authMessage');
    if (authMessage) {
        authMessage.innerHTML = `
            <p><strong>⚠️ Application Error</strong></p>
            <p>Please check the console for details and refresh the page.</p>
        `;
    }
}

/**
 * Initializes all application modules
 */
function initModules() {
    try {
        // Initialize auth module
        if (window.firebaseUtils && window.firebaseUtils.isInitialized()) {
            // Auth module auto-initializes via DOMContentLoaded
            // Just verify it's loaded
            if (!window.authModule) {
                console.warn('Auth module not loaded, attempting to initialize...');
                // The auth.js script should have already run
            }
        } else {
            console.warn('Firebase not fully initialized, modules may not work');
        }
        
        // Setup auth UI if available
        if (window.authUI && typeof window.authUI.initAuthUI === 'function') {
            // Re-run initialization to ensure event listeners are set
            window.authUI.setupEventListeners?.();
        }
        
        console.log('Modules initialized');
        
    } catch (error) {
        console.error('Module initialization error:', error);
        throw error;
    }
}

/**
 * Sets up global error handling for uncaught errors
 */
function setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        
        // Don't show user errors for network issues
        if (event.reason?.message?.includes('network') || 
            event.reason?.code === 'auth/network-request-failed') {
            window.errorHandler?.showError(
                'Network error. Please check your internet connection.',
                'authError',
                true
            );
        }
    });
    
    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        
        // Ignore common non-critical errors
        const ignoreErrors = [
            'ResizeObserver',
            'WebGL',
            'favicon',
            'ads',
            'tracking'
        ];
        
        if (ignoreErrors.some(term => event.message?.includes?.(term))) {
            return;
        }
        
        // Log to console but don't show user for minor errors
        if (event.error?.stack) {
            console.error('Stack trace:', event.error.stack);
        }
    });
}

/**
 * Shows a critical error message that blocks the app
 * @param {string} message - Error message to display
 */
function showCriticalError(message) {
    const errorHtml = `
        <div class="critical-error-overlay">
            <div class="critical-error-modal">
                <h2>⚠️ Application Error</h2>
                <p>${message}</p>
                <div class="critical-error-actions">
                    <button onclick="window.location.reload()" class="btn btn-primary">
                        Refresh Page
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn btn-secondary">
                        Continue Anyway
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add CSS for critical error
    const style = document.createElement('style');
    style.textContent = `
        .critical-error-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 1rem;
        }
        .critical-error-modal {
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            max-width: 500px;
            width: 100%;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }
        .critical-error-modal h2 {
            color: var(--color-error);
            margin-bottom: 1rem;
        }
        .critical-error-modal p {
            margin-bottom: 1.5rem;
            color: var(--color-gray-dark);
        }
        .critical-error-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }
    `;
    
    document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', errorHtml);
}

/**
 * Sets loading state for the entire application
 * @param {boolean} isLoading - Whether app is loading
 */
function setLoadingState(isLoading) {
    AppState.isLoading = isLoading;
    
    if (isLoading) {
        // Show loading indicator
        const loadingIndicator = document.getElementById('appLoadingIndicator');
        if (!loadingIndicator) {
            const indicator = document.createElement('div');
            indicator.id = 'appLoadingIndicator';
            indicator.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, 
                    var(--color-primary) 0%, 
                    var(--color-secondary) 50%, 
                    var(--color-primary) 100%);
                z-index: 9999;
                background-size: 200% 100%;
                animation: loadingSlide 1.5s infinite linear;
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                @keyframes loadingSlide {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(indicator);
        }
        
    } else {
        // Hide loading indicator
        const loadingIndicator = document.getElementById('appLoadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.opacity = '0';
            loadingIndicator.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                if (loadingIndicator.parentNode) {
                    loadingIndicator.parentNode.removeChild(loadingIndicator);
                }
            }, 300);
        }
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
 * Listens for Firebase ready event
 */
document.addEventListener('firebaseReady', () => {
    updateAppState({
        firebaseReady: true
    });
});

/**
 * Global helper to check if app is ready
 * @returns {boolean} True if app is fully initialized
 */
function isAppReady() {
    return AppState.isInitialized && !AppState.isLoading && AppState.firebaseReady;
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM already loaded
    setTimeout(initApp, 100); // Small delay to ensure other scripts loaded
}

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