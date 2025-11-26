// ==========================================================
// LUXE E-COMMERCE MOCKUP DATA
// ==========================================================

// Mock data structure
let products = [
    { id: '101', name: 'Signature Silk Scarf', price: 150.00, oldPrice: 200.00, category: 'Accessories', rating: 5, featured: true, description: "Luxurious, hand-finished silk scarf in a custom geometric print. Perfect for adding a touch of elegance.", availableSizes: ['OS'], availableColors: ['Blue', 'Gray', 'White'] },
    { id: '102', name: 'Classic Tailored Blazer', price: 399.00, category: 'Women', rating: 4.5, featured: true, description: "A sharply tailored blazer crafted from Italian wool blend. Features a single-button closure.", availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Black', 'Gray'] },
    { id: '103', name: 'Everyday Organic Tee', price: 55.00, category: 'Men', rating: 4, featured: true, description: "Soft, organic cotton crew neck tee. A wardrobe essential.", availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['White', 'Black'] },
    { id: '104', name: 'Leather Crossbody Bag', price: 280.00, category: 'Accessories', rating: 5, featured: true, description: "Minimalist vegetable-tanned leather bag with adjustable strap.", availableSizes: ['OS'], availableColors: ['Black', 'Red'] },
    
    { id: '105', name: 'High-Waisted Trousers', price: 185.00, category: 'Women', rating: 4.8, featured: false, description: "Elegant trousers with a wide-leg cut and pleat detailing.", availableSizes: ['S', 'M', 'L'], availableColors: ['Gray', 'Black'] },
    { id: '106', name: 'Cashmere V-Neck Sweater', price: 450.00, category: 'Men', rating: 4.2, featured: false, description: "Ultra-soft 100% cashmere sweater for ultimate warmth and luxury.", availableSizes: ['M', 'L', 'XL'], availableColors: ['Blue', 'Gray'] },
    { id: '107', name: 'Silver Hoop Earrings', price: 80.00, category: 'Accessories', rating: 5, featured: false, description: "Classic small sterling silver hoop earrings. Hypoallergenic.", availableSizes: ['OS'], availableColors: ['White'] },
    { id: '108', name: 'Slim Fit Denim', price: 120.00, category: 'Men', rating: 4.1, featured: false, description: "Premium dark wash denim jeans with a modern slim fit.", availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Blue'] },
    { id: '109', name: 'Minimalist White Sneakers', price: 175.00, category: 'Men', rating: 4.7, featured: false, description: "Italian leather sneakers with a clean, timeless design.", availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['White'] },
    { id: '110', name: 'A-Line Midi Dress', price: 230.00, category: 'Women', rating: 4.6, featured: false, description: "Flowing midi dress in a structured cotton blend, ideal for day or evening.", availableSizes: ['S', 'M', 'L'], availableColors: ['Red', 'Black'] },
];

let cart = JSON.parse(localStorage.getItem('luxeCart')) || [];
let wishlist = JSON.parse(localStorage.getItem('luxeWishlist')) || [];
let orders = JSON.parse(localStorage.getItem('luxeOrders')) || [];
let currentCurrency = localStorage.getItem('luxeCurrency') || 'USD';
let isAuthenticated = JSON.parse(localStorage.getItem('luxeAuth')) || false;
let currentPage = 'home';
let currentProduct = null;
let currentFilters = {
    category: [],
    price: [],
    size: [],
    color: [],
    rating: []
};
let currentSort = 'newest';
let productsPerPage = 8;
let currentPageNumber = 1;


// ==========================================================
// 1. CORE UTILITIES & DATA MANAGEMENT
// ==========================================================

function formatPrice(amount, currency = currentCurrency) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    });
    return formatter.format(amount);
}

function updateLocalStorage() {
    localStorage.setItem('luxeCart', JSON.stringify(cart));
    localStorage.setItem('luxeWishlist', JSON.stringify(wishlist));
    localStorage.setItem('luxeOrders', JSON.stringify(orders));
    localStorage.setItem('luxeCurrency', currentCurrency);
    localStorage.setItem('luxeAuth', isAuthenticated);
    updateHeaderCounters();
}

function updateHeaderCounters() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems > 99 ? '99+' : totalItems;

    const wishlistIcon = document.getElementById('wishlist-icon');
    if (wishlistIcon) {
        wishlistIcon.classList.toggle('active', wishlist.length > 0);
    }
}

function changeCurrency(newCurrency) {
    currentCurrency = newCurrency;
    updateLocalStorage();
    showNotification(`Currency changed to ${newCurrency}`);

    // Re-render affected pages
    if (currentPage === 'shop') renderProducts();
    if (currentPage === 'product' && currentProduct) renderProductDetail(currentProduct.id);
    if (currentPage === 'cart') updateCartDisplay();
    if (currentPage === 'checkout') updateCartDisplay();
}

