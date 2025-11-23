/**
 * LUXE E-COMMERCE MOCKUP - script.js
 * * Contains all frontend JavaScript logic for the static HTML pages,
 * including dynamic content rendering, cart management, user accounts,
 * and page navigation.
 * * Features Included:
 * 1. Mock Product Data (Initial Data)
 * 2. Core Navigation & UI Logic (Page Transitions, Dark Mode)
 * 3. Utility & Cart/Wishlist Logic (Persistence via localStorage)
 * 4. Home Page Rendering
 * 5. Shop Page Rendering & Filtering (New Filters Added)
 * 6. Product Detail Rendering (Variant Selection, Wishlist Button)
 * 7. Cart & Checkout Logic
 * 8. Account & Login Logic (Mock)
 * */

// ==========================================================
// 1. MOCK PRODUCT DATA
// ==========================================================

const products = [
    { id: 1, name: "The Classic Cashmere Sweater", price: 199.99, category: "Women", description: "An essential piece crafted from the finest grade-A cashmere. Soft, warm, and timeless.", rating: 4.8, inventory: 50, featured: true, sizes: ["S", "M", "L"], colors: ["Black", "Gray", "Beige"] },
    { id: 2, name: "Premium Selvedge Denim", price: 149.00, category: "Men", description: "Raw Japanese selvedge denim designed to mold perfectly to your body over time.", rating: 4.6, inventory: 30, featured: true, sizes: ["S", "M", "L", "XL"], colors: ["Blue"] },
    { id: 3, name: "Sleek Leather Handbag", price: 349.50, category: "Accessories", description: "Italian leather handbag with minimal hardware and a modern, angular silhouette.", rating: 4.9, inventory: 20, featured: true, sizes: ["OS"], colors: ["Black", "White"] },
    { id: 4, name: "Geometric Silk Scarf", price: 75.00, category: "Accessories", description: "100% silk twill scarf featuring a bold, architectural print.", rating: 4.7, inventory: 70, featured: false, sizes: ["OS"], colors: ["Red", "Blue"] },
    { id: 5, name: "Tailored Linen Blazer", price: 275.00, category: "Men", description: "Lightweight linen blazer, perfect for smart-casual summer events. Unlined construction.", rating: 4.5, inventory: 40, featured: false, sizes: ["M", "L", "XL"], colors: ["White", "Beige"] },
    { id: 6, name: "High-Waisted Wool Trousers", price: 189.99, category: "Women", description: "Structured, high-rise trousers cut from luxurious Australian merino wool.", rating: 4.7, inventory: 60, featured: false, sizes: ["S", "M"], colors: ["Black", "Gray"] },
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let currency = localStorage.getItem('currency') || 'USD';
let currentFilters = { category: [], price: [], size: [], color: [], rating: [] };
let currentPage = 1;
const productsPerPage = 8;
let sortOrder = 'newest';
let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;
let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];

// ==========================================================
// 2. CORE NAVIGATION & UI LOGIC
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initial setup
    loadInitialData();
    applyInitialStyles();
    // Default navigation
    navigateTo('home');
});

function loadInitialData() {
    updateCartCount();
    updateWishlistIcon();
    updateCurrencyDisplay(currency);
    document.getElementById('currency-select').value = currency;
    renderFeaturedProducts();
    // Ensure filters persist on reload if on shop page
    if (document.getElementById('page-shop').classList.contains('active')) {
        applyFilters(); 
    }
}

function applyInitialStyles() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', isDarkMode);
    // Apply styling to filter checkboxes on load
    document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(checkbox => {
        const label = checkbox.parentElement;
        if (checkbox.dataset.filter === 'color') {
            label.classList.toggle('ring-2', checkbox.checked);
        } else {
            label.classList.toggle('bg-gray-200', checkbox.checked);
            label.classList.toggle('dark-mode:bg-gray-600', checkbox.checked);
        }
    });
}

/**
 * Handles all navigation between pages with directional sliding transitions.
 * @param {string} pageId - The ID of the page to navigate to (e.g., 'home', 'shop').
 * @param {number|null} productId - Optional ID for product detail page.
 * @param {boolean|null} directionHint - True for forward (LTR), False for backward (RTL).
 */
