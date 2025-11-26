// ==========================================================
// MOCK DATA & PERSISTENCE
// ==========================================================

let PRODUCTS = [
    {
        id: '101',
        name: 'Essential Cotton T-Shirt',
        description: 'A classic, comfortable cotton tee. A staple for every wardrobe. Available in multiple colors.',
        price: 49.99,
        category: 'Men',
        rating: 4.5,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Blue'],
        sku: 'LUX-TS-001',
        isFeatured: true,
        image: 'ts-black.jpg' // Mock image file
    },
    {
        id: '102',
        name: 'The Luxe Silk Scarf',
        description: 'Luxuriously soft silk scarf, perfect for adding an elegant touch. One size fits all.',
        price: 189.00,
        category: 'Accessories',
        rating: 5.0,
        sizes: ['OS'],
        colors: ['Red', 'Blue', 'Black'],
        sku: 'LUX-SC-002',
        isFeatured: true,
        image: 'scarf-red.jpg'
    },
    {
        id: '103',
        name: 'Modern Tailored Blazer',
        description: 'A sharp, modern fit blazer made from premium wool blend.',
        price: 350.00,
        category: 'Women',
        rating: 4.2,
        sizes: ['S', 'M', 'L'],
        colors: ['Gray', 'Black'],
        sku: 'LUX-BZ-003',
        isFeatured: true,
        image: 'blazer-grey.jpg'
    },
    {
        id: '104',
        name: 'Minimalist Leather Wallet',
        description: 'Slim profile wallet crafted from genuine Italian leather.',
        price: 95.00,
        category: 'Accessories',
        rating: 4.7,
        sizes: ['OS'],
        colors: ['Black'],
        sku: 'LUX-WL-004',
        isFeatured: false,
        image: 'wallet-black.jpg'
    },
    {
        id: '105',
        name: 'Oversize Knit Sweater',
        description: 'Warm and cozy oversized sweater, perfect for the colder months.',
        price: 120.00,
        category: 'Women',
        rating: 4.6,
        sizes: ['S', 'M', 'L'],
        colors: ['White', 'Red'],
        sku: 'LUX-SW-005',
        isFeatured: false,
        image: 'sweater-white.jpg'
    },
    {
        id: '106',
        name: 'Classic Denim Jeans',
        description: 'Durable, straight-fit denim jeans with minimal distressing.',
        price: 85.00,
        category: 'Men',
        rating: 4.3,
        sizes: ['M', 'L', 'XL'],
        colors: ['Blue'],
        sku: 'LUX-JN-006',
        isFeatured: false,
        image: 'jeans-blue.jpg'
    }
];

let cart = JSON.parse(localStorage.getItem('luxeCart')) || [];
let wishlist = JSON.parse(localStorage.getItem('luxeWishlist')) || [];
let user = JSON.parse(localStorage.getItem('luxeUser')) || null;
let currency = localStorage.getItem('luxeCurrency') || 'USD';
let currentFilters = JSON.parse(sessionStorage.getItem('luxeFilters')) || {
    category: [],
    price: [],
    size: [],
    color: [],
    rating: [],
    sort: 'newest',
    search: '', // New search term field
    currentPage: 1,
    productsPerPage: 6
};


// ==========================================================
// HELPER FUNCTIONS & CURRENCY
// ==========================================================

// Map of exchange rates (USD is base)
const EXCHANGE_RATES = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79
};

/**
 * Converts price to the selected currency and formats it.
 * @param {number} price - The price in USD.
 * @returns {string} - Formatted price string.
 */
function formatPrice(price) {
    const rate = EXCHANGE_RATES[currency];
    const convertedPrice = price * rate;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(convertedPrice);
}

/**
 * Changes the global currency and re-renders pages.
 * @param {string} newCurrency - The new currency code (USD, EUR, GBP).
 */
function changeCurrency(newCurrency) {
    currency = newCurrency;
    localStorage.setItem('luxeCurrency', newCurrency);
    // Update currency selector value
    document.getElementById('currency-select').value = newCurrency;
    
    // Re-render visible pages to update all prices
    const activePage = document.querySelector('.page.active');
    if (activePage) {
        if (activePage.id === 'page-shop') {
            renderProducts();
        } else if (activePage.id === 'page-home') {
             renderFeaturedProducts();
        } else if (activePage.id === 'page-cart') {
             renderCart();
        }
        // No need to re-render the single product view on currency change, 
        // as the price is calculated dynamically in renderProductDetail.
    }
}