function showNotification(message, isError = false) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;

    toast.textContent = message;
    toast.className = 'fixed bottom-5 right-5 p-4 rounded shadow-lg text-white transition-opacity duration-300 z-[5000]';
    toast.style.opacity = '1';
    
    if (isError) {
        toast.classList.add('bg-red-600');
    } else {
        toast.classList.add('bg-green-600');
    }

    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('luxeDarkMode', isDarkMode);
}

function applyInitialStyles() {
    const isDarkMode = localStorage.getItem('luxeDarkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
        currencySelect.value = currentCurrency;
    }
}

function loadInitialData() {
    updateHeaderCounters();
    renderFeaturedProducts();
    setCountdown();
    // Default navigation
    navigateTo('home');
    // Re-render based on current page if needed
    if (currentPage === 'shop') renderProducts();
}


// ==========================================================
// 2. CORE NAVIGATION & UI LOGIC (Modified for Mobile Fix)
// ==========================================================

// Global variable to track the last event type to prevent double-firing
let lastEventType = '';

/**
 * Handles toggling the mobile menu, using touchstart to prevent the 300ms delay.
 */
function toggleMobileMenu(event) {
    // 1. Prevent double-tap firing (touch + 300ms click)
    // Only applies if the event is a 'click' and a 'touchstart' just happened.
    if (event && event.type === 'click' && lastEventType === 'touchstart') {
        lastEventType = '';
        return;
    }

    // 2. Prevent default behavior on touch to ensure immediate response
    if (event && event.type === 'touchstart') {
        event.preventDefault(); 
        lastEventType = 'touchstart';
    }

    const menu = document.getElementById('mobile-menu');
    const body = document.body;

    if (menu) {
        // Only toggle the class if the function was triggered by a user action (event) 
        // OR if it was called manually from an inline script (where event might be null)
        menu.classList.toggle('active');
        // Locks the background from scrolling when menu is open
        body.classList.toggle('overflow-hidden'); 
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Initial setup
    loadInitialData();
    applyInitialStyles();
    
    // --- ATTACH MOBILE MENU LISTENERS (CRITICAL FIX AREA) ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuCloseButton = document.getElementById('mobile-menu-close'); 

    // Attach both 'click' (for desktop/fallback) and 'touchstart' (for mobile speed)
    // The event handler logic itself handles the prevention of double-firing.
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
        mobileMenuButton.addEventListener('touchstart', toggleMobileMenu); // Touch FIX
    }
    
    if (mobileMenuCloseButton) { 
        mobileMenuCloseButton.addEventListener('click', toggleMobileMenu);
        mobileMenuCloseButton.addEventListener('touchstart', toggleMobileMenu); // Touch FIX
    }
    // --- END CRITICAL FIX AREA ---
});


/**
 * Handles all navigation between pages with directional sliding transitions.
 */
function navigateTo(pageId, productId = null, directionHint = null) {
    const pages = document.querySelectorAll('.page');
    const targetPage = document.getElementById(`page-${pageId}`);
    
    // Determine the direction of the transition
    let transitionDirection = '';
    if (directionHint === true) {
        transitionDirection = 'slide-in-ltr'; // Left to Right (forward)
    } else if (directionHint === false) {
        transitionDirection = 'slide-in-rtl'; // Right to Left (backward)
    }

    // 1. Hide all pages and remove animation classes
    pages.forEach(page => {
        page.classList.remove('active', 'slide-in-ltr', 'slide-in-rtl');
        page.style.display = 'none'; 
    });
    
    // 2. Activate target page with animation
    if (targetPage) {
        targetPage.style.display = 'block'; 
        
        setTimeout(() => {
            targetPage.classList.add('active');
            if (transitionDirection) {
                targetPage.classList.add(transitionDirection);
            }
        }, 10); // Small delay ensures class change triggers animation

        // 3. Trigger page-specific rendering
        currentPage = pageId;
        currentProduct = null; 

        if (pageId === 'shop') {
            applyFilters(); 
        } else if (pageId === 'product' && productId) {
            currentProduct = products.find(p => p.id === productId);
            renderProductDetail(productId);
        } else if (pageId === 'cart') {
            updateCartDisplay(); 
        } else if (pageId === 'wishlist') {
            renderWishlistDisplay();
        } else if (pageId === 'checkout') {
            updateCartDisplay(); // Refresh cart before checkout
            setCheckoutStep(1);
        } else if (pageId === 'account') {
            updateAccountView();
        }
    }
    
    // Close mobile menu if open and unlock scrolling
    document.getElementById('mobile-menu')?.classList.remove('active');
    document.body.classList.remove('overflow-hidden');
    window.scrollTo(0, 0); 
}


