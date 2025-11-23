// ==========================================================
// 1. DATA STRUCTURES (MOCK DATA)
// ==========================================================
// Mock products to fill the pages and enable filtering
const products = [
    { id: 1, name: 'Premium Wool Coat', price: 299.00, category: 'Women', color: 'Black', size: 'M', rating: 5, tags: ['coat', 'winter', 'luxury'], new: true },
    { id: 2, name: 'Silk Evening Dress', price: 549.00, category: 'Women', color: 'Red', size: 'L', rating: 4, tags: ['dress', 'formal', 'sale'], new: false },
    { id: 3, name: 'Leather Biker Jacket', price: 399.00, category: 'Men', color: 'Black', size: 'XL', rating: 5, tags: ['jacket', 'leather', 'men'], new: true },
    { id: 4, name: 'Luxury Knit Sweater', price: 129.00, category: 'Men', color: 'Blue', size: 'M', rating: 4, tags: ['sweater', 'knit'], new: false },
    { id: 5, name: 'Minimalist Watch', price: 180.00, category: 'Accessories', color: 'Black', size: 'OS', rating: 5, tags: ['watch', 'accessory'], new: true },
    { id: 6, name: 'Cashmere Scarf', price: 89.00, category: 'Accessories', color: 'White', size: 'OS', rating: 5, tags: ['scarf', 'winter'], new: false },
    { id: 7, name: 'Slim Fit Jeans', price: 79.00, category: 'Men', color: 'Blue', size: 'L', rating: 4, tags: ['jeans', 'casual'], new: false },
    { id: 8, name: 'Designer Handbag', price: 650.00, category: 'Women', color: 'Red', size: 'OS', rating: 5, tags: ['bag', 'luxury'], new: true },
    { id: 9, name: 'Classic Loafers', price: 150.00, category: 'Men', color: 'Black', size: 'L', rating: 4, tags: ['shoes', 'formal'], new: false },
    { id: 10, name: 'Elegant Blouse', price: 95.00, category: 'Women', color: 'White', size: 'S', rating: 5, tags: ['blouse', 'top'], new: true },
    { id: 11, name: 'Wool Trousers', price: 140.00, category: 'Men', color: 'Gray', size: 'M', rating: 3, tags: ['trousers', 'formal'], new: false },
    { id: 12, name: 'Gold Necklace', price: 45.00, category: 'Accessories', color: 'Gold', size: 'OS', rating: 5, tags: ['jewelry', 'accessory'], new: true },
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPage = 1;
const productsPerPage = 9;
let currentFilters = {};
let currentSort = 'newest';
let currentCurrency = localStorage.getItem('currency') || 'USD';
let currentLang = localStorage.getItem('language') || 'en';

// Simple currency rate mapping (MOCK)
const currencyRates = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.50
};
// Simple currency symbol mapping
const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹'
};


// ==========================================================
// 2. CORE NAVIGATION & UI LOGIC
// ==========================================================

// Handles SPA-style page navigation
function navigateTo(pageId, productId = null) {
    // 1. Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        // Add animation for smooth transition
        page.classList.remove('slide-in-right', 'slide-in-left');
    });

    // 2. Show the requested page with animation
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.classList.add('active', 'slide-in-right');
    } else {
        console.error(`Page ID 'page-${pageId}' not found.`);
        return;
    }

    // 3. Special handler for SHOP
    if (pageId === 'shop') {
        renderProducts(products); // Initial rendering of all products
    }

    // 4. Special handler for PRODUCT DETAIL
    if (pageId === 'product' && productId) {
        renderProductDetail(productId);
    }
    
    // 5. Close mobile menu if open
    document.getElementById('mobile-menu').classList.remove('active');
}

// Initial page load
document.addEventListener('DOMContentLoaded', () => {
    // Navigate to home by default
    navigateTo('home'); 
    
    // Initialize UI elements
    updateCartCounter();
    updateCountdown();
    loadFeaturedProducts();

    // Set initial currency/language selectors
    document.getElementById('currency-select').value = currentCurrency;
    document.getElementById('language-select').value = currentLang;

    // Apply dark mode if preference is set
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});

// Toggle Mobile Menu
function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('active');
}

// Toggle Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled');
    }
}

// ==========================================================
// 3. CART LOGIC
// ==========================================================

function updateCartCounter() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counterElement = document.getElementById('cart-count');
    if (counterElement) {
        counterElement.textContent = totalItems;
    }
}

