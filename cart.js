/**
 * cart.js
 * 
 * Cart-specific functionality and UI updates.
 * Handles cart page interactions and checkout process.
 */

// Cart UI state
const CartUIState = {
    currentTab: 'cart',
    selectedPromoCode: null,
    isCheckoutLoading: false
};

/**
 * Initializes cart functionality
 */
function initCart() {
    // Set up cart event listeners
    setupCartListeners();
    
    // Load initial cart state
    updateCartUI();
    
    // Listen for cart updates
    document.addEventListener('cartUpdated', handleCartUpdated);
    
    console.log('Cart module initialized');
}

/**
 * Sets up cart-specific event listeners
 */
function setupCartListeners() {
    document.addEventListener('click', (e) => {
        // Cart tab switches
        if (e.target.closest('.list-tab')) {
            const tab = e.target.closest('.list-tab');
            const tabType = tab.dataset.tab;
            if (tabType) {
                handleTabSwitch(tabType);
            }
        }
        
        // Cart item quantity controls
        if (e.target.closest('.quantity-control')) {
            const control = e.target.closest('.quantity-control');
            const productId = control.dataset.productId;
            const color = control.dataset.color;
            const size = control.dataset.size;
            const action = control.dataset.action;
            
            if (productId && action) {
                handleCartQuantityChange(productId, color, size, action);
            }
        }
        
        // Cart item removal
        if (e.target.closest('.remove-action')) {
            const action = e.target.closest('.remove-action');
            const productId = action.dataset.productId;
            const color = action.dataset.color;
            const size = action.dataset.size;
            
            if (productId) {
                handleRemoveFromCart(productId, color, size);
            }
        }
        
        // Move to favorites
        if (e.target.closest('.move-action')) {
            const action = e.target.closest('.move-action');
            const productId = action.dataset.productId;
            
            if (productId) {
                handleMoveToFavorites(productId);
            }
        }
        
        // Apply promo code
        if (e.target.closest('.apply-promo-btn')) {
            handleApplyPromoCode();
        }
        
        // Checkout button
        if (e.target.closest('.checkout-btn')) {
            handleCheckout();
        }
        
        // Continue shopping
        if (e.target.closest('.continue-shopping-btn')) {
            handleContinueShopping();
        }
        
        // Clear cart
        if (e.target.closest('#clearCartBtn')) {
            handleClearCart();
        }
    });
    
    // Promo code input
    const promoInput = document.getElementById('promoCode');
    if (promoInput) {
        promoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyPromoCode();
            }
        });
    }
}

/**
 * Handles tab switching between cart/favorites
 * @param {string} tabType - 'cart' or 'favorites'
 */
function handleTabSwitch(tabType) {
    CartUIState.currentTab = tabType;
    
    // Update active tab UI
    document.querySelectorAll('.list-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabType);
    });
    
    // Update content based on tab
    if (tabType === 'cart') {
        showCartContent();
    } else if (tabType === 'favorites') {
        showFavoritesContent();
    }
}

/**
 * Shows cart content
 */
function showCartContent() {
    const cartItems = window.productModule.getCartItems();
    const cartTotal = window.productModule.getCartTotal();
    
    updateCartItemsList(cartItems);
    updateCartSummary(cartTotal);
    
    // Show/hide empty state
    const emptyState = document.querySelector('.empty-state');
    const listItems = document.querySelector('.list-items');
    
    if (cartItems.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        if (listItems) listItems.classList.add('hidden');
    } else {
        if (emptyState) emptyState.classList.add('hidden');
        if (listItems) listItems.classList.remove('hidden');
    }
}

/**
 * Shows favorites content
 */
function showFavoritesContent() {
    const favoriteProducts = window.productModule.getFavoriteProducts();
    updateFavoritesList(favoriteProducts);
    
    // Show/hide empty state
    const emptyState = document.querySelector('.empty-state');
    const listItems = document.querySelector('.list-items');
    
    if (favoriteProducts.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        if (listItems) listItems.classList.add('hidden');
    } else {
        if (emptyState) emptyState.classList.add('hidden');
        if (listItems) listItems.classList.remove('hidden');
    }
}