// ==========================================================
// 3. HOME PAGE RENDERING (FEATURES & COUNTDOWN)
// ==========================================================

function renderFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    const featured = products.filter(p => p.featured);
    container.innerHTML = featured.map(product => {
        const isWishlisted = wishlist.some(item => item.productId === product.id);
        const priceDisplay = product.oldPrice 
            ? `<span class="text-sm line-through text-gray-400">${formatPrice(product.oldPrice)}</span> <span class="text-red-600 font-bold">${formatPrice(product.price)}</span>`
            : formatPrice(product.price);
            
        return `
            <div class="product-card bg-white dark-mode:bg-gray-700 p-4 shadow-sm" onclick="navigateTo('product', '${product.id}', true)">
                <div class="product-image">
                    <span class="text-6xl" aria-label="Product Image Mock">📦</span>
                </div>
                <div class="mt-3">
                    <h3 class="text-lg font-semibold truncate">${product.name}</h3>
                    <p class="text-gray-500 dark-mode:text-gray-300 text-sm">${product.category}</p>
                    <div class="flex items-center justify-between mt-2">
                        <p class="text-xl font-medium">${priceDisplay}</p>
                        <button class="text-lg" onclick="event.stopPropagation(); toggleWishlist('${product.id}');" aria-label="Add to Wishlist">
                            <span class="wishlist-icon ${isWishlisted ? 'active' : ''}">🤍</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function setCountdown() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3); // 3 days from now
    targetDate.setHours(targetDate.getHours() + 10);
    targetDate.setMinutes(targetDate.getMinutes() + 30);
    targetDate.setSeconds(targetDate.getSeconds() + 0);

    const countdownElements = {
        days: document.getElementById('countdown-days'),
        hours: document.getElementById('countdown-hours'),
        minutes: document.getElementById('countdown-minutes'),
        seconds: document.getElementById('countdown-seconds'),
        heading: document.getElementById('promo-heading')
    };

    if (!countdownElements.days) return;

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (distance < 0) {
            clearInterval(timer);
            countdownElements.heading.textContent = "Sale Ended!";
            countdownElements.days.textContent = "00";
            countdownElements.hours.textContent = "00";
            countdownElements.minutes.textContent = "00";
            countdownElements.seconds.textContent = "00";
            return;
        }

        countdownElements.days.textContent = String(days).padStart(2, '0');
        countdownElements.hours.textContent = String(hours).padStart(2, '0');
        countdownElements.minutes.textContent = String(minutes).padStart(2, '0');
        countdownElements.seconds.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown(); // Initial call
    const timer = setInterval(updateCountdown, 1000);
}

// ==========================================================
// 4. PRODUCT DETAIL LOGIC
// ==========================================================

function renderProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        navigateTo('home');
        return;
    }

    const isWishlisted = wishlist.some(item => item.productId === productId);

    document.getElementById('product-breadcrumb').textContent = product.name;
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('product-price').textContent = formatPrice(product.price);
    document.getElementById('product-sku').textContent = `SKU: LUX-TS-${product.id}`;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('product-wishlist-icon').textContent = isWishlisted ? '❤️' : '🤍';

    // Mock Image
    document.getElementById('main-product-image').innerHTML = `<span class="text-8xl" aria-label="Product Image Mock">📦</span>`;

    // Size options
    const sizeContainer = document.getElementById('variant-size-options');
    if (sizeContainer) {
        sizeContainer.innerHTML = product.availableSizes.map(size => `
            <button class="size-option border px-4 py-2 hover:bg-gray-100 dark-mode:hover:bg-gray-600 transition" data-size="${size}">${size}</button>
        `).join('');

        // Add event listeners to size options
        document.querySelectorAll('.size-option').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.size-option').forEach(b => b.classList.remove('bg-black', 'text-white', 'dark-mode:bg-white', 'dark-mode:text-black'));
                this.classList.add('bg-black', 'text-white', 'dark-mode:bg-white', 'dark-mode:text-black');
            });
        });

        // Auto-select first size
        if (product.availableSizes.length > 0) {
            sizeContainer.querySelector('.size-option')?.classList.add('bg-black', 'text-white', 'dark-mode:bg-white', 'dark-mode:text-black');
        }
    }

    // Color options
    const colorContainer = document.getElementById('variant-color-options');
    if (colorContainer) {
        colorContainer.innerHTML = product.availableColors.map((color, index) => {
            const bgColor = color.toLowerCase() === 'white' ? 'bg-white border' : (color.toLowerCase() === 'black' ? 'bg-black' : `bg-${color.toLowerCase()}-600`);
            const ringClass = index === 0 ? 'ring-2 ring-black dark-mode:ring-white' : '';
            return `
                <div class="color-option w-8 h-8 rounded-full border cursor-pointer ${bgColor} ring-offset-2 hover:ring-2 ${ringClass}" 
                     data-color="${color}" aria-label="Select color ${color}">
                </div>
            `;
        }).join('');

        // Add event listeners to color options
        document.querySelectorAll('.color-option').forEach(div => {
            div.addEventListener('click', function() {
                document.querySelectorAll('.color-option').forEach(d => d.classList.remove('ring-2', 'ring-black', 'dark-mode:ring-white'));
                this.classList.add('ring-2', 'ring-black', 'dark-mode:ring-white');
            });
        });
    }

    // Add to Cart Button Logic
    const addToCartBtn = document.getElementById('detail-add-to-cart');
    if (addToCartBtn) {
        // Remove old listener to prevent multiple firings
        const newBtn = addToCartBtn.cloneNode(true);
        addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn);
        
        newBtn.addEventListener('click', () => {
            const selectedSizeEl = document.querySelector('#variant-size-options .bg-black');
            const selectedColorEl = document.querySelector('#variant-color-options .ring-2');
            const quantity = parseInt(document.getElementById('quantity-input')?.value) || 1;

            if (!selectedSizeEl) {
                showNotification('Please select a size.', true);
                return;
            }
            if (!selectedColorEl) {
                showNotification('Please select a color.', true);
                return;
            }

            const size = selectedSizeEl.getAttribute('data-size');
            const color = selectedColorEl.getAttribute('data-color');
            
            addToCart(productId, size, color, quantity);
        });
    }

    // Wishlist Button Logic
    const wishlistToggleBtn = document.getElementById('detail-wishlist-toggle');
    if (wishlistToggleBtn) {
        const newBtn = wishlistToggleBtn.cloneNode(true);
        wishlistToggleBtn.parentNode.replaceChild(newBtn, wishlistToggleBtn);

        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleWishlist(productId);
            // Re-render icon on detail page
            document.getElementById('product-wishlist-icon').textContent = wishlist.some(item => item.productId === productId) ? '❤️' : '🤍';
        });
    }
}

function addToCart(productId, size, color, quantity) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const cartItem = {
        productId: productId,
        name: product.name,
        price: product.price,
        size: size,
        color: color,
        quantity: quantity,
        sku: `LUX-${productId}-${size.substring(0,1)}${color.substring(0,1)}`
    };

    const existingItemIndex = cart.findIndex(item => 
        item.productId === productId && 
        item.size === size && 
        item.color === color
    );

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push(cartItem);
    }

    updateLocalStorage();
    showNotification(`${quantity} x ${product.name} added to cart!`);
}

function toggleWishlist(productId) {
    const index = wishlist.findIndex(item => item.productId === productId);
    const product = products.find(p => p.id === productId);
    
    if (index > -1) {
        wishlist.splice(index, 1);
        showNotification(`${product.name} removed from wishlist.`, true);
    } else {
        wishlist.push({ productId: productId, added: new Date().toISOString() });
        showNotification(`${product.name} added to wishlist!`);
    }
    updateLocalStorage();
    // Re-render affected pages
    if (currentPage === 'shop') renderProducts(); 
    if (currentPage === 'home') renderFeaturedProducts();
    if (currentPage === 'wishlist') renderWishlistDisplay();
}


// ==========================================================
// 5. SHOP PAGE LOGIC (FILTERS, SORTING, PAGINATION)
// ==========================================================

function renderProducts() {
    let filteredProducts = products;
    const container = document.getElementById('products-grid');
    const productCountEl = document.getElementById('product-count');
    if (!container || !productCountEl) return;

    // --- 1. Apply Filters ---
    
    // Category Filter
    if (currentFilters.category.length > 0) {
        filteredProducts = filteredProducts.filter(p => currentFilters.category.includes(p.category));
    }
    
    // Price Filter
    if (currentFilters.price.length > 0) {
        filteredProducts = filteredProducts.filter(p => {
            return currentFilters.price.some(range => {
                const [min, max] = range.split('-').map(Number);
                return p.price >= min && p.price <= max;
            });
        });
    }

    // Size Filter
    if (currentFilters.size.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
            p.availableSizes.some(size => currentFilters.size.includes(size))
        );
    }

    // Color Filter
    if (currentFilters.color.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
            p.availableColors.some(color => currentFilters.color.includes(color))
        );
    }

    // Rating Filter
    if (currentFilters.rating.length > 0) {
        filteredProducts = filteredProducts.filter(p => {
            return currentFilters.rating.some(minRating => p.rating >= parseFloat(minRating));
        });
    }
    
    // --- 2. Apply Sorting ---
    switch (currentSort) {
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
            // Assuming products are already roughly in newest order by ID/position
            break;
    }
    
    // --- 3. Apply Pagination ---
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    currentPageNumber = Math.min(Math.max(1, currentPageNumber), totalPages || 1);
    
    const startIndex = (currentPageNumber - 1) * productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

    // --- 4. Render ---
    productCountEl.textContent = filteredProducts.length;
    document.getElementById('pagination-info').textContent = `Page ${currentPageNumber} of ${totalPages || 1}`;

    if (paginatedProducts.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500 dark-mode:text-gray-400">No products match your current filters. Try adjusting your selections.</div>';
        return;
    }
    
    container.innerHTML = paginatedProducts.map(product => {
        const isWishlisted = wishlist.some(item => item.productId === product.id);
        const priceDisplay = product.oldPrice 
            ? `<span class="text-sm line-through text-gray-400">${formatPrice(product.oldPrice)}</span> <span class="text-red-600 font-bold">${formatPrice(product.price)}</span>`
            : formatPrice(product.price);

        return `
            <div class="product-card bg-white dark-mode:bg-gray-700 p-4 shadow-sm" onclick="navigateTo('product', '${product.id}', true)">
                <div class="product-image">
                    <span class="text-6xl" aria-label="Product Image Mock">📦</span>
                </div>
                <div class="mt-3">
                    <h3 class="text-lg font-semibold truncate">${product.name}</h3>
                    <p class="text-gray-500 dark-mode:text-gray-300 text-sm">${product.category}</p>
                    <div class="flex items-center justify-between mt-2">
                        <p class="text-xl font-medium">${priceDisplay}</p>
                        <button class="text-lg" onclick="event.stopPropagation(); toggleWishlist('${product.id}');" aria-label="Add to Wishlist">
                            <span class="wishlist-icon ${isWishlisted ? 'active' : ''}">🤍</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Update pagination button states (not implemented in this mock, but where you'd hide/disable them)
}


function applyFilters() {
    // Clear current filters
    currentFilters = { category: [], price: [], size: [], color: [], rating: [] };
    
    // Collect all checked checkboxes
    document.querySelectorAll('#shop-filters-sidebar input[type="checkbox"]:checked').forEach(checkbox => {
        const filterType = checkbox.getAttribute('data-filter');
        const value = checkbox.value;
        
        if (currentFilters[filterType]) {
            currentFilters[filterType].push(value);
        }
    });

    // Reset to page 1 after applying new filters
    currentPageNumber = 1;
    renderProducts();
}

function sortProducts() {
    currentSort = document.getElementById('sort-select').value;
    // Reset to page 1 after sorting
    currentPageNumber = 1;
    renderProducts();
}

function changePage(delta) {
    const totalProducts = products.filter(p => {
        // Simple mock of filter to check page bounds based on current filters
        let passes = true;
        if (currentFilters.category.length > 0 && !currentFilters.category.includes(p.category)) passes = false;
        // More complex filter logic omitted for brevity here, but should match renderProducts
        return passes;
    }).length;

    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const newPage = currentPageNumber + delta;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPageNumber = newPage;
        renderProducts();
    } else {
        showNotification("No more pages to display.", true);
    }
}

function clearFilters() {
    currentFilters = { category: [], price: [], size: [], color: [], rating: [] };
    
    document.querySelectorAll('#shop-filters-sidebar input[type="checkbox"]:checked').forEach(checkbox => {
        checkbox.checked = false;
        // Also remove visual styles for size/color (if they were applied here)
        if (checkbox.parentNode.classList.contains('border')) {
             checkbox.parentNode.classList.remove('bg-black', 'text-white', 'dark-mode:bg-2a2a2a');
        }
    });
    
    currentPageNumber = 1;
    renderProducts();
}

function toggleMobileFilters() {
    const sidebar = document.getElementById('shop-filters-sidebar');
    const body = document.body;
    if (sidebar) {
        sidebar.classList.toggle('active');
        body.classList.toggle('overflow-hidden');
    }
}


// ==========================================================
// 6. CART & CHECKOUT LOGIC
// ==========================================================

function updateCartItemQuantity(sku, delta) {
    const itemIndex = cart.findIndex(item => item.sku === sku);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += delta;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
            showNotification('Item removed from cart.');
        } else {
            showNotification(`Quantity updated for ${cart[itemIndex].name}.`);
        }
        updateLocalStorage();
        updateCartDisplay();
    }
}

