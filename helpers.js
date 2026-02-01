/**
 * helpers.js
 * 
 * Utility functions for the ecommerce application.
 * Located in js/utils/helpers.js
 */

/**
 * Formats a price with currency symbol
 * @param {number} price - Price to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted price
 */
function formatPrice(price, currency = 'USD') {
    if (typeof price !== 'number' || isNaN(price)) {
        return '$0.00';
    }
    
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    return formatter.format(price);
}

/**
 * Truncates text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength = 100, suffix = '...') {
    if (typeof text !== 'string') return '';
    
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Debounces a function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttles a function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Generates a unique ID
 * @param {number} length - Length of ID (default: 8)
 * @returns {string} Unique ID
 */
function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Parses query parameters from URL
 * @param {string} url - URL to parse (default: current URL)
 * @returns {Object} Query parameters
 */
function parseQueryParams(url = window.location.href) {
    const params = {};
    const urlParts = url.split('?');
    
    if (urlParts.length < 2) return params;
    
    const queryString = urlParts[1];
    const pairs = queryString.split('&');
    
    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
    });
    
    return params;
}

/**
 * Creates query string from object
 * @param {Object} params - Parameters object
 * @returns {string} Query string
 */
function createQueryString(params) {
    const parts = [];
    
    for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined) {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
    }
    
    return parts.length > 0 ? `?${parts.join('&')}` : '';
}

/**
 * Updates URL query parameters without page reload
 * @param {Object} params - Parameters to update
 * @param {boolean} replace - Replace history entry (default: false)
 */
function updateQueryParams(params, replace = false) {
    const currentParams = parseQueryParams();
    const newParams = { ...currentParams, ...params };
    
    // Remove null/undefined values
    Object.keys(newParams).forEach(key => {
        if (newParams[key] === null || newParams[key] === undefined) {
            delete newParams[key];
        }
    });
    
    const queryString = createQueryString(newParams);
    const newUrl = `${window.location.pathname}${queryString}${window.location.hash}`;
    
    if (replace) {
        window.history.replaceState(null, '', newUrl);
    } else {
        window.history.pushState(null, '', newUrl);
    }
}

/**
 * Gets a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/**
 * Sets a cookie
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Days until expiration (default: 7)
 */
function setCookie(name, value, days = 7) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Strict";
}

/**
 * Removes a cookie
 * @param {string} name - Cookie name
 */
function removeCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

/**
 * Capitalizes the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formats a date to readable string
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
function formatDate(date, options = {}) {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
    }
    
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    return new Intl.DateTimeFormat('en-US', mergedOptions).format(dateObj);
}

/**
 * Calculates percentage
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
function calculatePercentage(part, total) {
    if (total === 0) return 0;
    return (part / total) * 100;
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
function validatePassword(password) {
    const result = {
        isValid: true,
        score: 0,
        messages: []
    };
    
    if (!password) {
        result.isValid = false;
        result.messages.push('Password is required');
        return result;
    }
    
    if (password.length < 6) {
        result.isValid = false;
        result.messages.push('Password must be at least 6 characters');
        return result;
    }
    
    // Calculate strength score
    if (password.length >= 8) result.score += 1;
    if (/[A-Z]/.test(password)) result.score += 1;
    if (/[a-z]/.test(password)) result.score += 1;
    if (/[0-9]/.test(password)) result.score += 1;
    if (/[^A-Za-z0-9]/.test(password)) result.score += 1;
    
    return result;
}

/**
 * Creates a delay promise
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Deep clones an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.reduce((arr, item, i) => {
        arr[i] = deepClone(item);
        return arr;
    }, []);
    if (typeof obj === 'object') return Object.keys(obj).reduce((newObj, key) => {
        newObj[key] = deepClone(obj[key]);
        return newObj;
    }, {});
    return obj;
}

/**
 * Merges multiple objects deeply
 * @param {...Object} objects - Objects to merge
 * @returns {Object} Merged object
 */
function deepMerge(...objects) {
    const result = {};
    
    objects.forEach(obj => {
        if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach(key => {
                if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                    result[key] = deepMerge(result[key] || {}, obj[key]);
                } else {
                    result[key] = obj[key];
                }
            });
        }
    });
    
    return result;
}

/**
 * Gets browser storage with fallback
 * @param {string} key - Storage key
 * @param {string} type - Storage type ('local' or 'session')
 * @returns {any} Stored value
 */
function getStorage(key, type = 'local') {
    try {
        const storage = type === 'session' ? sessionStorage : localStorage;
        const value = storage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error('Error reading from storage:', error);
        return null;
    }
}

/**
 * Sets browser storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {string} type - Storage type ('local' or 'session')
 */
function setStorage(key, value, type = 'local') {
    try {
        const storage = type === 'session' ? sessionStorage : localStorage;
        storage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error writing to storage:', error);
    }
}

/**
 * Removes item from browser storage
 * @param {string} key - Storage key
 * @param {string} type - Storage type ('local' or 'session')
 */
function removeStorage(key, type = 'local') {
    try {
        const storage = type === 'session' ? sessionStorage : localStorage;
        storage.removeItem(key);
    } catch (error) {
        console.error('Error removing from storage:', error);
    }
}

/**
 * Checks if device is mobile
 * @returns {boolean} True if mobile device
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Checks if device is touch capable
 * @returns {boolean} True if touch capable
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Scrolls to element smoothly
 * @param {string|HTMLElement} element - Element or selector
 * @param {Object} options - Scroll options
 */
function scrollToElement(element, options = {}) {
    const target = typeof element === 'string' ? 
        document.querySelector(element) : element;
    
    if (!target) return;
    
    const defaultOptions = {
        behavior: 'smooth',
        block: 'start'
    };
    
    target.scrollIntoView({ ...defaultOptions, ...options });
}

// Export helper functions
window.helpers = {
    formatPrice: formatPrice,
    truncateText: truncateText,
    debounce: debounce,
    throttle: throttle,
    generateId: generateId,
    parseQueryParams: parseQueryParams,
    createQueryString: createQueryString,
    updateQueryParams: updateQueryParams,
    getCookie: getCookie,
    setCookie: setCookie,
    removeCookie: removeCookie,
    capitalize: capitalize,
    formatDate: formatDate,
    calculatePercentage: calculatePercentage,
    isValidEmail: isValidEmail,
    validatePassword: validatePassword,
    delay: delay,
    deepClone: deepClone,
    deepMerge: deepMerge,
    getStorage: getStorage,
    setStorage: setStorage,
    removeStorage: removeStorage,
    isMobile: isMobile,
    isTouchDevice: isTouchDevice,
    scrollToElement: scrollToElement
};