/**
 * errorHandler.js
 * 
 * Centralized error handling and user-friendly error messages.
 * Converts Firebase error codes into user-friendly messages.
 * 
 * To modify: Add new error mappings or customize error display.
 */

/**
 * Maps Firebase error codes to user-friendly messages
 * @param {string} errorCode - Firebase error code
 * @returns {string} User-friendly error message
 */
function getErrorMessage(errorCode) {
    const errorMessages = {
        // Authentication errors
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-disabled': 'This account has been disabled. Please contact support.',
        'auth/user-not-found': 'No account found with this email. Please sign up first.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/email-already-in-use': 'This email is already registered. Please try logging in.',
        'auth/weak-password': 'Password should be at least 6 characters long.',
        'auth/operation-not-allowed': 'Email/password sign-in is not enabled. Please contact support.',
        'auth/too-many-requests': 'Too many unsuccessful attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your internet connection.',
        'auth/popup-closed-by-user': 'Sign-in was cancelled.',
        'auth/requires-recent-login': 'Please log in again to perform this action.',
        
        // Firestore errors
        'permission-denied': 'You do not have permission to perform this action.',
        'unavailable': 'Service is temporarily unavailable. Please try again.',
        'not-found': 'Requested document was not found.',
        
        // Generic errors
        'default': 'An unexpected error occurred. Please try again.'
    };
    
    return errorMessages[errorCode] || errorMessages.default;
}

/**
 * Displays an error message to the user
 * @param {string} message - Error message to display
 * @param {string} elementId - ID of element to show error in (optional)
 * @param {boolean} isWarning - Whether this is a warning vs error
 */
function showError(message, elementId = 'authError', isWarning = false) {
    const errorElement = document.getElementById(elementId);
    if (!errorElement) {
        console.warn('Error element not found:', elementId);
        return;
    }
    
    // Clear previous content and show
    errorElement.innerHTML = '';
    errorElement.classList.remove('hidden');
    
    // Remove any existing classes
    errorElement.classList.remove('error', 'warning', 'info', 'success');
    
    // Add appropriate class
    const typeClass = isWarning ? 'warning' : 'error';
    errorElement.classList.add(typeClass);
    
    // Create message element
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.margin = '0';
    
    // Add icon based on type
    const icon = isWarning ? '⚠️' : '❌';
    const iconElement = document.createElement('span');
    iconElement.textContent = `${icon} `;
    iconElement.style.marginRight = '0.5rem';
    
    // Assemble
    errorElement.appendChild(iconElement);
    errorElement.appendChild(messageElement);
    
    // Auto-hide after 5 seconds for non-critical errors
    if (isWarning) {
        setTimeout(() => {
            if (errorElement.contains(messageElement)) {
                hideError(elementId);
            }
        }, 5000);
    }
}

/**
 * Hides an error message
 * @param {string} elementId - ID of element to hide
 */
function hideError(elementId = 'authError') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.classList.add('hidden');
        errorElement.innerHTML = '';
    }
}

/**
 * Shows a success message
 * @param {string} message - Success message to display
 * @param {string} elementId - ID of element to show message in
 */
function showSuccess(message, elementId = 'authError') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn('Element not found:', elementId);
        return;
    }
    
    element.innerHTML = '';
    element.classList.remove('hidden');
    element.classList.remove('error', 'warning');
    element.classList.add('success');
    
    const messageElement = document.createElement('p');
    messageElement.textContent = `✅ ${message}`;
    messageElement.style.margin = '0';
    messageElement.style.color = '#006600';
    
    element.appendChild(messageElement);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        if (element.contains(messageElement)) {
            hideError(elementId);
        }
    }, 3000);
}

/**
 * Shows a loading message
 * @param {string} message - Loading message
 * @param {string} elementId - ID of element to show message in
 */
function showLoading(message = 'Loading...', elementId = 'authError') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn('Element not found:', elementId);
        return;
    }
    
    element.innerHTML = '';
    element.classList.remove('hidden');
    element.classList.remove('error', 'warning', 'success');
    
    const messageElement = document.createElement('p');
    messageElement.textContent = `⏳ ${message}`;
    messageElement.style.margin = '0';
    messageElement.style.color = '#6666cc';
    
    element.appendChild(messageElement);
}

/**
 * Handles Firebase errors and displays user-friendly messages
 * @param {Error} error - Firebase error object
 * @param {string} context - Context where error occurred (for logging)
 * @param {string} elementId - ID of element to show error in
 */
function handleFirebaseError(error, context = 'Firebase operation', elementId = 'authError') {
    console.error(`${context}:`, error);
    
    // Extract error code
    const errorCode = error.code || 'default';
    
    // Get user-friendly message
    const userMessage = getErrorMessage(errorCode);
    
    // Show error
    showError(userMessage, elementId);
    
    // Return the user-friendly message for programmatic use
    return userMessage;
}

// Export functions
window.errorHandler = {
    getErrorMessage: getErrorMessage,
    showError: showError,
    hideError: hideError,
    showSuccess: showSuccess,
    showLoading: showLoading,
    handleFirebaseError: handleFirebaseError
};