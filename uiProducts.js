/**
 * uiProducts.js
 * 
 * User interface components for product catalog.
 * Handles product grid, quick view, and product interactions.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize product UI
    initProductUI();
});

/**
 * Initializes product UI components
 */
function initProductUI() {
    // Set up event listeners
    setupProductListeners();
    
    // Listen for product updates
    document.addEventListener('productsUpdated', handleProductsUpdated);
    document.addEventListener('cartUpdated', handleCartUpdated);
    document.addEventListener('favoritesUpdated', handleFavoritesUpdated);
    
    console.log('Product UI initialized');
}

/**
 * Sets up product-related event listeners
 */
function setupProductListeners() {
    // Delegate events for dynamic content
    document.addEventListener('click', (e) => {
        // Category filter clicks
        if (e.target.closest('.category-filter')) {
            const filter = e.target.closest('.category-filter');
            const categoryId = filter.dataset.category;
            if (categoryId) {
                handleCategoryFilter(categoryId);
            }
        }
        
        // Product favorite button clicks
        if (e.target.closest('.favorite-btn')) {
            const btn = e.target.closest('.favorite-btn');
            const productId = btn.dataset.productId;
            if (productId) {
                handleFavoriteToggle(productId, btn);
                e.preventDefault();
                e.stopPropagation();
            }
        }
        
        // Quick view button clicks
        if (e.target.closest('.view-btn, .view-details-btn')) {
            const btn = e.target.closest('.view-btn, .view-details-btn');
            const productId = btn.dataset.productId;
            if (productId) {
                showQuickView(productId);
                e.preventDefault();
                e.stopPropagation();
            }
        }
        
        // Add to cart button clicks
        if (e.target.closest('.add-to-cart-btn')) {
            const btn = e.target.closest('.add-to-cart-btn');
            const productId = btn.dataset.productId;
            if (productId) {
                const quantity = parseInt(btn.dataset.quantity) || 1;
                const color = btn.dataset.color || '';
                const size = btn.dataset.size || '';
                handleAddToCart(productId, quantity, { color, size }, btn);
                e.preventDefault();
                e.stopPropagation();
            }
        }
        
        // Quantity button clicks
        if (e.target.closest('.quantity-btn')) {
            const btn = e.target.closest('.quantity-btn');
            const productId = btn.dataset.productId;
            const action = btn.dataset.action;
            if (productId && action) {
                handleQuantityChange(productId, action, btn);
                e.preventDefault();
                e.stopPropagation();
            }
        }
        
        // Image thumbnail clicks
        if (e.target.closest('.thumbnail')) {
            const thumbnail = e.target.closest('.thumbnail');
            const productId = thumbnail.dataset.productId;
            const imageIndex = parseInt(thumbnail.dataset.imageIndex);
            if (productId && !isNaN(imageIndex)) {
                handleThumbnailClick(productId, imageIndex, thumbnail);
                e.preventDefault();
                e.stopPropagation();
            }
        }
        
        // Quick view close
        if (e.target.closest('.quick-view-close') || e.target.closest('.quick-view-overlay')) {
            const overlay = e.target.closest('.quick-view-overlay');
            if (overlay || e.target.closest('.quick-view-close')) {
                hideQuickView();
                e.preventDefault();
                e.stopPropagation();
            }
        }
        
        // Sort select change
        if (e.target.matches('#sortSelect')) {
            handleSortChange(e.target.value);
        }
        
        // Pagination button clicks
        if (e.target.closest('.pagination-btn')) {
            const btn = e.target.closest('.pagination-btn');
            const page = parseInt(btn.dataset.page);
            if (!isNaN(page)) {
                handlePageChange(page);
            }
        }
    });
    
    // Handle keyboard navigation for modals
    document.addEventListener('keydown', (e) => {
        const quickView = document.getElementById('quickViewModal');
        if (e.key === 'Escape' && quickView && !quickView.classList.contains('hidden')) {
            hideQuickView();
        }
    });
}

