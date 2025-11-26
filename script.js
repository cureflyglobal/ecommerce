/* ==========================================================
    LUXE E-COMMERCE MOCKUP - SCRIPT.JS
    Handles all mock data, routing, cart, and product logic.
========================================================== */

const PRODUCTS = [
    {
        id: '101',
        name: 'Classic Silk Trench Coat',
        price: 499.00,
        currency: 'USD',
        category: 'Women',
        description: 'An enduring classic, crafted from luxurious silk-blend fabric. Features a belted waist and oversized lapels.',
        images: ['https://source.unsplash.com/random/400x400/?coat,woman', 'https://source.unsplash.com/random/400x400/?trench,coat'],
        sku: 'W-TC-001',
        rating: 4.8,
        featured: true,
        colors: ['Black', 'Beige'],
        sizes: ['S', 'M', 'L'],
        stock: 12
    },
    {
        id: '102',
        name: 'Wool Cashmere Sweater',
        price: 189.99,
        currency: 'USD',
        category: 'Men',
        description: 'A supremely soft wool-cashmere blend sweater. Perfect for layering in transitional weather.',
        images: ['https://source.unsplash.com/random/400x400/?sweater,man', 'https://source.unsplash.com/random/400x400/?cashmere,sweater'],
        sku: 'M-SW-005',
        rating: 4.5,
        featured: true,
        colors: ['Gray', 'Blue'],
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 25
    },
    {
        id: '103',
        name: 'Diamond Stud Earrings',
        price: 850.00,
        currency: 'USD',
        category: 'Accessories',
        description: 'Elegant 1ct simulated diamond stud earrings set in 18k white gold.',
        images: ['https://source.unsplash.com/random/400x400/?jewelry,earrings'],
        sku: 'A-JR-010',
        rating: 5.0,
        featured: false,
        colors: ['White'],
        sizes: ['OS'],
        stock: 5
    },
    {
        id: '104',
        name: 'Slim Fit Denim Jeans',
        price: 95.00,
        currency: 'USD',
        category: 'Men',
        description: 'Premium quality slim-fit denim jeans with natural fading. Comfortable and durable.',
        images: ['https://source.unsplash.com/random/400x400/?denim,jeans', 'https://source.unsplash.com/random/400x400/?jeans,fashion'],
        sku: 'M-DN-002',
        rating: 4.2,
        featured: true,
        colors: ['Blue', 'Black'],
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 40
    },
    {
        id: '105',
        name: 'Leather Crossbody Bag',
        price: 240.00,
        currency: 'USD',
        category: 'Women',
        description: 'Italian leather crossbody bag with polished hardware and adjustable strap.',
        images: ['https://source.unsplash.com/random/400x400/?bag,leather', 'https://source.unsplash.com/random/400x400/?crossbody,bag'],
        sku: 'W-BG-003',
        rating: 4.7,
        featured: false,
        colors: ['Black', 'Red'],
        sizes: ['OS'],
        stock: 18
    },
    {
        id: '106',
        name: 'Geometric Silk Scarf',
        price: 65.00,
        currency: 'USD',
        category: 'Accessories',
        description: '100% silk scarf featuring a unique geometric print. Adds a refined touch to any outfit.',
        images: ['https://source.unsplash.com/random/400x400/?scarf,silk'],
        sku: 'A-SF-001',
        rating: 4.6,
        featured: false,
        colors: ['Blue', 'Red'],
        sizes: ['OS'],
        stock: 30
    }
];

// ==========================================================
// 1. STATE MANAGEMENT (localStorage for persistence)
// ==========================================================

let cart = JSON.parse(localStorage.getItem('luxeCart')) || [];
let wishlist = JSON.parse(localStorage.getItem('luxeWishlist')) || [];
let currentPage = 'home';
let currentProductId = null;
let currentCurrency = localStorage.getItem('luxeCurrency') || 'USD';
let currentFilters = JSON.parse(localStorage.getItem('luxeFilters')) || {
    category: [],
    price: [],
    size: [],
    color: [],
    rating: []
};
let currentSearchTerm = '';
let currentSort = localStorage.getItem('luxeSort') || 'newest';
let productsPerPage = 8;
let currentPaginationPage = 1;