/**
 * Renders star icons based on a rating value.
 * @param {number} rating - The numeric rating (e.g., 4.5).
 * @returns {string} - HTML string of star icons.
 */
function renderStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '⭐️'; // Full star
        } else if (i === fullStars && hasHalfStar) {
            stars += '🌟'; // Half star mock (using sparkling star emoji for simplicity)
        } else {
            stars += '✩'; // Empty star (using open star emoji)
        }
    }
    return `<span class="text-sm">${stars}</span>`;
}

// ==========================================================
// NAVIGATION & PAGE MANAGEMENT
// ==========================================================

let pageHistory = ['home'];

/**
 * Handles all internal page transitions with animation.
 * @param {string} pageId - The ID of the page section to navigate to (e.g., 'home', 'shop').
 * @param {string|null} productId - Optional product ID for the product page.
 * @param {boolean} recordHistory - Whether to record this navigation for back/forward.
 */
function navigateTo(pageId, productId = null, recordHistory = true) {
    const currentPageId = pageHistory[pageHistory.length - 1];
    const currentPageIndex = ['home', 'shop', 'product', 'cart', 'checkout', 'wishlist', 'about', 'account'].indexOf(currentPageId);
    const newPageIndex = ['home', 'shop', 'product', 'cart', 'checkout', 'wishlist', 'about', 'account'].indexOf(pageId);

    // Determine the direction of the slide animation
    let direction = '';
    if (recordHistory) {
        direction = (newPageIndex > currentPageIndex) ? 'slide-in-ltr' : 'slide-in-rtl';
    } else {
        // If navigating directly or forcing a specific direction (e.g., product detail)
        direction = 'slide-in-ltr'; 
    }

    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        // Prepare current active page for exit
        if (page.id === `page-${currentPageId}`) {
            page.classList.remove('active', 'slide-in-ltr', 'slide-in-rtl');
            // Timeout is a common trick to ensure the slide-out visually starts
            setTimeout(() => {
                page.style.display = 'none';
            }, 50); 
        }
    });

    // Handle history recording
    if (recordHistory) {
        if (pageId !== currentPageId) {
            pageHistory.push(pageId);
        }
    }
    
    // Set up new page
    const newPage = document.getElementById(`page-${pageId}`);
    if (newPage) {
        newPage.style.display = 'block';
        // Force reflow/repaint
        void newPage.offsetWidth; 
        newPage.classList.add('active', direction);
    }
    
    // Run content render functions based on page ID
    switch (pageId) {
        case 'home':
            renderFeaturedProducts();
            break;
        case 'shop':
            renderProducts();
            break;
        case 'product':
            if (productId) renderProductDetail(productId);
            break;
        case 'cart':
            renderCart();
            break;
        case 'checkout':
            initCheckout();
            break;
        case 'wishlist':
            renderWishlist();
            break;
        case 'account':
            checkUserStatus();
            break;
    }
    
    // Scroll to top of the page after transition
    window.scrollTo(0, 0);
    
    // Close mobile menu if open
    toggleMobileMenu(false);
}

window.addEventListener('popstate', () => {
    // Basic back button handling. Re-use the navigateTo logic.
    if (pageHistory.length > 1) {
        pageHistory.pop(); // Remove current page
        const prevPageId = pageHistory[pageHistory.length - 1];
        // Navigate to the previous page without recording history, and force RTL for visual effect
        navigateTo(prevPageId, null, false); 
    }
});


// Initial page load:
document.addEventListener('DOMContentLoaded', () => {
    // Set initial currency
    changeCurrency(currency); 
    // Start countdown for the home page banner
    startCountdown();
    // Initialize cart count
    updateCartCount();
    // Load the home page
    navigateTo('home', null, true);
    // Initialize user status check
    checkUserStatus();
});


// ==========================================================
// MOBILE & UI TOGGLES
// ==========================================================

