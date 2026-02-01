/**
 * uiAuth.js - WITH GOOGLE SIGN-IN UI
 * 
 * Beautiful authentication UI with Google Sign-in option.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI components
    initAuthUI();
});

/**
 * Initializes all authentication UI components
 */
function initAuthUI() {
    // Set up event listeners
    setupEventListeners();
    
    // Initial UI state update
    updateAuthUI();
    
    // Listen for auth state changes from auth.js
    document.addEventListener('authStateChanged', handleAuthStateChangedUI);
    
    console.log('Auth UI initialized with Google Sign-in');
}

/**
 * Sets up all authentication-related event listeners
 */
function setupEventListeners() {
    // Auth buttons in header
    const showLoginBtn = document.getElementById('showLoginBtn');
    const showSignupBtn = document.getElementById('showSignupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Modal controls
    const closeModalBtn = document.getElementById('closeModalBtn');
    const authModal = document.getElementById('authModal');
    
    // Add event listeners if elements exist
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', () => showAuthModal('login'));
    }
    
    if (showSignupBtn) {
        showSignupBtn.addEventListener('click', () => showAuthModal('signup'));
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideAuthModal);
    }
    
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                hideAuthModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !authModal.classList.contains('hidden')) {
            hideAuthModal();
        }
    });
}

/**
 * Shows the authentication modal with specified form
 * @param {string} formType - 'login' or 'signup'
 */
function showAuthModal(formType = 'login') {
    const authModal = document.getElementById('authModal');
    const modalTitle = document.getElementById('modalTitle');
    const authFormContainer = document.getElementById('authFormContainer');
    
    if (!authModal || !modalTitle || !authFormContainer) {
        console.error('Auth modal elements not found');
        return;
    }
    
    // Clear any previous error messages
    window.errorHandler?.hideError();
    
    // Set modal title
    modalTitle.textContent = formType === 'login' ? 'Welcome Back!' : 'Create Account';
    
    // Generate form HTML
    authFormContainer.innerHTML = generateAuthForm(formType);
    
    // Show modal
    authModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Add form submission handler
    const form = document.getElementById('authForm');
    if (form) {
        form.addEventListener('submit', handleAuthFormSubmit);
    }
    
    // Add toggle link event listener
    const toggleLink = document.getElementById('toggleAuthForm');
    if (toggleLink) {
        toggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            const newFormType = formType === 'login' ? 'signup' : 'login';
            showAuthModal(newFormType);
        });
    }
    
    // Add forgot password link event listener
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handleForgotPassword);
    }
    
    // Add Google sign-in button event listener
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', handleGoogleSignIn);
    }
    
    // Add password toggle visibility
    const passwordToggle = document.querySelector('.password-toggle');
    const passwordInput = document.getElementById('password');
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            passwordToggle.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }
    
    // Focus first input
    setTimeout(() => {
        const firstInput = form?.querySelector('input');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
}

/**
 * Hides the authentication modal
 */
function hideAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    
    // Clear any error messages
    window.errorHandler?.hideError();
}

/**
 * Generates HTML for authentication forms
 * @param {string} formType - 'login' or 'signup'
 * @returns {string} HTML string for the form
 */
function generateAuthForm(formType) {
    const isLogin = formType === 'login';
    
    return `
        <div class="auth-form-container">
            <div class="auth-form-header">
                <p>${isLogin ? 'Sign in to continue to Boutique Bliss' : 'Join our community of style lovers'}</p>
            </div>
            
            <!-- Google Sign-in Button -->
            <div class="social-login">
                <button type="button" id="googleSignInBtn" class="social-btn google">
                    <span class="social-btn-icon">G</span>
                    Continue with Google
                </button>
            </div>
            
            <!-- Divider -->
            <div class="auth-divider">
                <span>or continue with email</span>
            </div>
            
            <!-- Email/Password Form -->
            <form id="authForm" class="form-container">
                <div class="form-group">
                    <label for="email" class="form-label required">Email Address</label>
                    <input 
                        type="email" 
                        id="email" 
                        class="form-input" 
                        placeholder="you@example.com" 
                        required
                        autocomplete="email"
                    >
                </div>
                
                ${!isLogin ? `
                    <div class="form-group">
                        <label for="displayName" class="form-label">Display Name (Optional)</label>
                        <input 
                            type="text" 
                            id="displayName" 
                            class="form-input" 
                            placeholder="Your preferred name" 
                            autocomplete="name"
                        >
                    </div>
                ` : ''}
                
                <div class="form-group">
                    <label for="password" class="form-label required">Password</label>
                    <div style="position: relative;">
                        <input 
                            type="password" 
                            id="password" 
                            class="form-input" 
                            placeholder="${isLogin ? 'Enter your password' : 'Choose a secure password (min. 6 chars)'}" 
                            required
                            autocomplete="${isLogin ? 'current-password' : 'new-password'}"
                            minlength="6"
                        >
                        <button type="button" class="password-toggle" aria-label="Toggle password visibility">
                            👁️
                        </button>
                    </div>
                </div>
                
                ${isLogin ? `
                    <div class="form-group" style="text-align: right;">
                        <a href="#" id="forgotPasswordLink" class="forgot-password-link">
                            Forgot your password?
                        </a>
                    </div>
                ` : ''}
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary btn-block">
                        ${isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </div>
                
                <div class="form-footer">
                    ${isLogin ? "Don't have an account? " : "Already have an account? "}
                    <a href="#" id="toggleAuthForm">
                        ${isLogin ? 'Sign up here' : 'Sign in here'}
                    </a>
                </div>
            </form>
        </div>
    `;
}