function saveState() {
    localStorage.setItem('luxeCart', JSON.stringify(cart));
    localStorage.setItem('luxeWishlist', JSON.stringify(wishlist));
    localStorage.setItem('luxeCurrency', currentCurrency);
    localStorage.setItem('luxeFilters', JSON.stringify(currentFilters));
    localStorage.setItem('luxeSort', currentSort);
}

// ==========================================================
// 2. CURRENCY & PRICE HELPER
// ==========================================================

const EXCHANGE_RATES = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79
};

const CURRENCY_SYMBOLS = {
    USD: '$',
    EUR: '€',
    GBP: '£'
};

/**
 * Converts and formats a price based on the selected currency.
 * @param {number} price - Price in base USD.
 * @returns {string} - Formatted price string (e.g., "$99.00").
 */
function formatPrice(price) {
    const rate = EXCHANGE_RATES[currentCurrency];
    const symbol = CURRENCY_SYMBOLS[currentCurrency];
    const convertedPrice = (price * rate).toFixed(2);
    return `${symbol}${convertedPrice}`;
}

function changeCurrency(newCurrency) {
    currentCurrency = newCurrency;
    saveState();
    
    // Re-render components that display price
    renderProductGrid(true); 
    renderCart();
    renderWishlist();
    // Update the select box
    document.getElementById('currency-select').value = newCurrency;
}


// ==========================================================
// 3. NAVIGATION / ROUTING LOGIC
// ==========================================================

const pages = document.querySelectorAll('.page');

/**
 * Handles page navigation with sliding transitions.
 * @param {string} pageId - The ID of the page to navigate to (e.g., 'home', 'shop').
 * @param {string|null} productId - Optional product ID for the product page.
 * @param {boolean} isForward - True for forward (LTR) slide, false for backward (RTL).
 */