/**
 * Updates cart items list
 * @param {Array} cartItems - Cart items with product details
 */
function updateCartItemsList(cartItems) {
    const itemsContainer = document.getElementById('cartItemsList');
    if (!itemsContainer) return;
    
    if (cartItems.length === 0) {
        itemsContainer.innerHTML = '';
        return;
    }
    
    itemsContainer.innerHTML = cartItems.map(item => generateCartItemHTML(item)).join('');
}

/**
 * Generates HTML for cart item
 * @param {Object} item - Cart item with product details
 * @returns {string} HTML string
 */
function generateCartItemHTML(item) {
    const { product, quantity, color, size } = item;
    const itemTotal = product.price * quantity;
    const isFavorite = window.productModule.isFavorite(product.id);
    
    return `
        <div class="list-item" data-product-id="${product.id}" data-color="${color}" data-size="${size}">
            <div class="list-item-image">
                <img src="${product.images[0]}" alt="${product.name}">
            </div>
            
            <div class="list-item-info">
                <h4 class="list-item-title">${product.name}</h4>
                <div class="list-item-meta">
                    ${color ? `<span class="list-item-color">Color: ${color}</span>` : ''}
                    ${size ? `<span class="list-item-size">Size: ${size}</span>` : ''}
                    <span class="list-item-sku">SKU: ${product.sku}</span>
                </div>
                <div class="list-item-price">$${product.price.toFixed(2)}</div>
            </div>
            
            <div class="list-item-quantity">
                <div class="quantity-controls">
                    <button class="quantity-control" 
                            data-action="decrease"
                            data-product-id="${product.id}"
                            data-color="${color}"
                            data-size="${size}"
                            ${quantity <= 1 ? 'disabled' : ''}>
                        −
                    </button>
                    <span class="quantity-display">${quantity}</span>
                    <button class="quantity-control" 
                            data-action="increase"
                            data-product-id="${product.id}"
                            data-color="${color}"
                            data-size="${size}"
                            ${quantity >= product.stock ? 'disabled' : ''}>
                        +
                    </button>
                </div>
            </div>
            
            <div class="list-item-total">$${itemTotal.toFixed(2)}</div>
            
            <div class="list-item-actions">
                <button class="list-item-action remove-action"
                        data-product-id="${product.id}"
                        data-color="${color}"
                        data-size="${size}"
                        title="Remove from cart">
                    🗑️
                </button>
                <button class="list-item-action favorite-action ${isFavorite ? 'active' : ''}"
                        data-product-id="${product.id}"
                        title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                    ${isFavorite ? '❤️' : '🤍'}
                </button>
                <button class="list-item-action move-action"
                        data-product-id="${product.id}"
                        title="Move to favorites">
                    ⭐
                </button>
            </div>
        </div>
    `;
}

/**
 * Updates cart summary section
 * @param {Object} cartTotal - Cart totals object
 */
function updateCartSummary(cartTotal) {
    // Update summary values
    const elements = {
        subtotal: document.getElementById('cartSubtotal'),
        savings: document.getElementById('cartSavings'),
        shipping: document.getElementById('cartShipping'),
        tax: document.getElementById('cartTax'),
        total: document.getElementById('cartTotal'),
        itemCount: document.getElementById('cartItemCount')
    };
    
    if (elements.subtotal) {
        elements.subtotal.textContent = `$${cartTotal.subtotal.toFixed(2)}`;
    }
    
    if (elements.savings && cartTotal.savings > 0) {
        elements.savings.textContent = `-$${cartTotal.savings.toFixed(2)}`;
        elements.savings.parentElement.style.display = 'flex';
    } else if (elements.savings) {
        elements.savings.parentElement.style.display = 'none';
    }
    
    if (elements.shipping) {
        elements.shipping.textContent = cartTotal.shipping > 0 ? 
            `$${cartTotal.shipping.toFixed(2)}` : 'FREE';
    }
    
    if (elements.tax) {
        elements.tax.textContent = `$${cartTotal.tax.toFixed(2)}`;
    }
    
    if (elements.total) {
        elements.total.textContent = `$${cartTotal.total.toFixed(2)}`;
    }
    
    if (elements.itemCount) {
        elements.itemCount.textContent = cartTotal.itemCount;
    }
    
    // Update checkout button text
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.innerHTML = `
            <span>🛒</span>
            Checkout ($${cartTotal.total.toFixed(2)})
        `;
    }
}