function navigateTo(pageId, productId = null, directionHint = null) {
    const pages = document.querySelectorAll('.page');
    const activePage = document.querySelector('.page.active');
    const targetPage = document.getElementById(`page-${pageId}`);
    
    // Determine the direction of the transition
    let transitionDirection = '';
    if (directionHint === true) {
        transitionDirection = 'slide-in-ltr'; // Left to Right
    } else if (directionHint === false) {
        transitionDirection = 'slide-in-rtl'; // Right to Left
    }

    // 1. Hide all pages and remove animation classes
    pages.forEach(page => {
        page.classList.remove('active', 'slide-in-ltr', 'slide-in-rtl');
    });
    
    // Deactivate current page's display after a short delay to allow transition
    if (activePage) {
        activePage.style.display = 'none';
    }

    // 2. Activate target page with animation
    if (targetPage) {
        targetPage.style.display = 'block';
        setTimeout(() => {
            targetPage.classList.add('active');
            if (transitionDirection) {
                targetPage.classList.add(transitionDirection);
            }
        }, 10); // Small delay to ensure display:block applies before animation

        // 3. Trigger page-specific rendering
        if (pageId === 'shop') {
            applyFilters(); // Re-apply filters and render grid
        } else if (pageId === 'product' && productId) {
            renderProductDetail(productId);
        } else if (pageId === 'cart') {
            updateCartDisplay(); 
        } else if (pageId === 'wishlist') {
            renderWishlistDisplay();
        } else if (pageId === 'checkout') {
            setCheckoutStep(1);
        } else if (pageId === 'account') {
            updateAccountView();
        }
    }
    
    // Close mobile menu if open
    document.getElementById('mobile-menu')?.classList.remove('active');
    window.scrollTo(0, 0); // Scroll to top on page change
}

function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('active');
}

function toggleMobileFilters() {
    document.getElementById('shop-filters-sidebar').classList.toggle('active');
}

function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
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
// 3. UTILITY & CART/WISHLIST LOGIC
// ==========================================================

function formatPrice(amount) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    });
    return formatter.format(amount);
}

function changeCurrency(newCurrency) {
    currency = newCurrency;
    localStorage.setItem('currency', currency);
    updateCurrencyDisplay(currency);
    // Re-render all dynamic content to show new currency
    if (document.getElementById('page-shop').classList.contains('active')) applyFilters();
    if (document.getElementById('page-product').classList.contains('active')) renderProductDetail(document.getElementById('product-title').dataset.productId);
    if (document.getElementById('page-cart').classList.contains('active')) updateCartDisplay();
    if (document.getElementById('page-checkout').classList.contains('active')) updateCheckoutSummary();
    if (document.getElementById('page-wishlist').classList.contains('active')) renderWishlistDisplay();

    showToast(`Currency set to ${currency}`);
}

function updateCurrencyDisplay(newCurrency) {
    // This function doesn't need to do much as formatPrice handles the symbol
    // Ensure the select box is updated
    document.getElementById('currency-select').value = newCurrency;
}


// --- Toast Notification ---
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
    }, 3000);
}

// --- Cart Persistence & UI ---
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// --- Wishlist Persistence & UI ---
function saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistIcon();
    if (document.getElementById('page-account').classList.contains('active')) {
        updateAccountWishlistCount();
    }
}

function updateWishlistIcon() {
    const icon = document.getElementById('wishlist-icon');
    if (wishlist.length > 0) {
        icon.textContent = '❤️'; // Filled heart
        icon.classList.add('active');
    } else {
        icon.textContent = '🤍'; // Empty heart
        icon.classList.remove('active');
    }
}

// Function to toggle wishlist status for a specific product
function toggleProductWishlist(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const index = wishlist.findIndex(item => item.id === productId);

    if (index === -1) {
        // Add to wishlist
        wishlist.push({ id: productId, name: product.name });
        showToast(`${product.name} added to wishlist! ❤️`);
    } else {
        // Remove from wishlist
        wishlist.splice(index, 1);
        showToast(`${product.name} removed from wishlist! 🤍`);
    }
    saveWishlist();
    // Update the icon on the product detail page immediately
    updateProductWishlistIcon(productId); 
}