function navigateTo(pageId, productId = null, isForward = true) {
    const targetPage = document.getElementById(`page-${pageId}`);
    if (!targetPage) return;

    // Determine the direction of the slide animation
    const animationClass = isForward ? 'slide-in-ltr' : 'slide-in-rtl';

    // Deactivate all pages first
    pages.forEach(page => {
        page.classList.remove('active', 'slide-in-ltr', 'slide-in-rtl');
    });

    // Activate the target page with the animation
    setTimeout(() => {
        targetPage.classList.add('active', animationClass);
        currentPage = pageId;
        
        // Execute specific page setup functions
        if (pageId === 'shop') {
            renderProductGrid();
        } else if (pageId === 'product' && productId) {
            currentProductId = productId;
            renderProductDetail(productId);
        } else if (pageId === 'cart') {
            renderCart();
        } else if (pageId === 'wishlist') {
            renderWishlist();
        }
        
        // Scroll to the top of the content area
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
}

/** Utility for Home Page Category Click */
function navigateToCategory(category) {
    clearFilters(); // Clear existing filters first
    currentFilters.category.push(category);
    navigateTo('shop', null, true);
}


// ==========================================================
// 4. PRODUCT LISTING & FILTERING
// ==========================================================

function getFilteredAndSortedProducts() {
    let filtered = PRODUCTS.filter(product => {
        let matchesCategory = currentFilters.category.length === 0 || currentFilters.category.includes(product.category);
        
        let matchesPrice = currentFilters.price.length === 0 || currentFilters.price.some(range => {
            const [min, max] = range.split('-').map(Number);
            return product.price >= min && product.price <= max;
        });

        let matchesSize = currentFilters.size.length === 0 || currentFilters.size.some(size => product.sizes.includes(size));
        let matchesColor = currentFilters.color.length === 0 || currentFilters.color.some(color => product.colors.includes(color));
        
        let matchesRating = currentFilters.rating.length === 0 || currentFilters.rating.some(minRating => product.rating >= Number(minRating));
        
        let matchesSearch = !currentSearchTerm || 
                            product.name.toLowerCase().includes(currentSearchTerm.toLowerCase()) || 
                            product.description.toLowerCase().includes(currentSearchTerm.toLowerCase());

        return matchesCategory && matchesPrice && matchesSize && matchesColor && matchesRating && matchesSearch;
    });

    // Apply sorting
    filtered.sort((a, b) => {
        switch (currentSort) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return b.rating - a.rating;
            case 'newest':
            default:
                // For simplicity, sort newest items (mock)
                return PRODUCTS.indexOf(b) - PRODUCTS.indexOf(a); 
        }
    });
    
    return filtered;
}

/** Renders one page of the product grid. */
function renderProductGrid(keepScroll = false) {
    const container = document.getElementById('products-grid');
    const productCountElement = document.getElementById('product-count');
    const allProducts = getFilteredAndSortedProducts();
    const totalPages = Math.ceil(allProducts.length / productsPerPage);
    
    // Ensure the current page is valid
    if (currentPaginationPage > totalPages && totalPages > 0) {
        currentPaginationPage = totalPages;
    } else if (totalPages === 0) {
        currentPaginationPage = 1;
    }
    
    const startIndex = (currentPaginationPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToDisplay = allProducts.slice(startIndex, endIndex);

    productCountElement.textContent = allProducts.length;
    document.getElementById('pagination-info').textContent = `Page ${currentPaginationPage} of ${totalPages || 1}`;

    if (allProducts.length === 0) {
        container.innerHTML = `<p class="lg:col-span-3 text-center py-10 text-xl text-gray-600 dark-mode:text-gray-400">No products found matching your criteria.</p>`;
        return;
    }

    container.innerHTML = productsToDisplay.map(product => {
        const isWished = wishlist.includes(product.id);
        const wishlistIconClass = isWished ? 'active' : '';
        const price = formatPrice(product.price);

        // Simple star rating visualization
        const stars = '⭐️'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating));
        
        return `
            <div class="product-card bg-white dark-mode:bg-gray-800 shadow-md rounded-lg overflow-hidden flex flex-col" 
                 onclick="navigateTo('product', '${product.id}', true)">
                <div class="product-image">
                    <img src="${product.images[0]}" alt="${product.name}" class="w-full h-full object-cover">
                </div>
                <div class="p-4 flex-grow">
                    <h3 class="font-semibold text-lg truncate">${product.name}</h3>
                    <p class="text-gray-500 dark-mode:text-gray-400 text-sm">${product.category}</p>
                    <p class="font-bold text-xl mt-2">${price}</p>
                    <div class="text-yellow-500 text-sm mt-1">${stars}</div>
                </div>
                <div class="p-4 flex justify-between items-center border-t dark-mode:border-gray-700">
                    <button class="btn-primary text-sm px-3 py-1.5" onclick="event.stopPropagation(); addToCart('${product.id}', '${product.sizes[0]}', '${product.colors[0]}', 1)">
                        Add to Cart
                    </button>
                    <button 
                        class="text-xl hover:text-red-500 transition" 
                        onclick="event.stopPropagation(); toggleWishlist('${product.id}')" 
                        aria-label="Add to Wishlist">
                        <span class="wishlist-icon ${wishlistIconClass}">🤍</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Rerender featured products on home page too
    if (currentPage === 'home') {
        renderFeaturedProducts();
    }
    
    // Restore scroll position if needed (e.g., after currency change)
    if (!keepScroll) {
        document.getElementById('products-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/** Renders the featured products on the home page. */
function renderFeaturedProducts() {
     const container = document.getElementById('featured-products');
     if (!container) return;
     
     const featured = PRODUCTS.filter(p => p.featured).slice(0, 4);
     
     container.innerHTML = featured.map(product => {
         const price = formatPrice(product.price);
         return `
            <div class="product-card bg-white dark-mode:bg-gray-800 shadow-md rounded-lg overflow-hidden" 
                 onclick="navigateTo('product', '${product.id}', true)">
                <div class="product-image">
                    <img src="${product.images[0]}" alt="${product.name}" class="w-full h-full object-cover">
                </div>
                <div class="p-4">
                    <h3 class="font-semibold text-xl truncate">${product.name}</h3>
                    <p class="font-bold text-lg mt-1">${price}</p>
                </div>
            </div>
         `;
     }).join('');
}


/** Updates filters based on checkbox changes. */
function applyFilters() {
    // Clear current filters and rebuild from checked checkboxes
    currentFilters = { category: [], price: [], size: [], color: [], rating: [] };
    
    document.querySelectorAll('.filter-group input[type="checkbox"]:checked').forEach(checkbox => {
        const filterType = checkbox.getAttribute('data-filter');
        const filterValue = checkbox.value;
        
        if (currentFilters[filterType]) {
            currentFilters[filterType].push(filterValue);
        }
    });

    currentPaginationPage = 1; // Reset to page 1 after filtering
    saveState();
    renderProductGrid();
}

/** Clears all filters and resets the view. */
function clearFilters() {
    currentFilters = { category: [], price: [], size: [], color: [], rating: [] };
    document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.getElementById('search-input').value = '';
    currentSearchTerm = '';
    
    currentPaginationPage = 1;
    saveState();
    renderProductGrid();
}

function applySearchFilter() {
    currentSearchTerm = document.getElementById('search-input').value.trim();
    currentPaginationPage = 1;
    renderProductGrid();
}

function sortProducts() {
    currentSort = document.getElementById('sort-select').value;
    saveState();
    renderProductGrid();
}

function changePage(direction) {
    const allProducts = getFilteredAndSortedProducts();
    const totalPages = Math.ceil(allProducts.length / productsPerPage);
    
    let newPage = currentPaginationPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPaginationPage = newPage;
        renderProductGrid();
    }
}

function toggleMobileFilters() {
    document.getElementById('shop-filters-sidebar').classList.toggle('active');
}


// ==========================================================
// 5. PRODUCT DETAIL PAGE LOGIC
// ==========================================================

let selectedSize = null;
let selectedColor = null;

function renderProductDetail(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
        navigateTo('shop'); // Go back if product is not found
        return;
    }

    // Set initial variants for the detail page
    selectedSize = product.sizes[0];
    selectedColor = product.colors[0];

    // Update static details
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('product-price').textContent = formatPrice(product.price);
    document.getElementById('product-sku').textContent = `SKU: ${product.sku}`;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('product-breadcrumb').textContent = product.name;
    
    // Update product ID for cart/wishlist buttons
    document.getElementById('detail-add-to-cart').setAttribute('data-product-id', productId);
    document.getElementById('detail-wishlist-toggle').setAttribute('data-product-id', productId);


    // --- Wishlist Status ---
    updateWishlistIcon(productId);

    // --- Image Display ---
    document.getElementById('main-product-image').innerHTML = `<img src="${product.images[0]}" alt="${product.name}" class="w-full h-full object-cover">`;
    
    const thumbnailContainer = document.getElementById('thumbnail-container');
    thumbnailContainer.innerHTML = product.images.map((img, index) => 
        `<img src="${img}" alt="Thumbnail ${index + 1}" class="w-20 h-20 object-cover border cursor-pointer" onclick="changeMainImage('${img}')">`
    ).join('');

    // --- Variant Options (Size) ---
    const sizeContainer = document.getElementById('variant-size-options');
    sizeContainer.innerHTML = product.sizes.map(size => `
        <button class="size-option border px-4 py-2 hover:bg-gray-100 dark-mode:hover:bg-gray-600 transition ${size === selectedSize ? 'selected' : ''}" data-size="${size}" onclick="selectVariant(this, 'size')">
            ${size}
        </button>
    `).join('');

    // --- Variant Options (Color) ---
    const colorContainer = document.getElementById('variant-color-options');
    colorContainer.innerHTML = product.colors.map(color => `
        <div class="color-option w-8 h-8 rounded-full border cursor-pointer ring-offset-2 hover:ring-2 ${color === selectedColor ? 'selected' : ''}" 
             style="background-color: ${color.toLowerCase()};" 
             data-color="${color}" 
             onclick="selectVariant(this, 'color')">
        </div>
    `).join('');
    
    // Attach event listener for Add to Cart button
    document.getElementById('detail-add-to-cart').onclick = () => {
        const quantity = parseInt(document.getElementById('quantity-input').value) || 1;
        addToCart(productId, selectedSize, selectedColor, quantity);
    };
}

function changeMainImage(imageSrc) {
    document.getElementById('main-product-image').innerHTML = `<img src="${imageSrc}" alt="Product Image" class="w-full h-full object-cover">`;
}

function selectVariant(element, type) {
    const parentContainer = document.getElementById(`variant-${type}-options`);
    
    // Remove 'selected' class from all options of this type
    parentContainer.querySelectorAll(`.${type}-option`).forEach(option => {
        option.classList.remove('selected');
    });

    // Add 'selected' class to the clicked element
    element.classList.add('selected');

    // Update the selected state
    if (type === 'size') {
        selectedSize = element.getAttribute('data-size');
    } else if (type === 'color') {
        selectedColor = element.getAttribute('data-color');
    }
}


// ==========================================================
// 6. CART LOGIC
// ==========================================================

/**
 * Adds a product variant to the cart.
 * @param {string} productId 
 * @param {string} size 
 * @param {string} color 
 * @param {number} quantity 
 */
function addToCart(productId, size, color, quantity) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    // Create a unique cart item ID based on product and variants
    const itemId = `${productId}-${size}-${color}`;
    
    const existingItem = cart.find(item => item.itemId === itemId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            itemId: itemId,
            productId: productId,
            name: product.name,
            price: product.price,
            image: product.images[0],
            size: size,
            color: color,
            quantity: quantity
        });
    }

    saveState();
    updateCartCount();
    showToast(`${product.name} added to cart!`);
    
    // If we are on the cart page, re-render it immediately
    if (currentPage === 'cart') {
        renderCart();
    }
}

/** Renders the cart page content. */
function renderCart() {
    const container = document.getElementById('cart-items-container');
    const emptyMessage = document.getElementById('empty-cart-message');

    if (cart.length === 0) {
        container.innerHTML = '';
        emptyMessage.style.display = 'block';
        updateCartSummary(0, 0); // Reset summary
        return;
    }

    emptyMessage.style.display = 'none';

    let subtotal = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        const formattedPrice = formatPrice(item.price);
        const formattedItemTotal = formatPrice(itemTotal);

        return `
            <div class="flex items-center p-4 bg-white dark-mode:bg-gray-800 shadow-sm border dark-mode:border-gray-700">
                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover mr-4 cart-item-image">
                <div class="flex-grow">
                    <h4 class="font-semibold">${item.name}</h4>
                    <p class="text-sm text-gray-500 dark-mode:text-gray-400">
                        ${item.size} / ${item.color} - ${formattedPrice}
                    </p>
                    <div class="flex items-center mt-2 space-x-2">
                        <label for="qty-${item.itemId}" class="text-sm">Qty:</label>
                        <input type="number" id="qty-${item.itemId}" value="${item.quantity}" min="1" 
                               class="w-16 p-1 border rounded text-center dark-mode:bg-gray-700"
                               onchange="updateCartItemQuantity('${item.itemId}', this.value)">
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-bold">${formattedItemTotal}</p>
                    <button class="text-red-500 text-sm mt-1 hover:underline" onclick="removeFromCart('${item.itemId}')">
                        Remove
                    </button>
                </div>
            </div>
        `;
    }).join('');

    updateCartSummary(subtotal);
}

function updateCartItemQuantity(itemId, quantity) {
    const newQuantity = parseInt(quantity);
    if (newQuantity < 1 || isNaN(newQuantity)) {
        removeFromCart(itemId);
        return;
    }
    
    const item = cart.find(i => i.itemId === itemId);
    if (item) {
        item.quantity = newQuantity;
        saveState();
        updateCartCount();
        renderCart(); // Re-render to update totals
    }
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.itemId !== itemId);
    saveState();
    updateCartCount();
    renderCart();
    showToast('Item removed from cart.');
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

const TAX_RATE = 0.05; // 5% mock tax
let currentShippingCost = 0;
let currentCouponDiscount = 0;

function updateCartSummary(subtotal, shipping = 0) {
    let finalSubtotal = subtotal || cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    currentShippingCost = shipping; // Use provided shipping cost or default to 0
    
    // Apply discount
    let discountedSubtotal = finalSubtotal - currentCouponDiscount;
    if (discountedSubtotal < 0) discountedSubtotal = 0;
    
    const tax = discountedSubtotal * TAX_RATE;
    const total = discountedSubtotal + tax + currentShippingCost;
    
    document.getElementById('summary-items').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('summary-subtotal').textContent = formatPrice(finalSubtotal);
    document.getElementById('summary-shipping').textContent = currentShippingCost === 0 ? 'Calculated at checkout' : formatPrice(currentShippingCost);
    document.getElementById('summary-tax').textContent = formatPrice(tax);
    document.getElementById('summary-total').textContent = formatPrice(total);
    
    // Update final checkout total
    if (document.getElementById('final-total')) {
        document.getElementById('final-total').textContent = formatPrice(total);
    }
}

function applyCoupon() {
    const couponInput = document.getElementById('coupon-input').value.toUpperCase();
    if (couponInput === 'LUXE20') {
        currentCouponDiscount = 20; // Mock $20 discount
        showToast('Coupon "LUXE20" applied! $20 off.', 'success');
    } else {
        currentCouponDiscount = 0;
        showToast('Invalid coupon code.', 'error');
    }
    document.getElementById('coupon-input').value = '';
    renderCart(); // Re-render to show discount in summary
}


// ==========================================================
// 7. WISHLIST LOGIC
// ==========================================================

/**
 * Toggles a product in the wishlist.
 * @param {string} productId 
 */
function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    
    if (index === -1) {
        wishlist.push(productId);
        showToast('Item added to wishlist!', 'success');
    } else {
        wishlist.splice(index, 1);
        showToast('Item removed from wishlist.');
    }
    
    saveState();
    updateWishlistIcon(productId);
    
    // If on the wishlist page, re-render
    if (currentPage === 'wishlist') {
        renderWishlist();
    }
}

/** Updates the wishlist icon in the header and on the product detail page. */
function updateWishlistIcon(productId = null) {
    // Header icon
    const headerIcon = document.getElementById('wishlist-icon');
    if (headerIcon) {
        headerIcon.textContent = wishlist.length > 0 ? '❤️' : '🤍';
    }
    
    // Detail page icon
    if (productId) {
        const detailIcon = document.getElementById('product-wishlist-icon');
        if (detailIcon) {
            detailIcon.textContent = wishlist.includes(productId) ? '❤️' : '🤍';
        }
    }
}

/** Renders the wishlist page. */
function renderWishlist() {
    const container = document.getElementById('wishlist-container');
    const emptyMessage = document.getElementById('empty-wishlist-message');
    
    if (wishlist.length === 0) {
        container.innerHTML = '';
        emptyMessage.style.display = 'block';
        return;
    }
    
    emptyMessage.style.display = 'none';
    
    const wishedProducts = PRODUCTS.filter(p => wishlist.includes(p.id));
    
    container.innerHTML = wishedProducts.map(product => {
        const price = formatPrice(product.price);
        return `
            <div class="product-card bg-white dark-mode:bg-gray-800 shadow-md rounded-lg overflow-hidden flex flex-col">
                <div class="product-image" onclick="navigateTo('product', '${product.id}', true)">
                    <img src="${product.images[0]}" alt="${product.name}" class="w-full h-full object-cover">
                </div>
                <div class="p-4 flex-grow">
                    <h3 class="font-semibold text-lg truncate">${product.name}</h3>
                    <p class="font-bold text-xl mt-2">${price}</p>
                </div>
                <div class="p-4 flex justify-between items-center border-t dark-mode:border-gray-700">
                    <button class="btn-primary text-sm px-3 py-1.5" onclick="addToCart('${product.id}', '${product.sizes[0]}', '${product.colors[0]}', 1); removeFromWishlist('${product.id}')">
                        Move to Cart
                    </button>
                    <button 
                        class="text-xl text-red-500 hover:text-red-700 transition" 
                        onclick="toggleWishlist('${product.id}')" 
                        aria-label="Remove from Wishlist">
                        <span class="wishlist-icon active">❤️</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}


// ==========================================================
// 8. CHECKOUT & ORDER LOGIC
// ==========================================================

let currentCheckoutStep = 1;

function nextCheckoutStep() {
    if (currentCheckoutStep === 1) {
        // Mock validation for Step 1
        const form = document.getElementById('shipping-form');
        if (!form.reportValidity()) return;
        
        // Mock shipping cost update for summary
        updateCartSummary(null, 10.00); 
    }
    
    if (currentCheckoutStep < 3) {
        document.getElementById(`checkout-step-${currentCheckoutStep}`).classList.add('hidden');
        document.getElementById(`step-icon-${currentCheckoutStep}`).classList.remove('bg-black', 'text-white').classList.add('bg-gray-300', 'text-gray-700', 'dark-mode:bg-gray-600', 'dark-mode:text-gray-300');
        
        currentCheckoutStep++;
        
        document.getElementById(`checkout-step-${currentCheckoutStep}`).classList.remove('hidden');
        document.getElementById(`step-icon-${currentCheckoutStep}`).classList.add('bg-black', 'text-white').classList.remove('bg-gray-300', 'text-gray-700', 'dark-mode:bg-gray-600', 'dark-mode:text-gray-300');
    }
}

function prevCheckoutStep() {
    if (currentCheckoutStep > 1) {
        document.getElementById(`checkout-step-${currentCheckoutStep}`).classList.add('hidden');
        document.getElementById(`step-icon-${currentCheckoutStep}`).classList.remove('bg-black', 'text-white').classList.add('bg-gray-300', 'text-gray-700', 'dark-mode:bg-gray-600', 'dark-mode:text-gray-300');

        currentCheckoutStep--;
        
        document.getElementById(`checkout-step-${currentCheckoutStep}`).classList.remove('hidden');
        document.getElementById(`step-icon-${currentCheckoutStep}`).classList.add('bg-black', 'text-white').classList.remove('bg-gray-300', 'text-gray-700', 'dark-mode:bg-gray-600', 'dark-mode:text-gray-300');
        
        // If returning to step 1, revert shipping summary
        if (currentCheckoutStep === 1) {
             updateCartSummary(null, 0); 
        }
    }
}

function placeOrder() {
    // Mock validation for Step 3
    const form = document.getElementById('payment-form');
    if (!form.reportValidity()) return;
    
    if (cart.length === 0) {
        showToast('Cannot place empty order!', 'error');
        return;
    }
    
    // Mock order creation and storage
    const totalElement = document.getElementById('final-total');
    const finalTotal = totalElement ? totalElement.textContent : formatPrice(0);
    const order = {
        id: Date.now().toString().slice(-6),
        date: new Date().toLocaleDateString(),
        total: finalTotal,
        items: cart,
        status: 'Processing'
    };
    
    let orders = JSON.parse(localStorage.getItem('luxeOrders')) || [];
    orders.push(order);
    localStorage.setItem('luxeOrders', JSON.stringify(orders));
    
    // Clear cart and state
    cart = [];
    currentCheckoutStep = 1;
    saveState();
    updateCartCount();

    // Show confirmation
    showToast(`Order #${order.id} placed successfully!`, 'success');
    
    // Re-initialize steps and navigate home
    setTimeout(() => {
        navigateTo('home', null, true);
    }, 1500); 
}


// ==========================================================
// 9. ACCOUNT & LOGIN (MOCK)
// ==========================================================

let currentUser = JSON.parse(localStorage.getItem('luxeUser')) || null;

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (email === 'admin@luxe.com' && password === '12345') {
        currentUser = { email: email, role: 'admin', name: 'Admin' };
        showToast('Admin logged in!', 'success');
    } else if (email === 'user@test.com' && password === 'password') {
        currentUser = { email: email, role: 'user', name: 'Test User' };
        showToast('User logged in!', 'success');
    } else {
        showToast('Invalid email or password.', 'error');
        return;
    }
    
    localStorage.setItem('luxeUser', JSON.stringify(currentUser));
    renderAccountPage();
});

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('luxeUser');
    showToast('Logged out successfully.', 'success');
    renderAccountPage();
}