/**
 * Updates favorites list
 * @param {Array} favoriteProducts - Favorite products
 */
function updateFavoritesList(favoriteProducts) {
    const itemsContainer = document.getElementById('favoritesList');
    if (!itemsContainer) return;
    
    if (favoriteProducts.length === 0) {
        itemsContainer.innerHTML = '';
        return;
    }
    
    itemsContainer.innerHTML = favoriteProducts.map(product => generateFavoriteItemHTML(product)).join('');
}

/**
 * Generates HTML for favorite item
 * @param {Object} product - Product object
 * @returns {string} HTML string
 */
function generateFavoriteItemHTML(product) {
    const isFavorite = window.productModule.isFavorite(product.id);
    
    return `
        <div class="list-item" data-product-id="${product.id}">
            <div class="list-item-image">
                <img src="${product.images[0]}" alt="${product.name}">
            </div>
            
            <div class="list-item-info">
                <h4 class="list-item-title">${product.name}</h4>
                <div class="list-item-meta">
                    <span class="list-item-category">${product.category}</span>
                    <span class="list-item-sku">SKU: ${product.sku}</span>
                </div>
                <div class="list-item-price">$${product.price.toFixed(2)}</div>
            </div>
            
            <div class="list-item-stock">
                <span class="stock-indicator ${product.stock > 10 ? 'stock-in' : product.stock > 0 ? 'stock-low' : 'stock-out'}"></span>
                <span class="stock-text">
                    ${product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                </span>
            </div>
            
            <div class="list-item-actions">
                <button class="list-item-action favorite-action ${isFavorite ? 'active' : ''}"
                        data-product-id="${product.id}"
                        title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                    ${isFavorite ? '❤️' : '🤍'}
                </button>
                <button class="list-item-action move-action"
                        data-product-id="${product.id}"
                        data-color="${product.colors?.[0] || ''}"
                        data-size="${product.sizes?.[0] || ''}"
                        title="Add to cart">
                    🛒
                </button>
                <button class="list-item-action view-action"
                        data-product-id="${product.id}"
                        title="Quick view">
                    👁️
                </button>
            </div>
        </div>
    `;
}

/**
 * Handles cart quantity change
 * @param {string} productId - Product ID
 * @param {string} color - Product color
 * @param {string} size - Product size
 * @param {string} action - 'increase' or 'decrease'
 */
function handleCartQuantityChange(productId, color, size, action) {
    const cartItems = window.productModule.getCartItems();
    const item = cartItems.find(item => 
        item.product.id === productId && 
        item.color === color && 
        item.size === size
    );
    
    if (!item) return;
    
    let newQuantity = item.quantity;
    
    if (action === 'increase') {
        newQuantity += 1;
    } else if (action === 'decrease') {
        newQuantity -= 1;
    }
    
    if (newQuantity > 0) {
        window.productModule.updateCartQuantity(productId, newQuantity, color, size);
    } else {
        window.productModule.removeFromCart(productId, color, size);
    }
}

/**
 * Handles remove from cart
 * @param {string} productId - Product ID
 * @param {string} color - Product color
 * @param {string} size - Product size
 */
function handleRemoveFromCart(productId, color, size) {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
        window.productModule.removeFromCart(productId, color, size);
        window.productUI?.showToast('Item removed from cart', 'info');
    }
}

/**
 * Handles move to favorites
 * @param {string} productId - Product ID
 */