function removeCartItem(sku) {
    const initialLength = cart.length;
    cart = cart.filter(item => item.sku !== sku);
    if (cart.length < initialLength) {
        updateLocalStorage();
        updateCartDisplay();
        showNotification('Item removed from cart.');
    }
}

function calculateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const mockTaxRate = 0.05; // 5% mock tax
    const tax = subtotal * mockTaxRate;
    
    // Shipping is calculated later in checkout, but we mock a minimum
    const shipping = 0; // Default zero until step 2

    const total = subtotal + tax + shipping;
    
    return { subtotal, tax, shipping, total };
}

function updateCartDisplay() {
    const container = document.getElementById('cart-items-container');
    const totals = calculateCartTotals();
    const emptyMessage = document.getElementById('empty-cart-message');

    if (!container || !emptyMessage) return;

    if (cart.length === 0) {
        container.innerHTML = '';
        emptyMessage.style.display = 'block';
    } else {
        emptyMessage.style.display = 'none';

        container.innerHTML = cart.map(item => `
            <div class="cart-item flex items-center border-b pb-4 pt-4 bg-white dark-mode:bg-gray-700 p-4 shadow-sm">
                <div class="cart-item-image w-20 h-20 bg-gray-100 dark-mode:bg-gray-800 flex items-center justify-center mr-4">
                     <span class="text-3xl">📦</span>
                </div>
                <div class="flex-1">
                    <h3 class="font-semibold">${item.name}</h3>
                    <p class="text-sm text-gray-500 dark-mode:text-gray-300">Size: ${item.size} | Color: ${item.color}</p>
                    <p class="font-medium mt-1">${formatPrice(item.price)}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <button class="text-xl px-2 border rounded dark-mode:border-gray-600" onclick="updateCartItemQuantity('${item.sku}', -1)">-</button>
                    <input type="number" value="${item.quantity}" min="1" readonly class="w-12 text-center p-1 border rounded dark-mode:bg-gray-800">
                    <button class="text-xl px-2 border rounded dark-mode:border-gray-600" onclick="updateCartItemQuantity('${item.sku}', 1)">+</button>
                </div>
                <button class="text-red-500 ml-6 hover:text-red-700" onclick="removeCartItem('${item.sku}')" aria-label="Remove Item">✕</button>
            </div>
        `).join('');
    }
    
    // Update Summary totals
    document.getElementById('summary-items').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('summary-subtotal').textContent = formatPrice(totals.subtotal);
    document.getElementById('summary-tax').textContent = formatPrice(totals.tax);
    document.getElementById('summary-total').textContent = formatPrice(totals.total);
    
    // Update Checkout total (if on checkout page)
    const checkoutTotalEl = document.getElementById('checkout-total');
    if (checkoutTotalEl) {
        // Note: Checkout total will be updated again when shipping is selected
        checkoutTotalEl.textContent = formatPrice(totals.total);
    }
}