function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: productId, name: product.name, price: product.price, quantity: quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
    showToast(`Added ${product.name} to cart!`);
}

function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('active');
        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }
}

// ==========================================================
// 4. PRODUCT RENDERING & FILTERING
// ==========================================================

function formatPrice(price) {
    const rate = currencyRates[currentCurrency];
    const symbol = currencySymbols[currentCurrency];
    const convertedPrice = (price * rate).toFixed(2);
    return `${symbol} ${convertedPrice}`;
}

// Renders the product cards for the main shop page
function renderProducts(productArray) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    // Apply pagination
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = productArray.slice(startIndex, endIndex);
    
    // Update pagination info
    const totalPages = Math.ceil(productArray.length / productsPerPage);
    document.getElementById('pagination-info').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('product-count').textContent = `Showing ${productArray.length} products`;
    
    grid.innerHTML = paginatedProducts.map(product => `
        <article class="product-card bg-white p-4 border border-gray-100 rounded" onclick="navigateTo('product', ${product.id})" tabindex="0" role="link">
            <div class="product-image">
                <span class="text-6xl" aria-hidden="true">${product.id % 2 === 0 ? '👚' : '👖'}</span>
            </div>
            <div class="pt-4">
                <p class="text-sm text-gray-500">${product.category}</p>
                <h3 class="text-xl font-semibold mt-1">${product.name}</h3>
                <p class="text-lg font-bold mt-2">${formatPrice(product.price)}</p>
                <div class="stars mt-1" aria-label="Rating: ${product.rating} out of 5 stars">${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}</div>
                <button class="btn-primary w-full mt-4" onclick="event.stopPropagation(); addToCart(${product.id});">Add to Cart</button>
            </div>
        </article>
    `).join('');
}

// Renders 4 products for the home page (New Arrivals)
function loadFeaturedProducts() {
    const featuredGrid = document.getElementById('featured-products');
    if (!featuredGrid) return;
    
    const featured = products.filter(p => p.new).slice(0, 4);

    featuredGrid.innerHTML = featured.map(product => `
        <article class="product-card text-center bg-white" onclick="navigateTo('product', ${product.id})" tabindex="0" role="link">
            <div class="product-image" aria-hidden="true">
                <span class="text-6xl">${product.id % 2 === 0 ? '👚' : '👖'}</span>
            </div>
            <h3 class="text-xl font-semibold mt-4">${product.name}</h3>
            <p class="text-lg font-bold mt-1">${formatPrice(product.price)}</p>
        </article>
    `).join('');
}

function renderProductDetail(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    // Update main elements on the detail page
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('product-price').textContent = formatPrice(product.price);
    document.getElementById('product-description').textContent = 'This is a detailed description for the ' + product.name + '. It is made of the finest materials and embodies our brand\'s commitment to quality and luxury.';
    document.getElementById('product-breadcrumb').textContent = product.name;
    document.getElementById('main-product-image').innerHTML = `<span class="text-8xl">${product.id % 2 === 0 ? '👚' : '👖'}</span>`;
    document.getElementById('product-sku').textContent = `SKU: LUX-TS-${product.id.toString().padStart(3, '0')}`;
    
    // Find the 'Add to Cart' button and update its handler
    const cartButton = document.getElementById('detail-add-to-cart');
    if(cartButton) {
        cartButton.onclick = () => { addToCart(product.id, 1); };
    }
}

// Handles all product filtering logic
function applyFilters() {
    currentFilters = {};
    
    // 1. Collect all selected filters
    document.querySelectorAll('.filter-group input:checked').forEach(checkbox => {
        const filterType = checkbox.getAttribute('data-filter');
        const filterValue = checkbox.value;
        
        if (!currentFilters[filterType]) {
            currentFilters[filterType] = [];
        }
        currentFilters[filterType].push(filterValue);
    });

    // 2. Filter products
    let filteredProducts = products.filter(product => {
        let passesAllFilters = true;

        for (const type in currentFilters) {
            if (currentFilters[type].length === 0) continue; // Skip if no values selected for this filter type

            let passesCurrentFilter = false;
            
            if (type === 'price') {
                // Handle Price Range Filter
                currentFilters[type].forEach(range => {
                    const [min, max] = range.split('-').map(Number);
                    if (product.price >= min && product.price <= max) {
                        passesCurrentFilter = true;
                    }
                });
            } else if (type === 'rating') {
                // Handle Rating Filter
                currentFilters[type].forEach(minRating => {
                    if (product.rating >= parseInt(minRating)) {
                        passesCurrentFilter = true;
                    }
                });
            } else {
                // Handle Category, Color, Size (direct match)
                if (currentFilters[type].includes(product[type])) {
                    passesCurrentFilter = true;
                }
            }
            
            if (!passesCurrentFilter) {
                passesAllFilters = false;
                break;
            }
        }
        return passesAllFilters;
    });

    // 3. Apply sorting and re-render
    sortProducts(filteredProducts);
}