function handleMoveToFavorites(productId) {
    window.productModule.toggleFavorite(productId);
    
    const isFavorite = window.productModule.isFavorite(productId);
    if (isFavorite) {
        window.productUI?.showToast('Added to favorites!', 'success');
    }
}

/**
 * Handles apply promo code
 */
function handleApplyPromoCode() {
    const promoInput = document.getElementById('promoCode');
    if (!promoInput) return;
    
    const promoCode = promoInput.value.trim().toUpperCase();
    
    if (!promoCode) {
        window.productUI?.showToast('Please enter a promo code', 'error');
        return;
    }
    
    // Valid promo codes (in production, this would check against a database)
    const validPromoCodes = {
        'WELCOME10': 0.10, // 10% off
        'SUMMER25': 0.25,  // 25% off
        'FREESHIP': 'free-shipping' // Free shipping
    };
    
    if (validPromoCodes[promoCode]) {
        CartUIState.selectedPromoCode = {
            code: promoCode,
            value: validPromoCodes[promoCode]
        };
        
        applyPromoDiscount();
        window.productUI?.showToast(`Promo code "${promoCode}" applied!`, 'success');
    } else {
        window.productUI?.showToast('Invalid promo code', 'error');
    }
}

/**
 * Applies promo discount to cart
 */
function applyPromoDiscount() {
    if (!CartUIState.selectedPromoCode) return;
    
    const cartTotal = window.productModule.getCartTotal();
    let discountAmount = 0;
    
    if (typeof CartUIState.selectedPromoCode.value === 'number') {
        // Percentage discount
        discountAmount = cartTotal.subtotal * CartUIState.selectedPromoCode.value;
    } else if (CartUIState.selectedPromoCode.value === 'free-shipping') {
        // Free shipping
        discountAmount = cartTotal.shipping;
    }
    
    // Update UI with discount
    const discountElement = document.getElementById('promoDiscount');
    if (discountElement) {
        discountElement.textContent = `-$${discountAmount.toFixed(2)}`;
        discountElement.parentElement.style.display = 'flex';
    }
    
    // Update total
    const newTotal = cartTotal.total - discountAmount;
    const totalElement = document.getElementById('cartTotal');
    if (totalElement) {
        totalElement.textContent = `$${newTotal.toFixed(2)}`;
    }
}

/**
 * Handles checkout process
 */