/**
 * Handles category filter selection
 * @param {string} categoryId - Selected category ID
 */
function handleCategoryFilter(categoryId) {
    // Update active filter
    document.querySelectorAll('.category-filter').forEach(filter => {
        filter.classList.remove('active');
    });
    
    const activeFilter = document.querySelector(`.category-filter[data-category="${categoryId}"]`);
    if (activeFilter) {
        activeFilter.classList.add('active');
    }
    
    // Update products
    window.productModule.setCategory(categoryId);
}

/**
 * Handles sort selection change
 * @param {string} sortBy - Sort criteria
 */
function handleSortChange(sortBy) {
    window.productModule.setSortOrder(sortBy);
}

/**
 * Handles page change
 * @param {number} page - Page number
 */
function handlePageChange(page) {
    window.productModule.setPage(page);
}

/**
 * Handles product favorite toggle
 * @param {string} productId - Product ID
 * @param {HTMLElement} button - Favorite button element
 */
function handleFavoriteToggle(productId, button) {
    // Toggle favorite state
    window.productModule.toggleFavorite(productId);
    
    // Update button appearance
    const isFavorite = window.productModule.isFavorite(productId);
    button.classList.toggle('active', isFavorite);
    
    // Show feedback
    if (isFavorite) {
        showToast('Added to favorites! 💖', 'success');
    } else {
        showToast('Removed from favorites', 'info');
    }
}

/**
 * Handles add to cart action
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @param {Object} options - Additional options
 * @param {HTMLElement} button - Add to cart button
 */
function handleAddToCart(productId, quantity, options, button) {
    const success = window.productModule.addToCart(productId, quantity, options);
    
    if (success) {
        // Update button state
        button.classList.add('added');
        button.innerHTML = `
            <span>✅</span>
            Added to Cart
        `;
        
        // Show toast notification
        const product = window.productModule.getProductById(productId);
        showToast(`Added ${quantity}x ${product.name} to cart! 🛍️`, 'success');
        
        // Reset button after delay
        setTimeout(() => {
            button.classList.remove('added');
            button.innerHTML = `
                <span>🛒</span>
                Add to Cart
            `;
        }, 2000);
    } else {
        showToast('Failed to add to cart', 'error');
    }
}

/**
 * Handles quantity change
 * @param {string} productId - Product ID
 * @param {string} action - 'increase' or 'decrease'
 * @param {HTMLElement} button - Quantity button
 */
function handleQuantityChange(productId, action, button) {
    const input = button.closest('.quantity-selector').querySelector('.quantity-input');
    let quantity = parseInt(input.value) || 1;
    
    if (action === 'increase') {
        quantity += 1;
    } else if (action === 'decrease' && quantity > 1) {
        quantity -= 1;
    }
    
    input.value = quantity;
    
    // Update any add to cart buttons with this quantity
    const cartBtns = document.querySelectorAll(`.add-to-cart-btn[data-product-id="${productId}"]`);
    cartBtns.forEach(btn => {
        btn.dataset.quantity = quantity;
    });
}

/**
 * Handles thumbnail image click
 * @param {string} productId - Product ID
 * @param {number} imageIndex - Image index
 * @param {HTMLElement} thumbnail - Thumbnail element
 */
function handleThumbnailClick(productId, imageIndex, thumbnail) {
    // Update active thumbnail
    thumbnail.closest('.product-image-thumbnails').querySelectorAll('.thumbnail').forEach(t => {
        t.classList.remove('active');
    });
    thumbnail.classList.add('active');
    
    // Update main image
    const mainImage = thumbnail.closest('.product-card').querySelector('.product-main-image');
    const product = window.productModule.getProductById(productId);
    
    if (product && product.images[imageIndex]) {
        mainImage.src = product.images[imageIndex];
        mainImage.alt = `${product.name} - Image ${imageIndex + 1}`;
    }
}