function applyCoupon() {
    const input = document.getElementById('coupon-input');
    if (!input) return;
    
    const code = input.value.toUpperCase();
    
    if (code === 'LUXE20') {
        showNotification('Coupon LUXE20 applied! (Mock: 20% discount applied to subtotal)', false);
        // In a real app, you'd apply the discount here
    } else if (code === 'FREESHIP') {
        showNotification('Coupon FREESHIP applied! (Mock: Free shipping enabled)', false);
        // In a real app, you'd update shipping calculation
    } else {
        showNotification('Invalid coupon code.', true);
    }
}


let currentCheckoutStep = 1;

function setCheckoutStep(step) {
    if (cart.length === 0 && step > 1) {
        showNotification("Your cart is empty. Cannot proceed to checkout.", true);
        navigateTo('cart');
        return;
    }

    currentCheckoutStep = step;
    const steps = [1, 2, 3];

    steps.forEach(s => {
        const panel = document.getElementById(`checkout-step-${s}`);
        const icon = document.getElementById(`step-icon-${s}`);
        
        if (panel) panel.style.display = s === step ? 'block' : 'none';
        
        if (icon) {
            icon.classList.remove('bg-black', 'text-white', 'bg-gray-300', 'text-gray-700');
            if (s <= step) {
                icon.classList.add('bg-black', 'text-white');
            } else {
                icon.classList.add('bg-gray-300', 'text-gray-700');
            }
            // Update text color for future steps
            icon.nextElementSibling.classList.toggle('text-gray-500', s > step);
            icon.nextElementSibling.classList.toggle('dark-mode:text-gray-400', s > step);
        }
    });

    if (step === 2) {
        // Automatically check the free shipping box if subtotal > $150 (mock logic)
        const totals = calculateCartTotals();
        if (totals.subtotal > 150) {
             document.querySelector('input[name="shipping-method"][value="free"]').checked = true;
        }
        updateCheckoutSummary();
    }
    
    if (step === 3) {
        updateCheckoutSummary();
    }
}