// Function to update the specific icon on the product detail page
function updateProductWishlistIcon(productId) {
    const iconElement = document.getElementById('product-wishlist-icon');
    if (!iconElement) return;

    const isInWishlist = wishlist.some(item => item.id === productId);

    if (isInWishlist) {
        iconElement.textContent = '❤️'; // Filled heart
        iconElement.parentElement.classList.add('border-red-600');
    } else {
        iconElement.textContent = '🤍'; // Empty heart
        iconElement.parentElement.classList.remove('border-red-600');
    }
}

// Function to remove an item from the wishlist
function removeFromWishlist(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    wishlist = wishlist.filter(item => item.id !== productId);
    showToast(`${product.name} removed from wishlist. 💔`);
    saveWishlist();
    renderWishlistDisplay(); // Re-render the page
}

// Function to move an item from wishlist to cart
function moveToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    addToCart(productId, 1); // Add to cart with quantity 1
    
    // Remove from wishlist
    wishlist = wishlist.filter(item => item.id !== productId);
    saveWishlist(); 
    
    showToast(`Moved ${product.name} to cart!`);
    renderWishlistDisplay();
}


// ==========================================================
// 4. HOME PAGE LOGIC
// ==========================================================

// --- Countdown Timer ---
function startCountdown() {
    const saleEnd = new Date(Date.now() + 24 * 60 * 60 * 1000 * 3); // 3 days from now
    const countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = saleEnd - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById("promo-heading").textContent = "Sale Ended.";
            document.querySelector(".countdown").innerHTML = "EXPIRED";
            return;
        }

        document.getElementById("countdown-days").textContent = String(days).padStart(2, '0');
        document.getElementById("countdown-hours").textContent = String(hours).padStart(2, '0');
        document.getElementById("countdown-minutes").textContent = String(minutes).padStart(2, '0');
        document.getElementById("countdown-seconds").textContent = String(seconds).padStart(2, '0');
    }, 1000);
}

function renderFeaturedProducts() {
    const featured = products.filter(p => p.featured).slice(0, 4);
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    container.innerHTML = featured.map(product => {
        const imageEmoji = product.category === "Women" ? '👚' : product.category === "Men" ? '👔' : '💍';
        return `
            <div class="product-card p-4 border dark-mode:border-gray-700 bg-white dark-mode:bg-gray-700 shadow-sm rounded-lg" onclick="navigateTo('product', ${product.id}, true)">
                <div class="product-image mb-4 rounded-md">
                    <span class="text-6xl">${imageEmoji}</span>
                </div>
                <h3 class="text-lg font-semibold truncate">${product.name}</h3>
                <p class="text-gray-500 dark-mode:text-gray-400 text-sm">${product.category}</p>
                <p class="text-xl font-bold mt-2">${formatPrice(product.price)}</p>
            </div>
        `;
    }).join('');
    
    startCountdown();
}


// ==========================================================
// 5. SHOP PAGE LOGIC (Filtering & Sorting)
// ==========================================================

function applyFilters() {
    // 1. Collect Filters
    currentFilters = { category: [], price: [], size: [], color: [], rating: [] };
    const checkboxes = document.querySelectorAll('#shop-filters-sidebar input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const filterType = checkbox.dataset.filter;
            const filterValue = checkbox.value;
            
            // Update filter object
            if (currentFilters[filterType]) {
                currentFilters[filterType].push(filterValue);
            }
        }
        
        // Update styling immediately based on state
        const label = checkbox.parentElement;
        if (checkbox.dataset.filter === 'color') {
            label.classList.toggle('ring-2', checkbox.checked);
            label.classList.toggle('ring-offset-2', checkbox.checked);
            label.classList.toggle('ring-gray-900', checkbox.checked);
        } else {
            label.classList.toggle('bg-gray-200', checkbox.checked);
            label.classList.toggle('dark-mode:bg-gray-600', checkbox.checked);
        }
    });

    // 2. Filter Products
    let filteredProducts = products.filter(product => {
        const { category, price, size, color, rating } = currentFilters;

        // Category filter
        if (category.length > 0 && !category.includes(product.category)) return false;

        // Price filter
        if (price.length > 0) {
            const isPriceMatch = price.some(range => {
                const [min, max] = range.split('-').map(Number);
                return product.price >= min && product.price < max;
            });
            if (!isPriceMatch) return false;
        }

        // Size filter (Assumes product.sizes is an array of available sizes)
        if (size.length > 0) {
             const isSizeMatch = size.some(s => product.sizes.includes(s));
             if (!isSizeMatch) return false;
        }
        
        // Color filter (Assumes product.colors is an array of available colors)
        if (color.length > 0) {
             const isColorMatch = color.some(c => product.colors.includes(c));
             if (!isColorMatch) return false;
        }

        // Rating filter
        if (rating.length > 0) {
            const isRatingMatch = rating.some(minRating => product.rating >= Number(minRating));
            if (!isRatingMatch) return false;
        }
        
        return true;
    });

    // 3. Sort Products
    sortProducts(filteredProducts);
}