async function handleCheckout() {
    const cartItems = window.productModule.getCartItems();
    
    if (cartItems.length === 0) {
        window.productUI?.showToast('Your cart is empty', 'error');
        return;
    }
    
    // Check if user is logged in
    const user = window.authModule?.getCurrentUser();
    if (!user) {
        window.productUI?.showToast('Please log in to checkout', 'error');
        window.authUI?.showLoginModal();
        return;
    }
    
    // Show loading state
    CartUIState.isCheckoutLoading = true;
    const checkoutBtn = document.querySelector('.checkout-btn');
    const originalText = checkoutBtn?.innerHTML;
    
    if (checkoutBtn) {
        checkoutBtn.innerHTML = `
            <span class="loading-spinner"></span>
            Processing...
        `;
        checkoutBtn.disabled = true;
    }
    
    try {
        // In a real application, this would:
        // 1. Create an order in Firestore
        // 2. Process payment through Stripe/PayPal
        // 3. Send confirmation email
        // 4. Update inventory
        
        // For now, simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create order in Firestore (if available)
        const db = window.firebaseUtils?.getFirestore();
        if (db && user) {
            const orderData = {
                userId: user.uid,
                items: cartItems.map(item => ({
                    productId: item.product.id,
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price,
                    color: item.color,
                    size: item.size
                })),
                subtotal: window.productModule.getCartTotal().subtotal,
                shipping: window.productModule.getCartTotal().shipping,
                tax: window.productModule.getCartTotal().tax,
                total: window.productModule.getCartTotal().total,
                promoCode: CartUIState.selectedPromoCode?.code || null,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('orders').add(orderData);
        }
        
        // Show success message
        window.productUI?.showToast('🎉 Order placed successfully! Thank you for your purchase.', 'success');
        
        // Clear cart
        window.productModule.clearCart();
        
        // Reset checkout button
        if (checkoutBtn) {
            checkoutBtn.innerHTML = originalText;
            checkoutBtn.disabled = false;
        }
        
        // Redirect to order confirmation (in production)
        // window.location.href = '/order-confirmation.html';
        
        // For now, show a success modal
        showOrderConfirmation();
        
    } catch (error) {
        console.error('Checkout error:', error);
        window.productUI?.showToast('Checkout failed. Please try again.', 'error');
        
        // Reset checkout button
        if (checkoutBtn) {
            checkoutBtn.innerHTML = originalText;
            checkoutBtn.disabled = false;
        }
    } finally {
        CartUIState.isCheckoutLoading = false;
    }
}

/**
 * Shows order confirmation modal
 */
function showOrderConfirmation() {
    const cartTotal = window.productModule.getCartTotal();
    
    const modalHTML = `
        <div class="modal-overlay" id="orderConfirmationModal">
            <div class="modal-container" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>🎉 Order Confirmed!</h2>
                    <button class="modal-close" onclick="hideOrderConfirmation()">×</button>
                </div>
                <div class="modal-content">
                    <div style="text-align: center; padding: 2rem 0;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
                        <h3 style="color: var(--color-success); margin-bottom: 1rem;">Thank You for Your Purchase!</h3>
                        <p style="color: var(--color-gray); margin-bottom: 1.5rem;">
                            Your order has been received and is being processed.
                            You will receive a confirmation email shortly.
                        </p>
                        <div style="background: var(--color-light); padding: 1.5rem; border-radius: 1rem; margin-bottom: 1.5rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span>Order Total:</span>
                                <strong style="color: var(--color-primary-dark);">
                                    $${cartTotal.total.toFixed(2)}
                                </strong>
                            </div>
                            <div style="font-size: 0.9rem; color: var(--color-gray);">
                                Estimated delivery: 3-5 business days
                            </div>
                        </div>
                        <div style="display: flex; gap: 1rem; justify-content: center;">
                            <button onclick="hideOrderConfirmation()" class="btn btn-primary">
                                Continue Shopping
                            </button>
                            <button onclick="viewOrderDetails()" class="btn btn-secondary">
                                View Order Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

/**
 * Hides order confirmation modal
 */
function hideOrderConfirmation() {
    const modal = document.getElementById('orderConfirmationModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

/**
 * Handles continue shopping
 */
function handleContinueShopping() {
    // In a SPA, this would navigate back to products
    // For now, just close the modal if on cart page
    if (window.location.pathname.includes('cart.html')) {
        window.history.back();
    }
}

/**
 * Handles clear cart
 */
function handleClearCart() {
    if (confirm('Are you sure you want to clear your entire cart?')) {
        window.productModule.clearCart();
        window.productUI?.showToast('Cart cleared', 'info');
    }
}

/**
 * Handles cart updated event
 * @param {CustomEvent} event - Cart updated event
 */
function handleCartUpdated(event) {
    updateCartUI();
}

/**
 * Updates cart UI
 */
function updateCartUI() {
    if (CartUIState.currentTab === 'cart') {
        showCartContent();
    }
}

// Initialize cart when module loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
} else {
    setTimeout(initCart, 100);
}

// Export cart functions
window.cartModule = {
    initCart: initCart,
    showCartContent: showCartContent,
    showFavoritesContent: showFavoritesContent,
    handleCheckout: handleCheckout,
    handleApplyPromoCode: handleApplyPromoCode,
    
    // For global access
    hideOrderConfirmation: hideOrderConfirmation
};

// Global functions for inline event handlers
window.viewOrderDetails = function() {
    alert('Order details page would show here. In production, this would navigate to an order details page.');
    hideOrderConfirmation();
};