function toggleMobileMenu(force) {
    const menu = document.getElementById('mobile-menu');
    const isActive = menu.classList.contains('active');
    
    if (force === true || (!isActive && force !== false)) {
        menu.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        menu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

document.getElementById('mobile-menu-button').addEventListener('click', () => toggleMobileMenu(true));
document.getElementById('mobile-menu-close').addEventListener('click', () => toggleMobileMenu(false));


function toggleMobileFilters() {
    const sidebar = document.getElementById('shop-filters-sidebar');
    sidebar.classList.toggle('active');
    // Lock body scroll when sidebar is open on mobile
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('luxeDarkMode', isDarkMode ? 'enabled' : 'disabled');
}

// Apply dark mode on load
if (localStorage.getItem('luxeDarkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
}

function openDocumentation() {
    document.getElementById('docs-modal').style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
}

function closeDocumentation() {
    document.getElementById('docs-modal').style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none';
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.className = `fixed bottom-4 left-1/2 -translate-x-1/2 p-3 rounded shadow-lg text-white transition-opacity duration-300 z-50`;
    
    if (type === 'success') {
        toast.classList.add('bg-green-600');
    } else if (type === 'error') {
        toast.classList.add('bg-red-600');
    } else {
        toast.classList.add('bg-gray-800');
    }
    
    toast.style.opacity = '1';

    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}


// ==========================================================
// HOME PAGE LOGIC (COUNTDOWN & FEATURED)
// ==========================================================

function startCountdown() {
    // Mock target date: 7 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    targetDate.setHours(10, 0, 0, 0); // 10:00 AM 7 days from now

    const countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById('promo-heading').textContent = 'Sale Ended!';
            document.querySelector('.countdown').innerHTML = '';
        } else {
            document.getElementById('countdown-days').textContent = String(days).padStart(2, '0');
            document.getElementById('countdown-hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('countdown-minutes').textContent = String(minutes).padStart(2, '0');
            document.getElementById('countdown-seconds').textContent = String(seconds).padStart(2, '0');
        }
    }, 1000);
}

function renderFeaturedProducts() {
    const container = document.getElementById('featured-products');
    container.innerHTML = '';
    
    const featured = PRODUCTS.filter(p => p.isFeatured).slice(0, 4);

    featured.forEach(product => {
        const productHtml = `
            <div class="product-card p-4 border bg-white dark-mode:bg-gray-800" onclick="navigateTo('product', '${product.id}', true)">
                <div class="product-image mb-4">
                     <span class="text-6xl">✨</span>
                </div>
                <h3 class="font-bold text-lg">${product.name}</h3>
                <p class="text-gray-600 dark-mode:text-gray-400">${product.category}</p>
                <p class="font-semibold mt-1">${formatPrice(product.price)}</p>
                <div class="mt-2">${renderStars(product.rating)}</div>
            </div>
        `;
        container.innerHTML += productHtml;
    });
}

// ==========================================================
// SHOP & FILTER LOGIC
// ==========================================================

/**
 * Filter and render products to the shop page grid.
 */
function renderProducts() {
    const container = document.getElementById('products-grid');
    container.innerHTML = '';
    
    let filteredProducts = PRODUCTS.filter(product => {
        // 1. Category Filter
        const categoryMatch = currentFilters.category.length === 0 || 
                              currentFilters.category.includes(product.category);

        // 2. Price Filter
        const priceMatch = currentFilters.price.length === 0 || 
                           currentFilters.price.some(range => {
                               const [min, max] = range.split('-').map(Number);
                               return product.price >= min && product.price <= max;
                           });
        
        // 3. Size Filter
        const sizeMatch = currentFilters.size.length === 0 || 
                          currentFilters.size.some(size => product.sizes.includes(size));

        // 4. Color Filter
        const colorMatch = currentFilters.color.length === 0 ||
                           currentFilters.color.some(color => product.colors.includes(color));

        // 5. Rating Filter
        const ratingMatch = currentFilters.rating.length === 0 ||
                            currentFilters.rating.some(minRating => product.rating >= Number(minRating));
                            
        // 6. Search Filter (NEW)
        const searchTerm = currentFilters.search.toLowerCase();
        const searchMatch = searchTerm === '' ||
                            product.name.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm);


        return categoryMatch && priceMatch && sizeMatch && colorMatch && ratingMatch && searchMatch;
    });
    
    // Sort Products
    switch (currentFilters.sort) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
        default:
            // Assuming the PRODUCTS array is ordered by ID/creation date
            break; 
    }
    
    // Pagination
    const totalProducts = filteredProducts.length;
    const { currentPage, productsPerPage } = currentFilters;
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Update pagination info
    document.getElementById('product-count').textContent = totalProducts;
    document.getElementById('pagination-info').textContent = `Page ${totalPages > 0 ? currentPage : 0} of ${totalPages}`;

    
    if (paginatedProducts.length === 0) {
        container.innerHTML = `<p class="lg:col-span-3 text-center py-10 text-xl text-gray-500">
                                   No products match your current filters. Try adjusting your selections.
                               </p>`;
        return;
    }
    
    // Render Products
    paginatedProducts.forEach(product => {
        const isWishlisted = wishlist.some(item => item.id === product.id);
        const wishlistIcon = isWishlisted ? '❤️' : '🤍';
        
        const productHtml = `
            <div class="product-card group relative p-4 border bg-white dark-mode:bg-gray-800" data-product-id="${product.id}">
                <div class="product-image mb-4">
                     <span class="text-6xl">🖼️</span>
                </div>
                <div class="absolute top-6 right-6 z-10">
                     <button class="text-2xl hover:text-red-600 transition" onclick="event.stopPropagation(); toggleWishlist('${product.id}')" aria-label="Toggle Wishlist">
                         <span id="wishlist-icon-${product.id}" class="text-2xl">${wishlistIcon}</span>
                     </button>
                </div>
                <div onclick="navigateTo('product', '${product.id}', true)">
                    <h3 class="font-bold text-lg hover:underline">${product.name}</h3>
                    <p class="text-gray-600 dark-mode:text-gray-400 text-sm">${product.category}</p>
                    <p class="font-semibold mt-1 text-xl">${formatPrice(product.price)}</p>
                    <div class="mt-2">${renderStars(product.rating)}</div>
                </div>
                <button class="btn-primary w-full mt-4 opacity-80 group-hover:opacity-100 transition" onclick="event.stopPropagation(); addToCart('${product.id}')">
                    Quick Add
                </button>
            </div>
        `;
        container.innerHTML += productHtml;
    });
}

