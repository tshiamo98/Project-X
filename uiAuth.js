/**
 * uiAuth.js
 * 
 * User interface logic for authentication.
 * Handles auth modal, forms, buttons, and UI state updates.
 * Separated from core auth logic for maintainability.
 * 
 * To modify: Change form layouts, add new UI elements, or adjust animations.
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
    
    console.log('Auth UI initialized');
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
    modalTitle.textContent = formType === 'login' ? 'Login to Your Account' : 'Create New Account';
    
    // Generate form HTML
    authFormContainer.innerHTML = generateAuthForm(formType);
    
    // Show modal
    authModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
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
        document.body.style.overflow = ''; // Restore scrolling
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
                        placeholder="Your name" 
                        autocomplete="name"
                    >
                </div>
            ` : ''}
            
            <div class="form-group">
                <label for="password" class="form-label required">Password</label>
                <input 
                    type="password" 
                    id="password" 
                    class="form-input" 
                    placeholder="${isLogin ? 'Enter your password' : 'At least 6 characters'}" 
                    required
                    autocomplete="${isLogin ? 'current-password' : 'new-password'}"
                    minlength="6"
                >
            </div>
            
            ${isLogin ? `
                <div class="form-group" style="text-align: right;">
                    <a href="#" id="forgotPasswordLink" class="text-small" style="color: var(--color-primary-dark);">
                        Forgot your password?
                    </a>
                </div>
            ` : ''}
            
            <div class="form-actions">
                <button type="submit" class="btn btn-primary btn-block">
                    ${isLogin ? 'Login' : 'Create Account'}
                </button>
            </div>
            
            <div class="form-footer">
                ${isLogin ? "Don't have an account? " : "Already have an account? "}
                <a href="#" id="toggleAuthForm">
                    ${isLogin ? 'Sign up here' : 'Login here'}
                </a>
            </div>
        </form>
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
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = isLogin ? 'Logging in...' : 'Creating account...';
    submitBtn.disabled = true;
    
    try {
        if (isLogin) {
            // Login existing user
            await window.authModule.signIn(email, password);
            window.errorHandler?.showSuccess('Login successful!');
            
        } else {
            // Sign up new user
            const additionalData = displayName ? { displayName } : {};
            await window.authModule.signUp(email, password, additionalData);
            window.errorHandler?.showSuccess('Account created successfully!');
        }
        
        // Close modal after short delay
        setTimeout(hideAuthModal, 1500);
        
    } catch (error) {
        // Handle error
        window.errorHandler?.handleFirebaseError(error, 'Authentication');
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Handles logout button click
 */
async function handleLogout() {
    // Show confirmation (optional)
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }
    
    try {
        // Show loading
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            const originalText = logoutBtn.textContent;
            logoutBtn.textContent = 'Logging out...';
            logoutBtn.disabled = true;
        }
        
        await window.authModule.signOut();
        
        // Reset button
        if (logoutBtn) {
            logoutBtn.textContent = originalText;
            logoutBtn.disabled = false;
        }
        
    } catch (error) {
        window.errorHandler?.handleFirebaseError(error, 'Logout');
    }
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
        window.errorHandler?.showSuccess(`Password reset email sent to ${email}. Please check your inbox.`);
        
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
            userEmail.textContent = user.email;
        }
        
        if (authMessage) {
            authMessage.innerHTML = `
                <p>Welcome back, <strong>${user.email}</strong>! You're now logged in.</p>
                <p>Explore the site or check back later for ecommerce features.</p>
            `;
        }
        
    } else {
        // User is not logged in
        if (authButtons) {
            authButtons.classList.remove('hidden');
            authButtons.innerHTML = `
                <button class="btn btn-login" id="headerLoginBtn">Login</button>
                <button class="btn btn-signup" id="headerSignupBtn">Sign Up</button>
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
                <p>Please sign in or create an account to get started.</p>
                <p>Phase 1 focuses on authentication. Ecommerce features coming soon!</p>
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
    updateAuthUI: updateAuthUI
};