function clearFilters() {
    document.querySelectorAll('.filter-group input:checked').forEach(checkbox => {
        checkbox.checked = false;
    });
    applyFilters(); // Re-run filtering with empty filters
}

function sortProducts(productArray = products) {
    const sortSelect = document.getElementById('sort-select');
    if (!sortSelect) return;
    
    currentSort = sortSelect.value;
    
    let sortedProducts = [...productArray]; // Create a copy
    
    switch (currentSort) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            sortedProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'popular':
            // Mock popularity by ID
            sortedProducts.sort((a, b) => b.id - a.id);
            break;
        case 'newest':
        default:
            // Mock newest by ID
            sortedProducts.sort((a, b) => b.id - a.id);
            break;
    }
    
    currentPage = 1; // Reset to first page after sort/filter
    renderProducts(sortedProducts);
}

function changePage(direction) {
    const totalProducts = products.filter(product => {
        // Simple filter placeholder: reuse the logic from applyFilters or just count all if no filters are active
        return true; 
    }).length; 
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        applyFilters(); // Re-render the current filtered set on the new page
    }
}

// ==========================================================
// 5. MISCELLANEOUS UI FUNCTIONS
// ==========================================================

// Handle Currency Change
function changeCurrency(newCurrency) {
    currentCurrency = newCurrency;
    localStorage.setItem('currency', newCurrency);
    // Re-render prices across all visible pages
    loadFeaturedProducts();
    if (document.getElementById('page-shop').classList.contains('active')) {
        applyFilters(); // Re-render shop prices
    }
    // Note: Detail page prices are updated when rendered via navigateTo
}

// Handle Language Change (MOCK)
function changeLanguage(newLang) {
    currentLang = newLang;
    localStorage.setItem('language', newLang);
    // In a real application, you would load a JSON file here and re-render all text elements.
    console.log(`Language set to ${newLang}. (Mock: Text translation would happen now)`);
}

// Countdown Timer Logic
function updateCountdown() {
    const saleEnd = new Date();
    // Set sale end date 7 days from now (Mock: For demonstration purposes)
    saleEnd.setDate(saleEnd.getDate() + 7); 
    
    function calculateTimeRemaining() {
        const now = new Date().getTime();
        const distance = saleEnd - now;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update elements, using padding for 00 format
        const pad = (num) => num.toString().padStart(2, '0');
        document.getElementById('countdown-days').textContent = pad(days);
        document.getElementById('countdown-hours').textContent = pad(hours);
        document.getElementById('countdown-minutes').textContent = pad(minutes);
        document.getElementById('countdown-seconds').textContent = pad(seconds);
        
        if (distance < 0) {
            clearInterval(timerInterval);
            document.getElementById('promo-heading').textContent = "SALE ENDED!";
            document.querySelector('.countdown').innerHTML = '';
        }
    }
    
    // Run calculation immediately and then every second
    calculateTimeRemaining();
    const timerInterval = setInterval(calculateTimeRemaining, 1000);
}


// MOCK functions for buttons used in HTML
function toggleWishlist() { showToast('Wishlist feature is a mockup!'); }
function handleSearch(event) { 
    // In a real app, this would query products based on event.target.value
    console.log('Searching for:', event.target.value);
}
function filterByCategory(category) {
    // Navigate to shop and pre-select the category filter (MOCK)
    navigateTo('shop'); 
    showToast(`Filtered by Category: ${category}`);
}
function zoomImage() { showToast('Image Zoom Modal is a mockup!'); }
function showReviews() { showToast('Showing all product reviews!'); }
function selectColor(color, element) { 
    document.getElementById('selected-color').textContent = color;
    // Real logic would update the product image based on color
}
function selectSize(size, element) { 
    document.getElementById('selected-size').textContent = size;
}
function toggleSizeGuide() { showToast('Size Guide Modal will open here!'); }
function changeMainImage(element) { showToast('Changing main product image...'); }