/**
 * Shows quick view modal for product
 * @param {string} productId - Product ID
 */
function showQuickView(productId) {
    const product = window.productModule.getProductById(productId);
    if (!product) return;
    
    // Create modal HTML
    const modalHTML = generateQuickViewHTML(product);
    
    // Create modal container if it doesn't exist
    let modalContainer = document.getElementById('quickViewModal');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'quickViewModal';
        document.body.appendChild(modalContainer);
    }
    
    modalContainer.innerHTML = modalHTML;
    modalContainer.classList.remove('hidden');
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Add event listeners for quick view
    const closeBtn = modalContainer.querySelector('.quick-view-close');
    const overlay = modalContainer.querySelector('.quick-view-overlay');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', hideQuickView);
    }
    
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                hideQuickView();
            }
        });
    }
    
    // Initialize quick view interactions
    initQuickViewInteractions(product);
}

/**
 * Hides quick view modal
 */
function hideQuickView() {
    const modalContainer = document.getElementById('quickViewModal');
    if (modalContainer) {
        modalContainer.classList.add('hidden');
    }
    
    // Restore body scrolling
    document.body.style.overflow = '';
}

/**
 * Generates HTML for quick view modal
 * @param {Object} product - Product object
 * @returns {string} HTML string
 */
function generateQuickViewHTML(product) {
    const isFavorite = window.productModule.isFavorite(product.id);
    
    return `
        <div class="quick-view-overlay">
            <div class="quick-view-modal">
                <button class="quick-view-close" aria-label="Close quick view">×</button>
                
                <div class="quick-view-content">
                    <div class="quick-view-images">
                        <div class="main-image-container">
                            <img src="${product.images[0]}" 
                                 alt="${product.name}" 
                                 class="main-image"
                                 id="quickViewMainImage">
                        </div>
                        <div class="image-thumbnails">
                            ${product.images.map((img, index) => `
                                <div class="image-thumbnail ${index === 0 ? 'active' : ''}" 
                                     data-index="${index}">
                                    <img src="${img}" 
                                         alt="${product.name} - Image ${index + 1}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="quick-view-details">
                        <div class="product-header">
                            <span class="product-category">${product.category}</span>
                            <h2 class="product-title">${product.name}</h2>
                            <div class="product-rating">
                                <div class="rating-stars">
                                    ${generateStarRating(product.rating)}
                                </div>
                                <span class="rating-value">${product.rating}</span>
                                <span class="rating-count">(${product.reviewCount} reviews)</span>
                            </div>
                        </div>
                        
                        <div class="product-price-section">
                            <div class="price-container">
                                <span class="current-price">$${product.price.toFixed(2)}</span>
                                ${product.originalPrice ? `
                                    <span class="original-price">$${product.originalPrice.toFixed(2)}</span>
                                    <span class="discount-percent">
                                        ${Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                                    </span>
                                ` : ''}
                            </div>
                            <span class="product-sku">SKU: ${product.sku}</span>
                        </div>
                        
                        <div class="product-description">
                            <p>${product.description}</p>
                        </div>
                        
                        <div class="product-options">
                            ${product.colors && product.colors.length > 0 ? `
                                <div class="option-group">
                                    <label class="option-label">Color:</label>
                                    <div class="color-options">
                                        ${product.colors.map(color => `
                                            <button class="color-option" 
                                                    data-color="${color}"
                                                    style="background-color: ${getColorHex(color)}"
                                                    title="${color}">
                                                <span class="color-check">✓</span>
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${product.sizes && product.sizes.length > 0 ? `
                                <div class="option-group">
                                    <label class="option-label">Size:</label>
                                    <div class="size-options">
                                        ${product.sizes.map(size => `
                                            <button class="size-option" data-size="${size}">
                                                ${size}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="option-group">
                                <label class="option-label">Quantity:</label>
                                <div class="quantity-selector">
                                    <button class="quantity-btn" data-action="decrease">−</button>
                                    <input type="number" 
                                           class="quantity-input" 
                                           value="1" 
                                           min="1" 
                                           max="${product.stock}">
                                    <button class="quantity-btn" data-action="increase">+</button>
                                    <span class="stock-info">
                                        ${product.stock} in stock
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="product-actions">
                            <button class="add-to-cart-btn primary-action"
                                    data-product-id="${product.id}">
                                <span>🛒</span>
                                Add to Cart
                            </button>
                            <button class="favorite-btn ${isFavorite ? 'active' : ''}"
                                    data-product-id="${product.id}">
                                <span>${isFavorite ? '❤️' : '🤍'}</span>
                                ${isFavorite ? 'Saved' : 'Save'}
                            </button>
                        </div>
                        
                        <div class="product-meta">
                            <div class="meta-item">
                                <span class="meta-label">Category:</span>
                                <span class="meta-value">${product.category}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Tags:</span>
                                <span class="meta-value">
                                    ${product.tags.map(tag => `#${tag}`).join(', ')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Initializes quick view interactions
 * @param {Object} product - Product object
 */
function initQuickViewInteractions(product) {
    // Image thumbnail clicks
    const thumbnails = document.querySelectorAll('.image-thumbnail');
    const mainImage = document.getElementById('quickViewMainImage');
    
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const index = parseInt(thumb.dataset.index);
            if (!isNaN(index) && product.images[index]) {
                // Update active thumbnail
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                
                // Update main image
                mainImage.src = product.images[index];
                mainImage.alt = `${product.name} - Image ${index + 1}`;
            }
        });
    });
    
    // Color option clicks
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    // Size option clicks
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', () => {
            sizeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    // Initialize first options as active
    if (colorOptions.length > 0) colorOptions[0].classList.add('active');
    if (sizeOptions.length > 0) sizeOptions[0].classList.add('active');
}