/**
 * Updates filters from UI and re-renders products.
 */
function applyFilters() {
    // Collect all checked filters
    currentFilters.category = Array.from(document.querySelectorAll('input[data-filter="category"]:checked')).map(el => el.value);
    currentFilters.price = Array.from(document.querySelectorAll('input[data-filter="price"]:checked')).map(el => el.value);
    currentFilters.size = Array.from(document.querySelectorAll('input[data-filter="size"]:checked')).map(el => el.value);
    currentFilters.color = Array.from(document.querySelectorAll('input[data-filter="color"]:checked')).map(el => el.value);
    currentFilters.rating = Array.from(document.querySelectorAll('input[data-filter="rating"]:checked')).map(el => el.value);
    
    currentFilters.currentPage = 1; // Reset page on filter change
    sessionStorage.setItem('luxeFilters', JSON.stringify(currentFilters));
    renderProducts();
}

/**
 * Updates the search filter and re-renders products. (NEW FUNCTION)
 */
function applySearchFilter() {
    const searchInput = document.getElementById('search-input');
    currentFilters.search = searchInput ? searchInput.value : '';
    currentFilters.currentPage = 1; // Reset page on search change
    sessionStorage.setItem('luxeFilters', JSON.stringify(currentFilters));
    renderProducts();
}


/**
 * Clears all filters and re-renders products.
 */
function clearFilters() {
    // Uncheck all checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
    
    // Reset sort to default
    document.getElementById('sort-select').value = 'newest';
    
    // Clear search input (NEW)
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    // Reset current filters object
    currentFilters = {
        category: [],
        price: [],
        size: [],
        color: [],
        rating: [],
        sort: 'newest',
        search: '', // Reset search
        currentPage: 1,
        productsPerPage: 6
    };
    sessionStorage.setItem('luxeFilters', JSON.stringify(currentFilters));
    renderProducts();
}

/**
 * Changes the sort order and re-renders products.
 */
function sortProducts() {
    currentFilters.sort = document.getElementById('sort-select').value;
    currentFilters.currentPage = 1; // Reset page on sort change
    sessionStorage.setItem('luxeFilters', JSON.stringify(currentFilters));
    renderProducts();
}

/**
 * Navigates between pages in the shop view.
 * @param {number} direction - 1 for next page, -1 for previous page.
 */
function changePage(direction) {
    const totalProducts = PRODUCTS.length; // Simplified total count for demo
    const totalPages = Math.ceil(totalProducts / currentFilters.productsPerPage);
    let newPage = currentFilters.currentPage + direction;

    if (newPage >= 1 && newPage <= totalPages) {
        currentFilters.currentPage = newPage;
        sessionStorage.setItem('luxeFilters', JSON.stringify(currentFilters));
        renderProducts();
        window.scrollTo(0, 0); // Scroll to top of the grid
    }
}