function updateCheckoutSummary() {
    const totals = calculateCartTotals();
    let shippingCost = 0;
    
    const selectedShipping = document.querySelector('input[name="shipping-method"]:checked')?.value;

    if (selectedShipping === 'express') {
        shippingCost = 35.00;
    } else if (selectedShipping === 'standard') {
        shippingCost = 10.00;
    } 
    // If 'free' is selected or nothing is selected, cost remains 0 (or original totals.shipping value)

    const finalTotal = totals.subtotal + totals.tax + shippingCost;
    
    // Update summary in cart section (if we were still there, or just for consistency)
    document.getElementById('summary-shipping').textContent = shippingCost === 0 ? 'FREE' : formatPrice(shippingCost);
    document.getElementById('summary-total').textContent = formatPrice(finalTotal);

    // Update summary in checkout step 3
    const checkoutTotalEl = document.getElementById('checkout-total');
    if (checkoutTotalEl) {
        checkoutTotalEl.textContent = formatPrice(finalTotal);
    }
}

function placeOrder() {
    if (cart.length === 0) {
        showNotification("Cannot place an empty order.", true);
        return;
    }

    const orderId = 'LUXE-' + Math.floor(Math.random() * 900000 + 100000);
    const totals = calculateCartTotals(); // Recalculate based on step 2 selection
    
    // Final total must be calculated correctly one last time
    let shippingCost = 0;
    const selectedShipping = document.querySelector('input[name="shipping-method"]:checked')?.value;
    if (selectedShipping === 'express') {
        shippingCost = 35.00;
    } else if (selectedShipping === 'standard') {
        shippingCost = 10.00;
    } 
    const finalTotal = totals.subtotal + totals.tax + shippingCost;


    const newOrder = {
        id: orderId,
        date: new Date().toLocaleDateString(),
        items: cart,
        total: finalTotal,
        status: 'Processing',
        shippingAddress: {
             // Mock data collection from form fields
             name: `${document.getElementById('shipping-first-name').value} ${document.getElementById('shipping-last-name').value}`,
             address: `${document.getElementById('shipping-address-1').value}, ${document.getElementById('shipping-city').value}`
        }
    };

    orders.push(newOrder);
    cart = []; // Clear the cart
    updateLocalStorage();
    
    // Update confirmation page details
    document.getElementById('confirmation-order-id').textContent = orderId;
    document.getElementById('confirmation-total').textContent = formatPrice(finalTotal);
    
    navigateTo('order-confirmation', null, true);
    showNotification(`Order ${orderId} placed successfully!`);
}

