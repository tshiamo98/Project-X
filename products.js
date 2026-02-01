/**
 * products.js
 * 
 * Product catalog data and business logic.
 * Handles product fetching, filtering, and cart/favorites operations.
 */

// Sample product data (in production, this would come from Firestore)
const sampleProducts = [
    {
        id: 'prod_001',
        name: 'Floral Summer Dress',
        description: 'Beautiful floral print dress perfect for summer days. Made from breathable cotton with a comfortable fit.',
        category: 'dresses',
        price: 49.99,
        originalPrice: 69.99,
        images: [
            'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1585487000160-6eb9ce6b5a73?w=400&h=400&fit=crop'
        ],
        stock: 25,
        rating: 4.5,
        reviewCount: 128,
        tags: ['new', 'popular', 'summer'],
        colors: ['Pink', 'White', 'Lavender'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        sku: 'FDR-001'
    },
    {
        id: 'prod_002',
        name: 'Elegant Pearl Necklace',
        description: 'Classic pearl necklace with sterling silver chain. Perfect for formal occasions or everyday elegance.',
        category: 'jewelry',
        price: 89.99,
        originalPrice: 119.99,
        images: [
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1535632787359-a5b8b4b5b8f2?w=400&h=400&fit=crop'
        ],
        stock: 15,
        rating: 4.8,
        reviewCount: 89,
        tags: ['sale', 'luxury'],
        colors: ['White', 'Rose Gold'],
        sizes: ['One Size'],
        sku: 'JWL-002'
    },
    {
        id: 'prod_003',
        name: 'Woven Straw Handbag',
        description: 'Stylish straw handbag with leather accents. Perfect for beach days or summer outings.',
        category: 'bags',
        price: 39.99,
        originalPrice: 49.99,
        images: [
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=400&fit=crop'
        ],
        stock: 8,
        rating: 4.3,
        reviewCount: 42,
        tags: ['new', 'summer'],
        colors: ['Natural', 'Black'],
        sizes: ['Medium'],
        sku: 'BAG-003'
    },
    {
        id: 'prod_004',
        name: 'Silk Scarf Set',
        description: 'Set of three elegant silk scarves in matching colors. Lightweight and versatile.',
        category: 'accessories',
        price: 29.99,
        originalPrice: 39.99,
        images: [
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1547018573-3a6c75e0b6b5?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'
        ],
        stock: 50,
        rating: 4.7,
        reviewCount: 156,
        tags: ['popular', 'sale'],
        colors: ['Multicolor', 'Pastel'],
        sizes: ['One Size'],
        sku: 'ACC-004'
    },
    {
        id: 'prod_005',
        name: 'Lace Trim Blouse',
        description: 'Elegant blouse with delicate lace trim. Perfect for both casual and formal occasions.',
        category: 'tops',
        price: 34.99,
        originalPrice: 44.99,
        images: [
            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1585487000160-6eb9ce6b5a73?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=400&h=400&fit=crop'
        ],
        stock: 30,
        rating: 4.4,
        reviewCount: 67,
        tags: ['new'],
        colors: ['White', 'Ivory', 'Blush'],
        sizes: ['XS', 'S', 'M', 'L'],
        sku: 'TOP-005'
    },
    {
        id: 'prod_006',
        name: 'High-Waist Leggings',
        description: 'Comfortable high-waist leggings with tummy control. Perfect for workouts or casual wear.',
        category: 'bottoms',
        price: 24.99,
        originalPrice: 34.99,
        images: [
            'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop'
        ],
        stock: 45,
        rating: 4.6,
        reviewCount: 203,
        tags: ['popular', 'sale'],
        colors: ['Black', 'Gray', 'Navy'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        sku: 'BOT-006'
    }
];

// Product categories
const productCategories = [
    { id: 'all', name: 'All Products', count: 6 },
    { id: 'dresses', name: 'Dresses', count: 1 },
    { id: 'jewelry', name: 'Jewelry', count: 1 },
    { id: 'bags', name: 'Bags', count: 1 },
    { id: 'accessories', name: 'Accessories', count: 1 },
    { id: 'tops', name: 'Tops', count: 1 },
    { id: 'bottoms', name: 'Bottoms', count: 1 }
];

// Product state
const ProductState = {
    products: [],
    filteredProducts: [],
    currentCategory: 'all',
    sortBy: 'featured',
    currentPage: 1,
    itemsPerPage: 9,
    cart: [],
    favorites: [],
    isLoading: false
};

/**
 * Initializes product module
 */
function initProducts() {
    // Load products (in production, this would fetch from Firestore)
    ProductState.products = sampleProducts;
    ProductState.filteredProducts = [...sampleProducts];
    
    // Load user's cart and favorites from Firestore
    loadUserLists();
    
    console.log('Products module initialized');
}

/**
 * Loads user's cart and favorites from Firestore
 */
async function loadUserLists() {
    const user = window.authModule?.getCurrentUser();
    if (!user) {
        // User not logged in, use localStorage as fallback
        loadListsFromLocalStorage();
        return;
    }
    
    try {
        const db = window.firebaseUtils?.getFirestore();
        if (!db) {
            loadListsFromLocalStorage();
            return;
        }
        
        // Load cart
        const cartRef = db.collection('users').doc(user.uid).collection('cart').doc('items');
        const cartDoc = await cartRef.get();
        
        if (cartDoc.exists) {
            ProductState.cart = cartDoc.data().items || [];
        }
        
        // Load favorites
        const favRef = db.collection('users').doc(user.uid).collection('favorites').doc('items');
        const favDoc = await favRef.get();
        
        if (favDoc.exists) {
            ProductState.favorites = favDoc.data().items || [];
        }
        
        console.log('User lists loaded from Firestore');
        
    } catch (error) {
        console.error('Error loading user lists:', error);
        loadListsFromLocalStorage();
    }
}

/**
 * Loads cart and favorites from localStorage as fallback
 */
function loadListsFromLocalStorage() {
    try {
        const cartData = localStorage.getItem('boutique_bliss_cart');
        const favData = localStorage.getItem('boutique_bliss_favorites');
        
        if (cartData) {
            ProductState.cart = JSON.parse(cartData);
        }
        
        if (favData) {
            ProductState.favorites = JSON.parse(favData);
        }
        
        console.log('Lists loaded from localStorage');
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
}

/**
 * Saves user lists to Firestore or localStorage
 */
async function saveUserLists() {
    const user = window.authModule?.getCurrentUser();
    
    // Always save to localStorage as backup
    try {
        localStorage.setItem('boutique_bliss_cart', JSON.stringify(ProductState.cart));
        localStorage.setItem('boutique_bliss_favorites', JSON.stringify(ProductState.favorites));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
    
    // Save to Firestore if user is logged in
    if (!user) return;
    
    try {
        const db = window.firebaseUtils?.getFirestore();
        if (!db) return;
        
        // Save cart
        const cartRef = db.collection('users').doc(user.uid).collection('cart').doc('items');
        await cartRef.set({ 
            items: ProductState.cart,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        // Save favorites
        const favRef = db.collection('users').doc(user.uid).collection('favorites').doc('items');
        await favRef.set({ 
            items: ProductState.favorites,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        console.log('User lists saved to Firestore');
        
    } catch (error) {
        console.error('Error saving to Firestore:', error);
    }
}

/**
 * Gets all products
 * @returns {Array} All products
 */
function getAllProducts() {
    return ProductState.products;
}

/**
 * Gets filtered products based on current filters
 * @returns {Array} Filtered products
 */
function getFilteredProducts() {
    let filtered = [...ProductState.products];
    
    // Filter by category
    if (ProductState.currentCategory !== 'all') {
        filtered = filtered.filter(product => 
            product.category === ProductState.currentCategory
        );
    }
    
    // Sort products
    filtered = sortProducts(filtered, ProductState.sortBy);
    
    ProductState.filteredProducts = filtered;
    return filtered;
}

/**
 * Sorts products by given criteria
 * @param {Array} products - Products to sort
 * @param {string} sortBy - Sort criteria
 * @returns {Array} Sorted products
 */
function sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch (sortBy) {
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name-asc':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return sorted.sort((a, b) => b.name.localeCompare(a.name));
        case 'rating':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'newest':
            // In production, this would use creation date
            return sorted.reverse();
        default: // 'featured'
            return sorted;
    }
}

/**
 * Gets products for current page
 * @returns {Array} Paginated products
 */
function getPaginatedProducts() {
    const start = (ProductState.currentPage - 1) * ProductState.itemsPerPage;
    const end = start + ProductState.itemsPerPage;
    return ProductState.filteredProducts.slice(start, end);
}

/**
 * Gets total number of pages
 * @returns {number} Total pages
 */
function getTotalPages() {
    return Math.ceil(ProductState.filteredProducts.length / ProductState.itemsPerPage);
}

/**
 * Sets current category
 * @param {string} categoryId - Category ID
 */
function setCategory(categoryId) {
    ProductState.currentCategory = categoryId;
    ProductState.currentPage = 1; // Reset to first page
    getFilteredProducts();
    
    // Dispatch event for UI update
    dispatchProductUpdate();
}

/**
 * Sets sort order
 * @param {string} sortBy - Sort criteria
 */
function setSortOrder(sortBy) {
    ProductState.sortBy = sortBy;
    getFilteredProducts();
    dispatchProductUpdate();
}

/**
 * Sets current page
 * @param {number} page - Page number
 */
function setPage(page) {
    const totalPages = getTotalPages();
    if (page >= 1 && page <= totalPages) {
        ProductState.currentPage = page;
        dispatchProductUpdate();
    }
}

/**
 * Gets product by ID
 * @param {string} productId - Product ID
 * @returns {Object|null} Product or null
 */
function getProductById(productId) {
    return ProductState.products.find(product => product.id === productId) || null;
}

/**
 * Adds product to cart
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @param {Object} options - Additional options (color, size)
 */
function addToCart(productId, quantity = 1, options = {}) {
    const product = getProductById(productId);
    if (!product) {
        console.error('Product not found:', productId);
        return false;
    }
    
    // Check if product is already in cart
    const existingIndex = ProductState.cart.findIndex(item => 
        item.productId === productId && 
        item.color === options.color && 
        item.size === options.size
    );
    
    if (existingIndex >= 0) {
        // Update quantity
        ProductState.cart[existingIndex].quantity += quantity;
    } else {
        // Add new item
        ProductState.cart.push({
            productId,
            quantity,
            color: options.color || product.colors?.[0],
            size: options.size || product.sizes?.[0],
            addedAt: new Date().toISOString()
        });
    }
    
    saveUserLists();
    dispatchCartUpdate();
    
    console.log('Added to cart:', product.name);
    return true;
}

/**
 * Removes product from cart
 * @param {string} productId - Product ID
 * @param {string} color - Product color
 * @param {string} size - Product size
 */
function removeFromCart(productId, color, size) {
    ProductState.cart = ProductState.cart.filter(item => 
        !(item.productId === productId && 
          item.color === color && 
          item.size === size)
    );
    
    saveUserLists();
    dispatchCartUpdate();
}

/**
 * Updates cart item quantity
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @param {string} color - Product color
 * @param {string} size - Product size
 */
function updateCartQuantity(productId, quantity, color, size) {
    const itemIndex = ProductState.cart.findIndex(item => 
        item.productId === productId && 
        item.color === color && 
        item.size === size
    );
    
    if (itemIndex >= 0) {
        if (quantity > 0) {
            ProductState.cart[itemIndex].quantity = quantity;
        } else {
            ProductState.cart.splice(itemIndex, 1);
        }
        
        saveUserLists();
        dispatchCartUpdate();
    }
}

/**
 * Gets cart items with full product details
 * @returns {Array} Cart items with product details
 */
function getCartItems() {
    return ProductState.cart.map(cartItem => {
        const product = getProductById(cartItem.productId);
        if (!product) return null;
        
        return {
            ...cartItem,
            product: {
                id: product.id,
                name: product.name,
                description: product.description,
                category: product.category,
                price: product.price,
                originalPrice: product.originalPrice,
                images: product.images,
                stock: product.stock,
                colors: product.colors,
                sizes: product.sizes,
                sku: product.sku
            }
        };
    }).filter(item => item !== null);
}

/**
 * Gets cart total
 * @returns {Object} Cart totals
 */
function getCartTotal() {
    const cartItems = getCartItems();
    
    const subtotal = cartItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);
    
    const savings = cartItems.reduce((total, item) => {
        if (item.product.originalPrice) {
            return total + ((item.product.originalPrice - item.product.price) * item.quantity);
        }
        return total;
    }, 0);
    
    const shipping = subtotal > 50 ? 0 : 4.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        savings: parseFloat(savings.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        itemCount: cartItems.reduce((count, item) => count + item.quantity, 0)
    };
}

/**
 * Toggles product in favorites
 * @param {string} productId - Product ID
 */
function toggleFavorite(productId) {
    const index = ProductState.favorites.indexOf(productId);
    
    if (index >= 0) {
        // Remove from favorites
        ProductState.favorites.splice(index, 1);
    } else {
        // Add to favorites
        ProductState.favorites.push(productId);
    }
    
    saveUserLists();
    dispatchFavoritesUpdate();
    
    const product = getProductById(productId);
    console.log(product ? 
        `${product.name} ${index >= 0 ? 'removed from' : 'added to'} favorites` : 
        'Favorite toggled'
    );
}

/**
 * Checks if product is in favorites
 * @param {string} productId - Product ID
 * @returns {boolean} True if product is favorited
 */
function isFavorite(productId) {
    return ProductState.favorites.includes(productId);
}

/**
 * Gets favorite products
 * @returns {Array} Favorite products
 */
function getFavoriteProducts() {
    return ProductState.favorites
        .map(productId => getProductById(productId))
        .filter(product => product !== null);
}

/**
 * Dispatches product update event
 */
function dispatchProductUpdate() {
    document.dispatchEvent(new CustomEvent('productsUpdated', {
        detail: {
            products: getPaginatedProducts(),
            filteredProducts: ProductState.filteredProducts,
            currentCategory: ProductState.currentCategory,
            sortBy: ProductState.sortBy,
            currentPage: ProductState.currentPage,
            totalPages: getTotalPages()
        }
    }));
}

/**
 * Dispatches cart update event
 */
function dispatchCartUpdate() {
    document.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: {
            cartItems: getCartItems(),
            cartTotal: getCartTotal()
        }
    }));
}

/**
 * Dispatches favorites update event
 */
function dispatchFavoritesUpdate() {
    document.dispatchEvent(new CustomEvent('favoritesUpdated', {
        detail: {
            favorites: ProductState.favorites,
            favoriteProducts: getFavoriteProducts()
        }
    }));
}

/**
 * Clears cart
 */
function clearCart() {
    ProductState.cart = [];
    saveUserLists();
    dispatchCartUpdate();
}

/**
 * Gets product categories
 * @returns {Array} Product categories
 */
function getCategories() {
    return productCategories;
}

// Initialize products when module loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProducts);
} else {
    setTimeout(initProducts, 100);
}

// Export product functions
window.productModule = {
    // Product management
    getAllProducts: getAllProducts,
    getFilteredProducts: getFilteredProducts,
    getPaginatedProducts: getPaginatedProducts,
    getProductById: getProductById,
    getCategories: getCategories,
    
    // Filters and sorting
    setCategory: setCategory,
    setSortOrder: setSortOrder,
    setPage: setPage,
    getTotalPages: getTotalPages,
    
    // Cart operations
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    updateCartQuantity: updateCartQuantity,
    getCartItems: getCartItems,
    getCartTotal: getCartTotal,
    clearCart: clearCart,
    
    // Favorites operations
    toggleFavorite: toggleFavorite,
    isFavorite: isFavorite,
    getFavoriteProducts: getFavoriteProducts,
    
    // State
    state: ProductState,
    
    // Events
    events: {
        PRODUCTS_UPDATED: 'productsUpdated',
        CART_UPDATED: 'cartUpdated',
        FAVORITES_UPDATED: 'favoritesUpdated'
    }
};