// ==========================================================
// SINGLE PRODUCT DETAIL LOGIC
// ==========================================================

function renderProductDetail(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
        navigateTo('shop'); // Go back if product not found
        showToast('Product not found.', 'error');
        return;
    }
    
    // Update data attributes to store current product info for quick access
    const detailButton = document.getElementById('detail-add-to-cart');
    detailButton.setAttribute('data-product-id', product.id);
    detailButton.setAttribute('data-selected-size', product.sizes[0] || 'OS'); 
    detailButton.setAttribute('data-selected-color', product.colors[0] || 'Default');

    // Update text content
    document.getElementById('product-breadcrumb').textContent = product.name;
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('product-price').textContent = formatPrice(product.price);
    document.getElementById('product-sku').textContent = `SKU: ${product.sku}`;
    document.getElementById('product-description').textContent = product.description;

    // Mock image display (just a large icon for this mockup)
    document.getElementById('main-product-image').innerHTML = `<span class="text-8xl">🖼️</span>`;

    // Size options
    const sizeOptionsContainer = document.getElementById('variant-size-options');
    sizeOptionsContainer.innerHTML = '';
    product.sizes.forEach(size => {
        const button = document.createElement('button');
        button.className = `size-option border px-4 py-2 hover:bg-gray-100 dark-mode:hover:bg-gray-600 transition ${size === product.sizes[0] ? 'bg-black text-white dark-mode:bg-white dark-mode:text-black' : ''}`;
        button.textContent = size;
        button.setAttribute('data-size', size);
        button.onclick = () => selectVariant('size', size, product.id);
        sizeOptionsContainer.appendChild(button);
    });

    // Color options
    const colorOptionsContainer = document.getElementById('variant-color-options');
    colorOptionsContainer.innerHTML = '';
    product.colors.forEach(color => {
        const div = document.createElement('div');
        const defaultClass = 'color-option w-8 h-8 rounded-full border cursor-pointer ring-offset-2 hover:ring-2 transition';
        const activeClass = color === product.colors[0] ? 'ring-2 ring-black dark-mode:ring-white' : '';
        div.className = `${defaultClass} ${activeClass} bg-${color.toLowerCase()}-600`; // Tailwind color mock
        div.style.backgroundColor = color === 'Black' ? 'black' : (color === 'White' ? 'white' : `var(--tw-color-${color.toLowerCase()}-600)`);
        div.setAttribute('data-color', color);
        div.onclick = () => selectVariant('color', color, product.id);
        colorOptionsContainer.appendChild(div);
    });
    
    // Set initial size/color and update wishlist icon
    selectVariant('size', product.sizes[0], product.id);
    selectVariant('color', product.colors[0], product.id);
    updateProductWishlistIcon(product.id);
}

function selectVariant(type, value, productId) {
    const detailButton = document.getElementById('detail-add-to-cart');

    if (type === 'size') {
        detailButton.setAttribute('data-selected-size', value);
        document.querySelectorAll('.size-option').forEach(btn => {
            btn.classList.remove('bg-black', 'text-white', 'dark-mode:bg-white', 'dark-mode:text-black');
            if (btn.getAttribute('data-size') === value) {
                btn.classList.add('bg-black', 'text-white', 'dark-mode:bg-white', 'dark-mode:text-black');
            }
        });
    } else if (type === 'color') {
        detailButton.setAttribute('data-selected-color', value);
        document.querySelectorAll('.color-option').forEach(div => {
            div.classList.remove('ring-2', 'ring-black', 'dark-mode:ring-white');
            if (div.getAttribute('data-color') === value) {
                div.classList.add('ring-2', 'ring-black', 'dark-mode:ring-white');
            }
        });
    }
}

// Attach event listener for the main Add to Cart button on the product page
document.addEventListener('DOMContentLoaded', () => {
    const detailButton = document.getElementById('detail-add-to-cart');
    if (detailButton) {
        detailButton.addEventListener('click', (event) => {
            const productId = event.currentTarget.getAttribute('data-product-id');
            const size = event.currentTarget.getAttribute('data-selected-size');
            const color = event.currentTarget.getAttribute('data-selected-color');
            const quantity = Number(document.getElementById('quantity-input').value);
            
            if (productId && size && color && quantity > 0) {
                addToCart(productId, size, color, quantity);
            } else {
                 showToast('Please select all variants and a valid quantity.', 'error');
            }
        });
    }
});