function sortProducts(filteredProducts = products) {
    const select = document.getElementById('sort-select');
    if (!select) return;
    sortOrder = select.value;
    
    let productsToSort = filteredProducts;

    productsToSort.sort((a, b) => {
        if (sortOrder === 'price-low') {
            return a.price - b.price;
        } else if (sortOrder === 'price-high') {
            return b.price - a.price;
        } else if (sortOrder === 'rating') {
            return b.rating - a.rating;
        } else { // newest (default)
            return a.id - b.id; // Mocking "newest" by lowest ID
        }
    });
    
    // 4. Paginate and Render
    currentPage = 1;
    renderProductGrid(productsToSort);
}

function clearFilters() {
    document.querySelectorAll('#shop-filters-sidebar input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    // Reset sort to default
    document.getElementById('sort-select').value = 'newest';
    applyFilters();
}

function filterByCategory(category) {
    // Clear all filters first for clean navigation
    clearFilters(); 
    // Set the specific category filter
    const checkbox = document.querySelector(`#shop-filters-sidebar input[value="${category}"]`);
    if (checkbox) checkbox.checked = true;
    
    // Navigate to shop and apply filters
    navigateTo('shop', null, true);
    // Since navigateTo calls applyFilters, we don't need to call it directly here.
}


function renderProductGrid(productsToRender) {
    const container = document.getElementById('products-grid');
    const countElement = document.getElementById('product-count');
    const paginationInfo = document.getElementById('pagination-info');
    if (!container || !countElement || !paginationInfo) return;

    countElement.textContent = productsToRender.length;
    
    // Calculate pagination details
    const totalPages = Math.ceil(productsToRender.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = productsToRender.slice(startIndex, endIndex);

    // Update pagination info
    paginationInfo.textContent = `Page ${totalPages > 0 ? currentPage : 0} of ${totalPages}`;

    container.innerHTML = paginatedProducts.map(product => {
        const imageEmoji = product.category === "Women" ? '👚' : product.category === "Men" ? '👔' : '💍';
        return `
            <div class="product-card p-4 border dark-mode:border-gray-700 bg-white dark-mode:bg-gray-700 shadow-sm rounded-lg" onclick="navigateTo('product', ${product.id}, true)">
                <div class="product-image mb-4 rounded-md">
                    <span class="text-6xl">${imageEmoji}</span>
                </div>
                <h3 class="text-lg font-semibold truncate">${product.name}</h3>
                <p class="text-gray-500 dark-mode:text-gray-400 text-sm">${product.category}</p>
                <p class="text-xl font-bold mt-2">${formatPrice(product.price)}</p>
                <p class="text-sm text-yellow-500">
                    ${'⭐️'.repeat(Math.round(product.rating))} (${product.rating})
                </p>
            </div>
        `;
    }).join('');
}

function changePage(direction) {
    const productsToRender = products.filter(product => {
        // Re-run the full filtering logic to get the correct set of products
        const { category, price, size, color, rating } = currentFilters;

        if (category.length > 0 && !category.includes(product.category)) return false;
        if (price.length > 0) {
            const isPriceMatch = price.some(range => {
                const [min, max] = range.split('-').map(Number);
                return product.price >= min && product.price < max;
            });
            if (!isPriceMatch) return false;
        }
        if (size.length > 0 && !size.some(s => product.sizes.includes(s))) return false;
        if (color.length > 0 && !color.some(c => product.colors.includes(c))) return false;
        if (rating.length > 0 && !rating.some(minRating => product.rating >= Number(minRating))) return false;
        
        return true;
    });

    const totalPages = Math.ceil(productsToRender.length / productsPerPage);
    const newPage = currentPage + direction;

    if (newPage > 0 && newPage <= totalPages) {
        currentPage = newPage;
        // Re-sort the current set before rendering the new page
        sortProducts(productsToRender); 
    }
}


// ==========================================================
// 6. PRODUCT DETAIL LOGIC
// ==========================================================

let selectedVariant = { size: null, color: null };

function renderProductDetail(id) {
    const product = products.find(p => p.id === id);
    if (!product) {
        showToast('Product not found!');
        navigateTo('shop', null, false);
        return;
    }
    
    const imageEmoji = product.category === "Women" ? '👚' : product.category === "Men" ? '👔' : '💍';

    // Update main product details
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('product-title').dataset.productId = product.id; // Store ID for cart/wishlist
    document.getElementById('product-price').textContent = formatPrice(product.price);
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('product-breadcrumb').textContent = product.name;
    document.getElementById('product-sku').textContent = `SKU: LUX-TS-${product.id.toString().padStart(3, '0')}`;
    document.getElementById('main-product-image').innerHTML = `<span class="text-8xl">${imageEmoji}</span>`;
    
    // Reset selected variant
    selectedVariant = { size: null, color: null };

    // --- Render Size Variants ---
    const sizeContainer = document.getElementById('variant-size-options');
    sizeContainer.innerHTML = product.sizes.map(size => `
        <button class="size-option border px-4 py-2 hover:bg-gray-100 dark-mode:hover:bg-gray-600 transition" 
                data-size="${size}" 
                onclick="selectVariant('size', '${size}', this)">${size}</button>
    `).join('');
    
    // --- Render Color Variants ---
    const colorContainer = document.getElementById('variant-color-options');
    colorContainer.innerHTML = product.colors.map(color => {
        const bgColorClass = `bg-${color.toLowerCase().replace(/\s/g, '-')}-600`;
        const initialBgColorClass = color.toLowerCase() === 'white' ? 'bg-white' : (color.toLowerCase() === 'black' ? 'bg-black' : bgColorClass);
        return `
            <div class="color-option w-8 h-8 rounded-full border ring-offset-2 hover:ring-2 cursor-pointer ${initialBgColorClass}"
                 data-color="${color}" 
                 onclick="selectVariant('color', '${color}', this)"></div>
        `;
    }).join('');
    
    // --- Setup Action Buttons ---
    const cartButton = document.getElementById('detail-add-to-cart');
    if(cartButton) {
        // Clear previous click handler before adding new one
        cartButton.onclick = () => { 
            const quantityInput = document.getElementById('quantity-input');
            const quantity = quantityInput ? Number(quantityInput.value) : 1;
            addToCart(product.id, quantity); 
        };
    }
    
    // Wishlist button setup
    const wishlistButton = document.getElementById('detail-wishlist-toggle');
    if (wishlistButton) {
        wishlistButton.onclick = () => toggleProductWishlist(product.id);
        updateProductWishlistIcon(product.id); 
    }
}

function selectVariant(type, value, element) {
    const containerId = type === 'size' ? 'variant-size-options' : 'variant-color-options';
    const container = document.getElementById(containerId);
    
    // Reset all others in the group
    container.querySelectorAll(`[data-${type}]`).forEach(el => {
        el.classList.remove('bg-black', 'text-white', 'dark-mode:bg-white', 'dark-mode:text-black', 'ring-4', 'ring-offset-2', 'ring-black');
        if (type === 'size') {
             el.classList.add('bg-white', 'text-black', 'dark-mode:bg-gray-700', 'dark-mode:text-white');
        }
    });
    
    // Set active state for the selected element
    if (type === 'size') {
        element.classList.add('bg-black', 'text-white', 'dark-mode:bg-white', 'dark-mode:text-black');
    } else if (type === 'color') {
        element.classList.add('ring-4', 'ring-offset-2', 'ring-black');
    }
    
    selectedVariant[type] = value;
    // showToast(`${type} selected: ${value}`); // Optional feedback
}


// ==========================================================
// 7. CART & CHECKOUT LOGIC
// ==========================================================

function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Check for variant selection if needed (Simple version: only check if variants exist)
    const hasVariants = product.sizes?.length > 0 || product.colors?.length > 0;
    const needsSize = product.sizes?.length > 0 && !selectedVariant.size;
    const needsColor = product.colors?.length > 0 && !selectedVariant.color;

    if (needsSize || needsColor) {
        let missing = [];
        if (needsSize) missing.push('Size');
        if (needsColor) missing.push('Color');
        showToast(`Please select a ${missing.join(' and ')} before adding to cart.`);
        return;
    }

    // Create a unique cart item ID based on product ID and selected variants
    const variantString = (selectedVariant.size || '') + (selectedVariant.color || '');
    const cartItemId = productId + '-' + variantString;

    const existingItemIndex = cart.findIndex(item => item.id === cartItemId);
    
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({
            id: cartItemId,
            productId: productId,
            name: product.name,
            price: product.price,
            quantity: quantity,
            size: selectedVariant.size,
            color: selectedVariant.color
        });
    }
    
    saveCart();
    updateCartDisplay();
    showToast(`${quantity} x ${product.name} added to cart!`);
}