/**
 * Handles authentication form submission
 * @param {Event} event - Form submit event
 */
async function handleAuthFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formType = form.querySelector('#displayName') ? 'signup' : 'login';
    const isLogin = formType === 'login';
    
    // Get form values
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#password').value;
    const displayName = !isLogin ? form.querySelector('#displayName')?.value.trim() : '';
    
    // Basic validation
    if (!email || !password) {
        window.errorHandler?.showError('Please fill in all required fields');
        return;
    }
    
    if (!isLogin && password.length < 6) {
        window.errorHandler?.showError('Password must be at least 6 characters');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        window.errorHandler?.showError('Please enter a valid email address');
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = isLogin ? 'Signing In...' : 'Creating Account...';
    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;
    
    try {
        if (isLogin) {
            // Login existing user
            await window.authModule.signIn(email, password);
            window.errorHandler?.showSuccess('Welcome back! Login successful.');
            
        } else {
            // Sign up new user
            const additionalData = displayName ? { displayName } : {};
            await window.authModule.signUp(email, password, additionalData);
            window.errorHandler?.showSuccess('🎉 Account created successfully! Welcome to Boutique Bliss.');
        }
        
        // Close modal after short delay
        setTimeout(hideAuthModal, 2000);
        
    } catch (error) {
        // Handle error
        window.errorHandler?.handleFirebaseError(error, 'Authentication');
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
    }
}

/**
 * Handles Google Sign-in
 */
async function handleGoogleSignIn() {
    const googleBtn = document.getElementById('googleSignInBtn');
    if (!googleBtn) return;
    
    // Save original button state
    const originalText = googleBtn.textContent;
    googleBtn.textContent = 'Connecting to Google...';
    googleBtn.disabled = true;
    
    try {
        await window.authModule.signInWithGoogle();
        window.errorHandler?.showSuccess('✅ Signed in with Google successfully!');
        
        // Close modal after short delay
        setTimeout(hideAuthModal, 1500);
        
    } catch (error) {
        // Handle Google sign-in errors
        let errorMessage = error.message || 'Google sign-in failed';
        
        // Special handling for cancelled sign-in
        if (error.message.includes('cancelled')) {
            errorMessage = 'Sign-in was cancelled';
        } else if (error.message.includes('popup blocked')) {
            errorMessage = 'Popup blocked. Please allow popups for Google sign-in.';
        }
        
        window.errorHandler?.showError(errorMessage);
        
        // Reset button
        googleBtn.textContent = originalText;
        googleBtn.disabled = false;
    }
}

/**
 * Handles logout button click
 */
async function handleLogout() {
    // Show confirmation with style
    const confirmLogout = await showConfirmDialog(
        'Sign Out',
        'Are you sure you want to sign out?',
        'Sign Out',
        'Cancel'
    );
    
    if (!confirmLogout) return;
    
    try {
        // Show loading
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            const originalText = logoutBtn.textContent;
            logoutBtn.textContent = 'Signing Out...';
            logoutBtn.disabled = true;
        }
        
        await window.authModule.signOut();
        window.errorHandler?.showSuccess('Signed out successfully. See you soon!');
        
        // Reset button
        if (logoutBtn) {
            setTimeout(() => {
                logoutBtn.textContent = originalText;
                logoutBtn.disabled = false;
            }, 1000);
        }
        
    } catch (error) {
        window.errorHandler?.handleFirebaseError(error, 'Logout');
    }
}

/**
 * Shows a styled confirmation dialog
 */