// ==========================================================
// CART LOGIC
// ==========================================================

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = count > 99 ? '99+' : count;
}

function addToCart(productId, size = 'M', color = 'Black', quantity = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    // Create a unique identifier for the variant
    const variantId = `${productId}-${size}-${color}`;
    
    // Check if the variant already exists in the cart
    const existingItem = cart.find(item => item.variantId === variantId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            variantId: variantId,
            id: productId,
            name: product.name,
            price: product.price,
            size: size,
            color: color,
            quantity: quantity,
            image: product.image
        });
    }

    localStorage.setItem('luxeCart', JSON.stringify(cart));
    updateCartCount();
    renderCart(); // Re-render cart if on cart page
    showToast(`${quantity} x ${product.name} (${color}, ${size}) added to cart!`);
}

function removeFromCart(variantId) {
    cart = cart.filter(item => item.variantId !== variantId);
    localStorage.setItem('luxeCart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
    showToast('Item removed from cart.', 'success');
}

function updateCartItemQuantity(variantId, newQuantity) {
    const item = cart.find(i => i.variantId === variantId);
    if (item) {
        item.quantity = Number(newQuantity);
        if (item.quantity <= 0) {
            removeFromCart(variantId);
            return;
        }
    }
    localStorage.setItem('luxeCart', JSON.stringify(cart));
    renderCart();
}

function calculateCartTotals() {
    const subtotalUSD = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const taxRate = 0.05; // Mock 5% tax
    const taxUSD = subtotalUSD * taxRate;
    const totalUSD = subtotalUSD + taxUSD;
    
    return {
        subtotal: subtotalUSD,
        tax: taxUSD,
        total: totalUSD
    };
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const emptyMessage = document.getElementById('empty-cart-message');
    const cartSummary = document.querySelector('.cart-summary');
    container.innerHTML = '';

    if (cart.length === 0) {
        emptyMessage.style.display = 'block';
        cartSummary.style.opacity = 0.5;
        document.getElementById('summary-subtotal').textContent = formatPrice(0);
        document.getElementById('summary-tax').textContent = formatPrice(0);
        document.getElementById('summary-total').textContent = formatPrice(0);
        document.getElementById('summary-items').textContent = 0;
        return;
    }

    emptyMessage.style.display = 'none';
    cartSummary.style.opacity = 1;

    cart.forEach(item => {
        const itemHtml = `
            <div class="flex items-center p-4 border bg-white dark-mode:bg-gray-800 shadow-sm" data-variant-id="${item.variantId}">
                <div class="cart-item-image w-20 h-20 bg-gray-100 dark-mode:bg-gray-800 flex items-center justify-center mr-4">
                     <span class="text-3xl">🖼️</span>
                </div>
                <div class="flex-1">
                    <h3 class="font-semibold text-lg">${item.name}</h3>
                    <p class="text-sm text-gray-600 dark-mode:text-gray-400">Size: ${item.size} | Color: ${item.color}</p>
                    <p class="font-bold mt-1">${formatPrice(item.price)}</p>
                </div>
                <div class="flex items-center space-x-4">
                    <input type="number" value="${item.quantity}" min="1" max="10" 
                           class="w-16 p-2 border rounded text-center dark-mode:bg-gray-800"
                           onchange="updateCartItemQuantity('${item.variantId}', this.value)">
                    <p class="font-bold w-20 text-right">${formatPrice(item.price * item.quantity)}</p>
                    <button class="text-red-500 hover:text-red-700 text-xl" onclick="removeFromCart('${item.variantId}')" aria-label="Remove Item">
                        ✕
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += itemHtml;
    });
    
    // Update summary panel
    const totals = calculateCartTotals();
    document.getElementById('summary-subtotal').textContent = formatPrice(totals.subtotal);
    document.getElementById('summary-tax').textContent = formatPrice(totals.tax);
    document.getElementById('summary-total').textContent = formatPrice(totals.total);
    document.getElementById('final-total').textContent = formatPrice(totals.total);
    document.getElementById('summary-items').textContent = cart.length;
}

function applyCoupon() {
    const couponInput = document.getElementById('coupon-input').value.toUpperCase();
    if (couponInput === 'LUXE20') {
        showToast('Coupon applied: 20% off mock discount!', 'success');
        // In a real app, you would apply the discount to totals here
    } else {
        showToast('Invalid or expired coupon code.', 'error');
    }
}


// ==========================================================
// WISHLIST LOGIC
// ==========================================================

function updateWishlistIcon() {
    const icon = document.getElementById('wishlist-icon');
    const hasItems = wishlist.length > 0;
    icon.textContent = hasItems ? '❤️' : '🤍';
}

function updateProductWishlistIcon(productId) {
    const icon = document.getElementById('product-wishlist-icon');
    const isWishlisted = wishlist.some(item => item.id === productId);
    if (icon) {
        icon.textContent = isWishlisted ? '❤️' : '🤍';
    }
    // Update the icon on the product grid as well
    const shopIcon = document.getElementById(`wishlist-icon-${productId}`);
    if (shopIcon) {
         shopIcon.textContent = isWishlisted ? '❤️' : '🤍';
    }
}

function toggleWishlist(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existingItemIndex = wishlist.findIndex(item => item.id === productId);

    if (existingItemIndex > -1) {
        wishlist.splice(existingItemIndex, 1);
        showToast(`${product.name} removed from wishlist.`, 'success');
    } else {
        wishlist.push(product);
        showToast(`${product.name} added to wishlist!`, 'success');
    }

    localStorage.setItem('luxeWishlist', JSON.stringify(wishlist));
    updateWishlistIcon();
    updateProductWishlistIcon(productId); // Update icon on detail page/grid
    renderWishlist(); // Re-render if on wishlist page
}

function renderWishlist() {
    const container = document.getElementById('wishlist-container');
    const emptyMessage = document.getElementById('empty-wishlist-message');
    container.innerHTML = '';

    if (wishlist.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    wishlist.forEach(product => {
        const productHtml = `
            <div class="product-card group relative p-4 border bg-white dark-mode:bg-gray-800">
                <div class="product-image mb-4" onclick="navigateTo('product', '${product.id}', true)">
                     <span class="text-6xl">🖼️</span>
                </div>
                <div class="absolute top-6 right-6 z-10">
                     <button class="text-2xl text-red-600 hover:text-red-800 transition" onclick="toggleWishlist('${product.id}')" aria-label="Remove from Wishlist">
                         ❤️
                     </button>
                </div>
                <div onclick="navigateTo('product', '${product.id}', true)">
                    <h3 class="font-bold text-lg hover:underline">${product.name}</h3>
                    <p class="font-semibold mt-1 text-xl">${formatPrice(product.price)}</p>
                </div>
                <button class="btn-primary w-full mt-4" onclick="addToCart('${product.id}')">
                    Add to Cart
                </button>
            </div>
        `;
        container.innerHTML += productHtml;
    });
}


// ==========================================================
// ACCOUNT LOGIC
// ==========================================================

const MOCK_USERS = {
    'user@test.com': { name: 'Test User', pass: 'password', isAdmin: false },
    'admin@luxe.com': { name: 'Site Admin', pass: '12345', isAdmin: true }
};

function checkUserStatus() {
    const loginPanel = document.getElementById('account-login');
    const dashboardPanel = document.getElementById('account-dashboard');
    const adminLink = document.getElementById('admin-link');
    
    if (user) {
        loginPanel.style.display = 'none';
        dashboardPanel.style.display = 'block';
        document.getElementById('user-display-name').textContent = user.name;
        
        if (user.isAdmin) {
            adminLink.style.display = 'inline-block';
        } else {
            adminLink.style.display = 'none';
        }
        renderOrderHistory();
    } else {
        loginPanel.style.display = 'block';
        dashboardPanel.style.display = 'none';
    }
}

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const mockUser = MOCK_USERS[email];
    
    if (mockUser && mockUser.pass === password) {
        user = { email: email, name: mockUser.name, isAdmin: mockUser.isAdmin };
        localStorage.setItem('luxeUser', JSON.stringify(user));
        showToast(`Welcome, ${user.name}!`, 'success');
        checkUserStatus();
    } else {
        showToast('Invalid email or password.', 'error');
    }
});

function logoutUser() {
    user = null;
    localStorage.removeItem('luxeUser');
    showToast('You have been logged out.', 'success');
    checkUserStatus();
}

function renderOrderHistory() {
    const container = document.getElementById('order-history-container');
    const mockOrders = JSON.parse(localStorage.getItem('luxeOrders')) || [];
    container.innerHTML = '';
    
    if (mockOrders.length === 0) {
        container.innerHTML = `<p class="text-gray-600 dark-mode:text-gray-400">No orders placed yet.</p>`;
        return;
    }
    
    mockOrders.reverse().forEach(order => {
        const orderTotal = formatPrice(order.total);
        const orderDate = new Date(order.date).toLocaleDateString();
        
        const orderHtml = `
            <div class="border p-4 bg-gray-50 dark-mode:bg-gray-800">
                <p class="font-bold">Order #${order.id} <span class="text-sm font-normal text-gray-500">(${order.status})</span></p>
                <p class="text-sm">Placed on: ${orderDate}</p>
                <p class="font-bold text-lg mt-1">Total: ${orderTotal}</p>
            </div>
        `;
        container.innerHTML += orderHtml;
    });
}


// ==========================================================
// CHECKOUT LOGIC
// ==========================================================

let currentCheckoutStep = 1;

function initCheckout() {
    // Check if cart is empty before starting checkout
    if (cart.length === 0) {
        navigateTo('cart', null, true);
        showToast('Your cart is empty. Please add items to checkout.', 'error');
        return;
    }
    // Always start at step 1 and update totals
    currentCheckoutStep = 1; 
    updateCheckoutStepUI();
    renderCart(); // Update summary totals
}

function updateCheckoutStepUI() {
    // Hide all steps
    document.querySelectorAll('.checkout-panel').forEach(panel => panel.classList.add('hidden'));
    
    // Reset all step icons
    document.querySelectorAll('[id^="step-icon-"]').forEach(icon => {
        icon.classList.remove('bg-black', 'text-white');
        icon.classList.add('bg-gray-300', 'text-gray-700', 'dark-mode:bg-gray-600', 'dark-mode:text-gray-300');
        icon.nextElementSibling.classList.remove('font-semibold', 'dark-mode:text-white');
        icon.nextElementSibling.classList.add('text-gray-500', 'dark-mode:text-gray-400');
    });

    // Show current step
    document.getElementById(`checkout-step-${currentCheckoutStep}`).classList.remove('hidden');
    
    // Highlight current step icon
    const currentIcon = document.getElementById(`step-icon-${currentCheckoutStep}`);
    if (currentIcon) {
        currentIcon.classList.add('bg-black', 'text-white');
        currentIcon.classList.remove('bg-gray-300', 'text-gray-700', 'dark-mode:bg-gray-600', 'dark-mode:text-gray-300');
        currentIcon.nextElementSibling.classList.add('font-semibold', 'dark-mode:text-white');
        currentIcon.nextElementSibling.classList.remove('text-gray-500', 'dark-mode:text-gray-400');
    }
}

function nextCheckoutStep() {
    if (currentCheckoutStep === 1) {
        // Mock validation for shipping details
        const form = document.getElementById('shipping-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
    }
    
    if (currentCheckoutStep < 3) {
        currentCheckoutStep++;
        updateCheckoutStepUI();
    }
}

function prevCheckoutStep() {
    if (currentCheckoutStep > 1) {
        currentCheckoutStep--;
        updateCheckoutStepUI();
    }
}

function placeOrder() {
    // Mock final validation
    const paymentForm = document.getElementById('payment-form');
    if (!paymentForm.checkValidity()) {
        paymentForm.reportValidity();
        return;
    }
    
    const totals = calculateCartTotals();
    const orderId = Date.now().toString().slice(-6); // Mock ID

    const newOrder = {
        id: orderId,
        date: new Date().toISOString(),
        items: cart,
        total: totals.total,
        status: 'Processing',
        shippingMethod: document.querySelector('input[name="shipping-method"]:checked')?.value || 'standard'
    };

    // Save order
    let orders = JSON.parse(localStorage.getItem('luxeOrders')) || [];
    orders.push(newOrder);
    localStorage.setItem('luxeOrders', JSON.stringify(orders));

    // Clear cart and storage
    cart = [];
    localStorage.removeItem('luxeCart');
    updateCartCount();

    // Show confirmation and navigate to account
    showToast(`Order #${orderId} placed successfully!`, 'success');
    
    // Navigate to account and force dashboard view
    if (user) {
        navigateTo('account', null, true);
        checkUserStatus(); // Refresh dashboard
    } else {
        // If user wasn't logged in, send them back to home/login
        navigateTo('home', null, true);
    }
}