function updateCartItemQuantity(cartItemId, newQuantity) {
    const itemIndex = cart.findIndex(item => item.id === cartItemId);
    if (itemIndex > -1) {
        const quantity = Number(newQuantity);
        if (quantity > 0) {
            cart[itemIndex].quantity = quantity;
        } else {
            // Remove item if quantity is zero
            cart.splice(itemIndex, 1);
        }
        saveCart();
        updateCartDisplay();
    }
}

function removeCartItem(cartItemId) {
    cart = cart.filter(item => item.id !== cartItemId);
    saveCart();
    updateCartDisplay();
    showToast('Item removed from cart.');
}

function calculateCartTotals() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const taxRate = 0.05; // Mock 5% tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    return { subtotal, tax, total, itemCount: cart.length };
}

function updateCartDisplay() {
    const { subtotal, tax, total, itemCount } = calculateCartTotals();
    const container = document.getElementById('cart-items-container');
    const emptyMessage = document.getElementById('empty-cart-message');
    
    if (itemCount === 0) {
        container.innerHTML = '';
        if (emptyMessage) emptyMessage.style.display = 'block';
    } else {
        if (emptyMessage) emptyMessage.style.display = 'none';

        container.innerHTML = cart.map(item => {
            const product = products.find(p => p.id === item.productId);
            const imageEmoji = product ? (product.category === "Women" ? '👚' : product.category === "Men" ? '👔' : '💍') : '❓';
            
            const variantInfo = [item.size, item.color].filter(Boolean).join(' / ');

            return `
                <div class="flex items-center gap-6 p-4 border border-gray-200 dark-mode:border-gray-700 bg-white dark-mode:bg-gray-700 shadow-sm">
                    <div class="w-16 h-16 flex items-center justify-center bg-gray-100 dark-mode:bg-gray-800 flex-shrink-0">
                        <span class="text-3xl">${imageEmoji}</span>
                    </div>
                    
                    <div class="flex-1 min-w-0">
                        <h3 class="text-lg font-semibold truncate">${item.name}</h3>
                        <p class="text-sm text-gray-500 dark-mode:text-gray-400">${variantInfo || 'Standard'}</p>
                        <p class="text-base font-bold mt-1">${formatPrice(item.price)}</p>
                    </div>
                    
                    <div class="flex items-center">
                        <input type="number" value="${item.quantity}" min="1" max="10" 
                            onchange="updateCartItemQuantity('${item.id}', this.value)"
                            class="w-16 p-2 border border-gray-300 rounded text-center dark-mode:bg-gray-800">
                    </div>

                    <div class="text-right w-24 flex-shrink-0">
                        <p class="font-bold">${formatPrice(item.price * item.quantity)}</p>
                        <button class="text-sm text-red-500 hover:underline mt-1" onclick="removeCartItem('${item.id}')">Remove</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Update Summary panel
    document.getElementById('summary-items').textContent = itemCount;
    document.getElementById('summary-subtotal').textContent = formatPrice(subtotal);
    document.getElementById('summary-tax').textContent = formatPrice(tax);
    document.getElementById('summary-total').textContent = formatPrice(total);
}

function applyCoupon() {
    const couponInput = document.getElementById('coupon-input');
    const couponCode = couponInput ? couponInput.value.toUpperCase() : '';
    
    if (couponCode === 'LUXE20') {
        showToast('Coupon "LUXE20" applied! (Mock: 20% off total)');
        // In a real app, update total calculation here
    } else {
        showToast('Invalid or expired coupon code.');
    }
    couponInput.value = '';
}


// --- Checkout Logic ---
let currentCheckoutStep = 1;
let shippingCost = 0; // Default to free standard shipping

function setCheckoutStep(step) {
    if (cart.length === 0 && step > 1) {
        showToast("Your cart is empty. Cannot proceed to checkout.");
        navigateTo('cart', null, false);
        return;
    }
    
    currentCheckoutStep = step;
    const steps = [1, 2, 3];
    
    steps.forEach(s => {
        const stepPanel = document.getElementById(`checkout-step-${s}`);
        const stepIcon = document.getElementById(`step-icon-${s}`);
        
        if (stepPanel) stepPanel.style.display = s === step ? 'block' : 'none';
        
        if (stepIcon) {
            stepIcon.classList.toggle('bg-black', s === step);
            stepIcon.classList.toggle('text-white', s === step);
            stepIcon.classList.toggle('bg-gray-300', s !== step);
            stepIcon.classList.toggle('text-gray-700', s !== step);
        }
    });
    
    if (step === 3) {
        updateCheckoutSummary();
    }
}

function updateShippingCost(method) {
    shippingCost = method === 'express' ? 15.00 : 0.00;
    if (currentCheckoutStep === 3) {
        updateCheckoutSummary();
    }
}

function updateCheckoutSummary() {
    const { subtotal, tax, total } = calculateCartTotals();
    const finalTotal = total + shippingCost;
    
    const summaryHtml = `
        <div class="flex justify-between"><span>Subtotal:</span><span>${formatPrice(subtotal)}</span></div>
        <div class="flex justify-between"><span>Shipping:</span><span>${shippingCost > 0 ? formatPrice(shippingCost) : 'Free'}</span></div>
        <div class="flex justify-between"><span>Tax:</span><span>${formatPrice(tax)}</span></div>
        <div class="flex justify-between text-xl font-bold border-t pt-2 mt-2"><span>Total:</span><span>${formatPrice(finalTotal)}</span></div>
    `;
    document.getElementById('checkout-totals-summary').innerHTML = summaryHtml;
}

function placeOrder() {
    if (!document.getElementById('terms-agree').checked) {
        showToast('You must agree to the terms and conditions to place the order.');
        return;
    }
    
    if (cart.length === 0) {
        showToast('Cannot place an empty order.');
        navigateTo('cart', null, false);
        return;
    }
    
    const { total } = calculateCartTotals();
    const finalTotal = total + shippingCost;
    
    // 1. Create Order Object (Mock)
    const newOrder = {
        id: orderHistory.length + 1,
        date: new Date().toLocaleDateString(),
        items: cart,
        total: finalTotal,
        status: 'Processing',
        shippingAddress: document.getElementById('shipping-address-1').value || 'N/A',
        paymentMethod: 'Credit Card (Mock)'
    };
    
    // 2. Update History & Clear Cart
    orderHistory.push(newOrder);
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    cart = [];
    saveCart();
    
    // 3. Provide Feedback
    showToast(`Order #${newOrder.id} placed successfully! Total: ${formatPrice(finalTotal)}`);
    
    // 4. Redirect (Mocking a confirmation page)
    navigateTo('account', null, true);
    if (loggedInUser) showOrderHistory(); // Show the new order immediately
}

// ==========================================================
// 8. WISHLIST PAGE RENDERING
// ==========================================================

function renderWishlistDisplay() {
    const container = document.getElementById('wishlist-items-container');
    const emptyMessage = document.getElementById('empty-wishlist-message');

    if (!container) return;

    if (wishlist.length === 0) {
        container.innerHTML = '';
        if (emptyMessage) emptyMessage.style.display = 'block';
        return;
    }
    
    if (emptyMessage) emptyMessage.style.display = 'none';

    const itemsHtml = wishlist.map(wishlistItem => {
        const product = products.find(p => p.id === wishlistItem.id);
        if (!product) return ''; // Skip if product data is missing

        const imageEmoji = product.category === "Women" ? '👚' : product.category === "Men" ? '👔' : '💍';
        
        return `
            <div class="flex flex-col md:flex-row items-center gap-6 p-4 border border-gray-200 dark-mode:border-gray-700 bg-white dark-mode:bg-gray-700 shadow-sm">
                
                <div class="w-16 h-16 flex items-center justify-center bg-gray-100 dark-mode:bg-gray-600 flex-shrink-0 cursor-pointer" onclick="navigateTo('product', ${product.id}, true)">
                    <span class="text-3xl">${imageEmoji}</span>
                </div>
                
                <div class="flex-1 min-w-0 text-center md:text-left">
                    <h3 class="text-xl font-semibold truncate cursor-pointer hover:underline" onclick="navigateTo('product', ${product.id}, true)">
                        ${product.name}
                    </h3>
                    <p class="text-lg font-bold mt-1">${formatPrice(product.price)}</p>
                    <p class="text-sm text-gray-500 dark-mode:text-gray-400">Category: ${product.category}</p>
                </div>
                
                <div class="flex flex-col space-y-2 w-full md:w-48 flex-shrink-0">
                    <button 
                        class="btn-primary py-2 text-sm" 
                        onclick="moveToCart(${product.id})"
                    >
                        Move to Cart
                    </button>
                    <button 
                        class="text-red-600 hover:text-red-800 dark-mode:text-red-400 text-sm" 
                        onclick="removeFromWishlist(${product.id})"
                    >
                        Remove ✕
                    </button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = itemsHtml;
}


// ==========================================================
// 9. ACCOUNT & LOGIN LOGIC (Mock)
// ==========================================================

function mockLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if ((email === 'user@test.com' && password === 'password') || (email === 'admin@luxe.com' && password === '12345')) {
        loggedInUser = { email: email, name: email.split('@')[0], isAdmin: email.includes('admin') };
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
        updateAccountView();
        showToast(`Welcome, ${loggedInUser.name}!`);
    } else {
        showToast('Invalid credentials. Try user@test.com / password');
    }
}

function mockLogout() {
    loggedInUser = null;
    localStorage.removeItem('loggedInUser');
    updateAccountView();
    showToast('Logged out successfully.');
}

function updateAccountView() {
    const loginPanel = document.getElementById('account-login-panel');
    const dashboardPanel = document.getElementById('account-dashboard-panel');
    
    if (loggedInUser) {
        loginPanel.style.display = 'none';
        dashboardPanel.style.display = 'block';
        
        document.getElementById('account-user-name').textContent = loggedInUser.name;
        document.getElementById('account-user-email').textContent = loggedInUser.email;
        updateAccountWishlistCount();
        showOrderHistory(false); // Hide table by default on view
    } else {
        loginPanel.style.display = 'block';
        dashboardPanel.style.display = 'none';
    }
}

function updateAccountWishlistCount() {
    document.getElementById('wishlist-count-account').textContent = wishlist.length;
}

function showOrderHistory(toggle = true) {
    const historySection = document.getElementById('order-history-section');
    const historyBody = document.getElementById('order-history-body');

    if (toggle) {
        historySection.style.display = historySection.style.display === 'none' ? 'block' : 'none';
    } else if (historySection.style.display === 'none') {
        // If we are just refreshing the view and it's hidden, don't proceed
        return;
    }

    const userOrders = orderHistory.filter(order => order.id > 0); // Mock all orders for simplicity
    document.getElementById('total-orders').textContent = userOrders.length;
    
    if (userOrders.length === 0) {
        historyBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-gray-500">No orders found.</td></tr>`;
        return;
    }
    
    historyBody.innerHTML = userOrders.map(order => `
        <tr class="hover:bg-gray-50 dark-mode:hover:bg-gray-800">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">#${order.id.toString().padStart(4, '0')}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">${order.date}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold">${formatPrice(order.total)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
                    ${order.status}
                </span>
            </td>
        </tr>
    `).join('');
}