// ==========================================================
// 7. WISHLIST LOGIC
// ==========================================================

function renderWishlistDisplay() {
    const container = document.getElementById('wishlist-container');
    const emptyMessage = document.getElementById('empty-wishlist-message');

    if (!container || !emptyMessage) return;

    if (wishlist.length === 0) {
        container.innerHTML = '';
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    const wishlistProducts = wishlist.map(w => products.find(p => p.id === w.productId)).filter(p => p);
    
    container.innerHTML = wishlistProducts.map(product => {
        return `
            <div class="product-card bg-white dark-mode:bg-gray-700 p-4 shadow-sm relative">
                <button class="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl" 
                        onclick="event.stopPropagation(); toggleWishlist('${product.id}');" aria-label="Remove from Wishlist">✕</button>
                
                <div onclick="navigateTo('product', '${product.id}', true)">
                    <div class="product-image">
                        <span class="text-6xl" aria-label="Product Image Mock">📦</span>
                    </div>
                    <div class="mt-3">
                        <h3 class="text-lg font-semibold truncate">${product.name}</h3>
                        <p class="text-gray-500 dark-mode:text-gray-300 text-sm">${product.category}</p>
                        <p class="text-xl font-medium mt-2">${formatPrice(product.price)}</p>
                    </div>
                </div>
                <button class="btn-primary w-full mt-3 text-sm" 
                        onclick="event.stopPropagation(); showNotification('Mock: Added to cart with default size/color.', false); removeCartItem('${product.id}')">Add to Cart</button>
            </div>
        `;
    }).join('');
}


// ==========================================================
// 8. ACCOUNT LOGIC
// ==========================================================

function mockLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if ((email === 'user@test.com' && password === 'password') || (email === 'admin@luxe.com' && password === '12345')) {
        isAuthenticated = true;
        localStorage.setItem('luxeUserEmail', email);
        updateLocalStorage();
        updateAccountView();
        showNotification(`Welcome back, ${email.split('@')[0]}!`);
    } else {
        showNotification('Invalid email or password.', true);
    }
}