/**
 * Generates star rating HTML
 * @param {number} rating - Rating value (0-5)
 * @returns {string} Star HTML
 */
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<span class="star full">★</span>';
    }
    
    // Half star
    if (hasHalfStar) {
        stars += '<span class="star half">★</span>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<span class="star empty">★</span>';
    }
    
    return stars;
}

/**
 * Gets hex color for color name
 * @param {string} colorName - Color name
 * @returns {string} Hex color code
 */
function getColorHex(colorName) {
    const colorMap = {
        'Pink': '#ff66b2',
        'White': '#ffffff',
        'Lavender': '#b399ff',
        'Rose Gold': '#e0bfb8',
        'Natural': '#f5e9d9',
        'Black': '#000000',
        'Multicolor': 'linear-gradient(45deg, #ff66b2, #b399ff, #66b3ff)',
        'Pastel': 'linear-gradient(45deg, #ffccff, #ccffff, #ffffcc)',
        'Ivory': '#fffff0',
        'Blush': '#f4c2c2',
        'Gray': '#808080',
        'Navy': '#000080'
    };
    
    return colorMap[colorName] || '#cccccc';
}

/**
 * Handles products updated event
 * @param {CustomEvent} event - Products updated event
 */
function handleProductsUpdated(event) {
    const { products, filteredProducts, currentCategory, sortBy, currentPage, totalPages } = event.detail;
    
    // Update product grid
    updateProductGrid(products);
    
    // Update pagination
    updatePagination(currentPage, totalPages);
    
    // Update stats
    updateCatalogStats(filteredProducts.length);
    
    // Update active sort
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.value = sortBy;
    }
}

/**
 * Updates product grid with products
 * @param {Array} products - Products to display
 */
function updateProductGrid(products) {
    const gridContainer = document.getElementById('productsGrid');
    if (!gridContainer) return;
    
    if (products.length === 0) {
        gridContainer.innerHTML = `
            <div class="no-products">
                <div class="no-products-icon">👗</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or check back later for new arrivals!</p>
            </div>
        `;
        return;
    }
    
    gridContainer.innerHTML = products.map(product => generateProductCardHTML(product)).join('');
}