function renderAccountPage() {
    const loginPanel = document.getElementById('account-login');
    const dashboardPanel = document.getElementById('account-dashboard');
    
    if (currentUser) {
        loginPanel.classList.add('hidden');
        dashboardPanel.classList.remove('hidden');
        
        document.getElementById('user-display-name').textContent = currentUser.name;
        
        // Show Admin link if user is admin
        document.getElementById('admin-link').classList.toggle('hidden', currentUser.role !== 'admin');
        
        // Render order history
        let orders = JSON.parse(localStorage.getItem('luxeOrders')) || [];
        const orderContainer = document.getElementById('order-history-container');
        
        if (orders.length === 0) {
            orderContainer.innerHTML = '<p class="text-gray-600 dark-mode:text-gray-400">No orders placed yet.</p>';
        } else {
            orderContainer.innerHTML = orders.map(order => `
                <div class="p-3 border rounded dark-mode:border-gray-600">
                    <p class="font-bold">Order #${order.id} - ${order.total}</p>
                    <p class="text-sm text-gray-500">Date: ${order.date} | Status: ${order.status}</p>
                </div>
            `).join('');
        }
        
    } else {
        loginPanel.classList.remove('hidden');
        dashboardPanel.classList.add('hidden');
    }
}


// ==========================================================
// 10. UTILITIES
// ==========================================================

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