function logout() {
    isAuthenticated = false;
    localStorage.removeItem('luxeUserEmail');
    updateLocalStorage();
    updateAccountView();
    showNotification('You have been logged out.');
}

function updateAccountView() {
    const welcomeMessage = document.getElementById('welcome-message');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const email = localStorage.getItem('luxeUserEmail');
    
    if (isAuthenticated) {
        welcomeMessage.textContent = `Welcome, ${email.split('@')[0]}!`;
        loginButton.style.display = 'none';
        logoutButton.style.display = 'block';
        toggleAccountView('profile'); // Default view after login
    } else {
        welcomeMessage.textContent = 'Welcome, Guest!';
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
        toggleAccountView('login'); // Default view when logged out
    }

    renderOrderHistory();
    renderSavedAddresses();
}

function toggleAccountView(viewId) {
    const views = ['profile', 'orders', 'addresses', 'login'];
    views.forEach(id => {
        const el = document.getElementById(`account-view-${id}`);
        if (el) {
            el.style.display = (id === viewId) ? 'block' : 'none';
        }
    });

    if (viewId !== 'login' && !isAuthenticated) {
        toggleAccountView('login');
        showNotification('Please log in to view this section.', true);
    }
}

function renderOrderHistory() {
    const container = document.getElementById('order-history-container');
    const noOrdersMessage = document.getElementById('no-orders-message');

    if (!container || !noOrdersMessage) return;

    if (orders.length === 0) {
        container.innerHTML = '';
        noOrdersMessage.style.display = 'block';
        return;
    }

    noOrdersMessage.style.display = 'none';

    container.innerHTML = orders.map(order => `
        <div class="border p-4 bg-gray-50 dark-mode:bg-gray-800 rounded">
            <div class="flex justify-between items-center font-bold mb-2">
                <span>Order ${order.id}</span>
                <span class="text-lg">${formatPrice(order.total)}</span>
            </div>
            <p class="text-sm text-gray-600 dark-mode:text-gray-400">Date: ${order.date} | Status: ${order.status}</p>
            <p class="text-xs mt-1 text-gray-500 dark-mode:text-gray-400">${order.items.length} item(s)</p>
            <button class="text-sm text-blue-600 hover:underline mt-2" onclick="showNotification('Mock: Viewing detail for order ${order.id}')">View Details</button>
        </div>
    `).join('');
}

function renderSavedAddresses() {
    const container = document.getElementById('addresses-container');
    if (!container) return;

    // Mock saved addresses (real data would be stored in localStorage/backend)
    const mockAddresses = isAuthenticated ? [
        { name: "Home", street: "123 Luxury Lane", city: "New York, NY 10001", default: true },
        { name: "Work", street: "45 Business Blvd", city: "London, SW1A 0AA", default: false }
    ] : [];

    if (mockAddresses.length === 0) {
        container.innerHTML = '<p class="text-gray-600 dark-mode:text-gray-400">No saved addresses.</p>';
        return;
    }

    container.innerHTML = mockAddresses.map(addr => `
        <div class="border p-4 rounded bg-white dark-mode:bg-gray-800 relative">
            <h4 class="font-semibold">${addr.name} ${addr.default ? '<span class="text-xs bg-gray-200 dark-mode:bg-gray-700 px-2 py-0.5 rounded ml-2">Default</span>' : ''}</h4>
            <p class="text-sm text-gray-700 dark-mode:text-gray-300">${addr.street}</p>
            <p class="text-sm text-gray-700 dark-mode:text-gray-300">${addr.city}</p>
            <div class="absolute top-4 right-4 space-x-2 text-sm">
                <button class="text-blue-600 hover:underline">Edit</button>
                <button class="text-red-600 hover:underline">Delete</button>
            </div>
        </div>
    `).join('');
}

function addNewAddress() {
    showNotification('Mock: Address form would appear here.');
}


// ==========================================================
// 9. MISCELLANEOUS
// ==========================================================

function openDocumentation() {
    document.getElementById('docs-modal').style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
    document.body.classList.add('overflow-hidden');
}

function closeDocumentation() {
    document.getElementById('docs-modal').style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none';
    document.body.classList.remove('overflow-hidden');
}

function filterByCategory(category) {
    // Clear all existing filters
    clearFilters(); 
    // Set the new category filter (updates the checkbox state for visual consistency)
    const checkbox = document.querySelector(`#shop-filters-sidebar input[type="checkbox"][data-filter="category"][value="${category}"]`);
    if (checkbox) {
        checkbox.checked = true;
    }
    // Update the state object and re-render
    currentFilters.category.push(category);
    navigateTo('shop', null, true);
}


// End of file. The mobile menu fix is contained within the toggleMobileMenu function and the DOMContentLoaded listener.