/**
 * Generates HTML for product card
 * @param {Object} product - Product object
 * @returns {string} HTML string
 */
function generateProductCardHTML(product) {
    const isFavorite = window.productModule.isFavorite(product.id);
    const discountPercent = product.originalPrice ? 
        Math.round((1 - product.price / product.originalPrice) * 100) : 0;
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image-container">
                <img src="${product.images[0]}" 
                     alt="${product.name}" 
                     class="product-main-image">
                
                ${product.images.length > 1 ? `
                    <div class="product-image-thumbnails">
                        ${product.images.slice(0, 3).map((img, index) => `
                            <div class="thumbnail ${index === 0 ? 'active' : ''}" 
                                 data-product-id="${product.id}"
                                 data-image-index="${index}">
                                <img src="${img}" 
                                     alt="${product.name} - Image ${index + 1}">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="product-quick-actions">
                    <button class="quick-action-btn favorite-btn ${isFavorite ? 'active' : ''}"
                            data-product-id="${product.id}"
                            title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                        ${isFavorite ? '❤️' : '🤍'}
                    </button>
                    <button class="quick-action-btn cart-btn"
                            data-product-id="${product.id}"
                            title="Add to cart">
                        🛒
                    </button>
                    <button class="quick-action-btn view-btn"
                            data-product-id="${product.id}"
                            title="Quick view">
                        👁️
                    </button>
                </div>
                
                <div class="product-badges">
                    ${product.tags.includes('new') ? `
                        <span class="product-badge badge-new">New</span>
                    ` : ''}
                    ${product.tags.includes('sale') ? `
                        <span class="product-badge badge-sale">Sale ${discountPercent}%</span>
                    ` : ''}
                    ${product.tags.includes('popular') ? `
                        <span class="product-badge badge-popular">Popular</span>
                    ` : ''}
                </div>
            </div>
            
            <div class="product-content">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">
                    <a href="#" data-product-id="${product.id}" class="view-details-link">
                        ${product.name}
                    </a>
                </h3>
                
                <p class="product-description">${product.description}</p>
                
                <div class="product-rating">
                    <div class="rating-stars">
                        ${generateStarRating(product.rating)}
                    </div>
                    <span class="rating-value">${product.rating}</span>
                    <span class="rating-count">(${product.reviewCount})</span>
                </div>
                
                <div class="product-price">
                    <span class="current-price">$${product.price.toFixed(2)}</span>
                    ${product.originalPrice ? `
                        <span class="original-price">$${product.originalPrice.toFixed(2)}</span>
                    ` : ''}
                </div>
                
                <div class="product-stock">
                    <span class="stock-indicator ${product.stock > 10 ? 'stock-in' : product.stock > 0 ? 'stock-low' : 'stock-out'}"></span>
                    <span class="stock-text">
                        ${product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                    </span>
                </div>
                
                <div class="quantity-selector">
                    <button class="quantity-btn" 
                            data-action="decrease"
                            data-product-id="${product.id}">−</button>
                    <input type="number" 
                           class="quantity-input" 
                           value="1" 
                           min="1" 
                           max="${product.stock}"
                           data-product-id="${product.id}">
                    <button class="quantity-btn" 
                            data-action="increase"
                            data-product-id="${product.id}"
                            ${product.stock <= 1 ? 'disabled' : ''}>+</button>
                </div>
                
                <div class="product-actions">
                    <button class="action-btn add-to-cart-btn"
                            data-product-id="${product.id}"
                            ${product.stock === 0 ? 'disabled' : ''}>
                        <span>🛒</span>
                        ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button class="action-btn view-details-btn"
                            data-product-id="${product.id}">
                        <span>👁️</span>
                        Quick View
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Updates pagination controls
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 */
function updatePagination(currentPage, totalPages) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button class="pagination-btn" 
                data-page="${currentPage - 1}"
                ${currentPage === 1 ? 'disabled' : ''}>
            ←
        </button>
    `;
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        paginationHTML += `
            <button class="pagination-btn" data-page="1">1</button>
            ${startPage > 2 ? '<span class="pagination-ellipsis">...</span>' : ''}
        `;
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    data-page="${i}">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        paginationHTML += `
            ${endPage < totalPages - 1 ? '<span class="pagination-ellipsis">...</span>' : ''}
            <button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>
        `;
    }
    
    // Next button
    paginationHTML += `
        <button class="pagination-btn" 
                data-page="${currentPage + 1}"
                ${currentPage === totalPages ? 'disabled' : ''}>
            →
        </button>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
}

/**
 * Updates catalog statistics
 * @param {number} productCount - Number of products
 */
function updateCatalogStats(productCount) {
    const statsContainer = document.getElementById('catalogStats');
    if (!statsContainer) return;
    
    statsContainer.textContent = `${productCount} products found`;
}

/**
 * Handles cart updated event
 * @param {CustomEvent} event - Cart updated event
 */
function handleCartUpdated(event) {
    const { cartItems, cartTotal } = event.detail;
    
    // Update cart count in header
    updateCartCount(cartTotal.itemCount);
    
    // Update cart page if open
    updateCartPage(cartItems, cartTotal);
}

/**
 * Handles favorites updated event
 * @param {CustomEvent} event - Favorites updated event
 */
function handleFavoritesUpdated(event) {
    const { favorites } = event.detail;
    
    // Update favorites count in header
    updateFavoritesCount(favorites.length);
    
    // Update favorites page if open
    updateFavoritesPage(event.detail.favoriteProducts);
}

/**
 * Updates cart count in header
 * @param {number} count - Cart item count
 */
function updateCartCount(count) {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

/**
 * Updates favorites count in header
 * @param {number} count - Favorites count
 */
function updateFavoritesCount(count) {
    const favCount = document.getElementById('favoritesCount');
    if (favCount) {
        favCount.textContent = count;
        favCount.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

/**
 * Updates cart page content
 * @param {Array} cartItems - Cart items
 * @param {Object} cartTotal - Cart totals
 */
function updateCartPage(cartItems, cartTotal) {
    // This would be called from cart.js
}

/**
 * Updates favorites page content
 * @param {Array} favoriteProducts - Favorite products
 */
function updateFavoritesPage(favoriteProducts) {
    // This would be called from favorites.js
}

/**
 * Shows toast notification
 * @param {string} message - Message to show
 * @param {string} type - Notification type (success, error, info)
 */
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${message}</span>
            <button class="toast-close">×</button>
        </div>
    `;
    
    // Add styles
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: ${type === 'success' ? 'var(--color-success)' : 
                     type === 'error' ? 'var(--color-error)' : 
                     'var(--color-info)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: toastSlideIn 0.3s ease;
        max-width: 300px;
    `;
    
    const toastContent = toast.querySelector('.toast-content');
    toastContent.style.display = 'flex';
    toastContent.style.alignItems = 'center';
    toastContent.style.justifyContent = 'space-between';
    toastContent.style.gap = '1rem';
    
    const toastClose = toast.querySelector('.toast-close');
    toastClose.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    `;
    
    // Add keyframe animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes toastSlideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Add close button listener
    toastClose.addEventListener('click', () => {
        toast.remove();
        style.remove();
    });
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
            style.remove();
        }
    }, 3000);
}

// Export UI functions
window.productUI = {
    initProductUI: initProductUI,
    showQuickView: showQuickView,
    hideQuickView: hideQuickView,
    updateProductGrid: updateProductGrid,
    updatePagination: updatePagination,
    showToast: showToast,
    
    // Events
    events: {
        PRODUCTS_UPDATED: 'productsUpdated',
        CART_UPDATED: 'cartUpdated',
        FAVORITES_UPDATED: 'favoritesUpdated'
    }
};