/** Displays a temporary toast notification. */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.className = 'fixed bottom-5 right-5 z-[5000] p-3 rounded-lg shadow-xl text-white transition-opacity duration-300';
    
    switch (type) {
        case 'success':
            toast.classList.add('bg-green-600');
            break;
        case 'error':
            toast.classList.add('bg-red-600');
            break;
        case 'info':
        default:
            toast.classList.add('bg-gray-800');
            break;
    }
    
    toast.style.opacity = '1';

    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

function openDocumentation() {
    document.getElementById('docs-modal').style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
}

function closeDocumentation() {
    document.getElementById('docs-modal').style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none';
}


// ==========================================================
// 11. INITIALIZATION
// ==========================================================

/** Runs on page load to set up the initial state. */
function initialize() {
    // 1. Dark Mode check
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
    
    // 2. Set initial currency
    changeCurrency(currentCurrency);

    // 3. Update header UI elements
    updateCartCount();
    updateWishlistIcon();
    
    // 4. Set up event listeners
    document.getElementById('mobile-menu-button').onclick = () => document.getElementById('mobile-menu').classList.toggle('active');
    document.getElementById('mobile-menu-close').onclick = () => document.getElementById('mobile-menu').classList.remove('active');
    
    // 5. Navigate to the initial page (usually home)
    navigateTo(currentPage, null, true);
    
    // 6. Set initial sort/filter state
    document.getElementById('sort-select').value = currentSort;
    
    // Re-apply filters for the shop page if the user navigated away
    if (currentPage === 'shop') {
        // This ensures the checkboxes reflect the state in localStorage
        Object.keys(currentFilters).forEach(filterType => {
            currentFilters[filterType].forEach(value => {
                const checkbox = document.querySelector(`input[data-filter="${filterType}"][value="${value}"]`);
                if (checkbox) checkbox.checked = true;
            });
        });
        renderProductGrid();
    }
    
    // 7. Initial rendering for home page components
    renderFeaturedProducts();
    
    // 8. Account page setup
    renderAccountPage();
}

document.addEventListener('DOMContentLoaded', initialize);