function showConfirmDialog(title, message, confirmText, cancelText) {
    return new Promise((resolve) => {
        const dialogHTML = `
            <div class="confirm-dialog-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(3px);
            ">
                <div class="confirm-dialog" style="
                    background: white;
                    padding: 2rem;
                    border-radius: 1rem;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    animation: modalSlideIn 0.3s ease-out;
                ">
                    <h3 style="
                        color: var(--color-primary-dark);
                        margin-bottom: 1rem;
                        font-size: 1.25rem;
                    ">${title}</h3>
                    <p style="
                        color: var(--color-gray-dark);
                        margin-bottom: 1.5rem;
                        line-height: 1.5;
                    ">${message}</p>
                    <div style="
                        display: flex;
                        gap: 1rem;
                        justify-content: flex-end;
                    ">
                        <button class="cancel-btn" style="
                            padding: 0.75rem 1.5rem;
                            border: 2px solid var(--border-color);
                            border-radius: 0.75rem;
                            background: transparent;
                            color: var(--color-gray-dark);
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s ease;
                        ">${cancelText}</button>
                        <button class="confirm-btn" style="
                            padding: 0.75rem 1.5rem;
                            border: none;
                            border-radius: 0.75rem;
                            background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s ease;
                        ">${confirmText}</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add CSS for animation
        const style = document.createElement('style');
        style.textContent = `
            .confirm-dialog-overlay {
                animation: fadeIn 0.2s ease-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .cancel-btn:hover {
                background: var(--color-light) !important;
            }
            .confirm-btn:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 4px 12px var(--shadow-color) !important;
            }
        `;
        
        document.head.appendChild(style);
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        
        // Add event listeners
        const overlay = document.querySelector('.confirm-dialog-overlay');
        const confirmBtn = overlay.querySelector('.confirm-btn');
        const cancelBtn = overlay.querySelector('.cancel-btn');
        
        const cleanup = (result) => {
            overlay.remove();
            style.remove();
            resolve(result);
        };
        
        confirmBtn.addEventListener('click', () => cleanup(true));
        cancelBtn.addEventListener('click', () => cleanup(false));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cleanup(false);
        });
    });
}

/**
 * Handles forgot password flow
 * @param {Event} event - Click event
 */
async function handleForgotPassword(event) {
    event.preventDefault();
    
    const emailInput = document.querySelector('#email');
    if (!emailInput) return;
    
    const email = emailInput.value.trim();
    
    if (!email) {
        window.errorHandler?.showError('Please enter your email address first');
        emailInput.focus();
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        window.errorHandler?.showError('Please enter a valid email address');
        return;
    }
    
    try {
        await window.authModule.sendPasswordResetEmail(email);
        window.errorHandler?.showSuccess(`📧 Password reset email sent to ${email}. Please check your inbox.`);
        
    } catch (error) {
        window.errorHandler?.handleFirebaseError(error, 'Password reset');
    }
}

/**
 * Updates UI based on authentication state
 */
function updateAuthUI() {
    const isLoggedIn = window.authModule?.isUserLoggedIn() || false;
    const user = window.authModule?.getCurrentUser();
    
    // Update auth buttons
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const userEmail = document.getElementById('userEmail');
    const authMessage = document.getElementById('authMessage');
    
    if (isLoggedIn && user) {
        // User is logged in
        if (authButtons) {
            authButtons.innerHTML = '';
            authButtons.classList.add('hidden');
        }
        
        if (userInfo) {
            userInfo.classList.remove('hidden');
        }
        
        if (userEmail) {
            // Truncate long emails for display
            const email = user.email;
            const displayEmail = email.length > 25 ? email.substring(0, 22) + '...' : email;
            userEmail.textContent = displayEmail;
            userEmail.title = email; // Show full email on hover
        }
        
        if (authMessage) {
            const displayName = user.displayName || user.email.split('@')[0];
            authMessage.innerHTML = `
                <p>Welcome back, <strong>${displayName}</strong>! 👋</p>
                <p>Explore the site or check back later for ecommerce features.</p>
            `;
        }
        
    } else {
        // User is not logged in
        if (authButtons) {
            authButtons.classList.remove('hidden');
            authButtons.innerHTML = `
                <button class="btn btn-login" id="headerLoginBtn">
                    <span style="margin-right: 0.5rem;">🔐</span>
                    Login
                </button>
                <button class="btn btn-signup" id="headerSignupBtn">
                    <span style="margin-right: 0.5rem;">✨</span>
                    Sign Up
                </button>
            `;
            
            // Add event listeners to new buttons
            const headerLoginBtn = document.getElementById('headerLoginBtn');
            const headerSignupBtn = document.getElementById('headerSignupBtn');
            
            if (headerLoginBtn) {
                headerLoginBtn.addEventListener('click', () => showAuthModal('login'));
            }
            
            if (headerSignupBtn) {
                headerSignupBtn.addEventListener('click', () => showAuthModal('signup'));
            }
        }
        
        if (userInfo) {
            userInfo.classList.add('hidden');
        }
        
        if (authMessage) {
            authMessage.innerHTML = `
                <p>Welcome to Boutique Bliss! 💖</p>
                <p>Sign in or create an account to get personalized recommendations.</p>
                <p style="font-size: 0.9rem; color: var(--color-gray); margin-top: 0.5rem;">
                    Phase 1: Authentication • Ecommerce features coming soon!
                </p>
            `;
        }
    }
}

/**
 * Handles auth state change events from auth.js
 * @param {CustomEvent} event - Auth state change event
 */
function handleAuthStateChangedUI(event) {
    // Update UI when auth state changes
    updateAuthUI();
}

// Export UI functions
window.authUI = {
    showLoginModal: () => showAuthModal('login'),
    showSignupModal: () => showAuthModal('signup'),
    hideAuthModal: hideAuthModal,
    updateAuthUI: updateAuthUI,
    setupEventListeners: setupEventListeners
};