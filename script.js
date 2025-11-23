// ==========================================================
// 1. DATA STRUCTURES (MOCK DATA)
// ==========================================================
const initialProducts = [
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

let products = JSON.parse(localStorage.getItem('products')) || initialProducts;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPage = 1;
const productsPerPage = 9;
let currentFilters = {};
let currentSort = 'newest';
let currentCurrency = localStorage.getItem('currency') || 'USD';

let isAuthenticated = JSON.parse(localStorage.getItem('isAuthenticated')) || false;
let user = JSON.parse(localStorage.getItem('user')) || { name: 'Guest', email: '', orders: [] };

// Admin State
let isAdminAuthenticated = JSON.parse(sessionStorage.getItem('isAdminAuthenticated')) || false;


let checkoutState = {
    step: 1, 
    shipping: {
        firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com',
        address1: '123 Mock Lane', address2: '', city: 'New York',
        state: 'NY', zip: '10001', country: 'USA',
        method: 'standard', cost: 0.00
    },
    payment: {
        method: 'card', name: 'John A. Doe', last4: '1234'
    },
    totals: {
        subtotal: 0.00,
        shipping: 0.00,
        taxRate: 0.05,
        tax: 0.00,
        discount: 0.00,
        total: 0.00
    }
};

const currencyRates = { USD: 1.0, EUR: 0.92, GBP: 0.79, INR: 83.50 };
const currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };


// ==========================================================
// 2. CORE NAVIGATION & UI LOGIC
// ==========================================================

function navigateTo(pageId, productId = null) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active', 'slide-in-right');
    });

    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.classList.add('active', 'slide-in-right');
    } else {
        return;
    }

    if (pageId === 'shop') {
        renderProducts(products); 
    } else if (pageId === 'product' && productId) {
        renderProductDetail(productId);
    } else if (pageId === 'cart') {
        updateCartDisplay(); 
    } else if (pageId === 'checkout') {
        if (cart.length === 0) {
            showToast('Your cart is empty. Please add items before checking out.');
            navigateTo('shop');
            return;
        }
        updateCheckoutTotals();
        setCheckoutStep(checkoutState.step, false);
    } else if (pageId === 'account') {
        updateAccountPage();
    }
    
    document.getElementById('mobile-menu')?.classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.page')) {
        navigateTo('home');
        updateCartCounter();
        updateCountdown();
        loadFeaturedProducts();
    } 
    
    if (document.getElementById('admin-dashboard-section')) {
        initAdminDashboard();
    }

    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) currencySelect.value = currentCurrency;

    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});

function toggleMobileMenu() {
    document.getElementById('mobile-menu')?.classList.toggle('active');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled');
    }
}


// ==========================================================
// 3. UTILITY & CART LOGIC
// ==========================================================

function formatPrice(price) {
    const rate = currencyRates[currentCurrency];
    const symbol = currencySymbols[currentCurrency];
    const convertedPrice = (parseFloat(price) * rate).toFixed(2);
    return `${symbol} ${convertedPrice}`;
}

function updateCartCounter() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counterElement = document.getElementById('cart-count');
    if (counterElement) {
        counterElement.textContent = totalItems;
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
    updateCartDisplay();
    updateCheckoutTotals();
}

function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    quantity = parseInt(quantity, 10);
    if (isNaN(quantity) || quantity < 1) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: productId, name: product.name, price: product.price, quantity: quantity });
    }

    saveCart();
    showToast(`Added ${product.name} (x${quantity}) to cart!`);
}

function updateCartItemQuantity(productId, newQuantity) {
    const item = cart.find(i => i.id === productId);
    newQuantity = parseInt(newQuantity, 10);
    
    if (item && !isNaN(newQuantity)) {
        if (newQuantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        } else {
            item.quantity = newQuantity;
        }
    }
    saveCart();
}

function removeCartItem(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    showToast('Item removed from cart.');
}

function clearCart() {
    cart = [];
    saveCart();
    showToast('Cart cleared!');
}

function updateCartDisplay() {
    const container = document.getElementById('cart-items-container');
    const emptyMessage = document.getElementById('empty-cart-message');
    
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '';
        if (emptyMessage) emptyMessage.style.display = 'block';
        updateCartSummary(0, 0, 0, 'Calculated at checkout');
        return;
    }
    
    if (emptyMessage) emptyMessage.style.display = 'none';

    let subtotal = 0;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const itemsHtml = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        const imageEmoji = product ? (product.id % 2 === 0 ? '👚' : '👖') : '🎁';
        const itemPrice = item.price * item.quantity;
        subtotal += itemPrice;

        return `
            <div class="flex items-center gap-6 p-4 border border-gray-100 bg-white dark-mode:bg-gray-700">
                <div class="cart-item-image flex-shrink-0" aria-hidden="true">${imageEmoji}</div>
                
                <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold truncate">${item.name}</h3>
                    <p class="text-gray-600 text-sm dark-mode:text-gray-400">${formatPrice(item.price)} each</p>
                    <p class="text-sm dark-mode:text-gray-400">SKU: LUX-TS-${item.id.toString().padStart(3, '0')}</p>
                </div>
                
                <div class="flex items-center gap-4">
                    <label for="qty-${item.id}" class="sr-only">Quantity for ${item.name}</label>
                    <input 
                        type="number" 
                        id="qty-${item.id}"
                        value="${item.quantity}" 
                        min="1" 
                        max="10"
                        onchange="updateCartItemQuantity(${item.id}, this.value)"
                        class="w-16 px-2 py-1 border border-gray-300 rounded text-center dark-mode:bg-gray-800"
                        aria-label="Quantity"
                    >
                    <div class="text-lg font-bold w-24 text-right">${formatPrice(itemPrice)}</div>
                    
                    <button 
                        onclick="removeCartItem(${item.id})" 
                        class="text-gray-500 hover:text-red-600 dark-mode:text-gray-400"
                        aria-label="Remove ${item.name} from cart"
                    >
                        ✕
                    </button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = itemsHtml;
    updateCartSummary(subtotal, 0, totalItems, 'Calculated at checkout');
}

function updateCartSummary(subtotal, shipping, totalItems, shippingText) {
    const summarySubtotalElement = document.getElementById('summary-subtotal');
    const summaryTotalElement = document.getElementById('summary-total');
    const summaryItemCountElement = document.getElementById('summary-item-count');
    const shippingElement = document.getElementById('summary-shipping');

    if (summarySubtotalElement) summarySubtotalElement.textContent = formatPrice(subtotal);
    if (summaryTotalElement) summaryTotalElement.textContent = formatPrice(subtotal + shipping);
    if (summaryItemCountElement) summaryItemCountElement.textContent = totalItems;
    if (shippingElement) shippingElement.textContent = shippingText;
}


// ==========================================================
// 4. CHECKOUT LOGIC
// ==========================================================

function updateCheckoutTotals() {
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let discount = subtotal > 500 ? subtotal * 0.10 : 0.00;
    
    let shipping = checkoutState.shipping.method === 'express' ? 25.00 : 0.00;

    let taxableBase = subtotal - discount + shipping;
    let tax = taxableBase * checkoutState.totals.taxRate;
    let total = taxableBase + tax;

    checkoutState.totals.subtotal = subtotal;
    checkoutState.totals.discount = discount;
    checkoutState.totals.shipping = shipping;
    checkoutState.totals.tax = tax;
    checkoutState.totals.total = total;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const checkoutSummaryItemCount = document.getElementById('checkout-summary-item-count');
    if(checkoutSummaryItemCount) checkoutSummaryItemCount.textContent = totalItems;
    const checkoutSummarySubtotal = document.getElementById('checkout-summary-subtotal');
    if(checkoutSummarySubtotal) checkoutSummarySubtotal.textContent = formatPrice(subtotal);
    const checkoutSummaryDiscount = document.getElementById('checkout-summary-discount');
    if(checkoutSummaryDiscount) checkoutSummaryDiscount.textContent = formatPrice(discount * -1);
    const checkoutSummaryShippingCost = document.getElementById('checkout-summary-shipping-cost');
    if(checkoutSummaryShippingCost) checkoutSummaryShippingCost.textContent = shipping === 0 ? 'Free' : formatPrice(shipping);
    const checkoutSummaryTaxes = document.getElementById('checkout-summary-taxes');
    if(checkoutSummaryTaxes) checkoutSummaryTaxes.textContent = formatPrice(tax);
    const checkoutSummaryTotal = document.getElementById('checkout-summary-total');
    if(checkoutSummaryTotal) checkoutSummaryTotal.textContent = formatPrice(total);
}

function setCheckoutStep(stepNumber, animate = true) {
    if (stepNumber === 1 && cart.length === 0) {
         showToast('Your cart is empty. Cannot proceed to checkout.');
         navigateTo('shop');
         return;
    }
    
    if (stepNumber > checkoutState.step) {
        if (checkoutState.step === 1 && !validateShipping()) return;
        if (checkoutState.step === 2 && !validatePayment()) return;
    }

    checkoutState.step = stepNumber;
    
    document.querySelectorAll('.stepper-item').forEach((item, index) => {
        item.classList.remove('active', 'complete');
        const step = index + 1;
        
        if (step < stepNumber) {
            item.classList.add('complete');
        } else if (step === stepNumber) {
            item.classList.add('active');
        }
    });

    document.querySelectorAll('.checkout-step').forEach((stepEl, index) => {
        const step = index + 1;
        if (step === stepNumber) {
            stepEl.classList.remove('hidden');
            stepEl.setAttribute('aria-hidden', 'false');
            if (animate) stepEl.classList.add('slide-in-right');
            if (step === 3) {
                updateReviewStep();
            }
        } else {
            stepEl.classList.add('hidden');
            stepEl.classList.remove('slide-in-right');
            stepEl.setAttribute('aria-hidden', 'true');
        }
    });
    
    updateShippingState();
    updateCheckoutTotals();
    
    document.getElementById('page-checkout')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateShippingState() {
    const shippingForm = document.getElementById('shipping-form');
    if (!shippingForm) return;

    checkoutState.shipping.firstName = shippingForm.querySelector('#shipping-first-name').value;
    checkoutState.shipping.lastName = shippingForm.querySelector('#shipping-last-name').value;
    checkoutState.shipping.email = shippingForm.querySelector('#shipping-email').value;
    checkoutState.shipping.address1 = shippingForm.querySelector('#shipping-address1').value;
    checkoutState.shipping.address2 = shippingForm.querySelector('#shipping-address2').value;
    checkoutState.shipping.city = shippingForm.querySelector('#shipping-city').value;
    checkoutState.shipping.state = shippingForm.querySelector('#shipping-state').value;
    checkoutState.shipping.zip = shippingForm.querySelector('#shipping-zip').value;
    checkoutState.shipping.country = shippingForm.querySelector('#shipping-country').value;
    
    const selectedMethodInput = shippingForm.querySelector('input[name="shipping-method"]:checked');
    if (selectedMethodInput) {
        checkoutState.shipping.method = selectedMethodInput.value;
    } else {
        checkoutState.shipping.method = 'standard';
    }
    
    checkoutState.shipping.cost = checkoutState.shipping.method === 'express' ? 25.00 : 0.00;
    
    updateCheckoutTotals();
}

function updateReviewStep() {
    const s = checkoutState.shipping;
    const reviewShippingDetails = document.getElementById('review-shipping-details');
    if (reviewShippingDetails) {
        reviewShippingDetails.innerHTML = `
            <p><strong>Contact:</strong> ${s.firstName} ${s.lastName} (${s.email})</p>
            <p><strong>Address:</strong> ${s.address1}${s.address2 ? ', ' + s.address2 : ''}, ${s.city}, ${s.state} ${s.zip}, ${s.country}</p>
            <p><strong>Method:</strong> ${s.method === 'express' ? 'Express Shipping' : 'Standard Shipping'} (${s.cost === 0 ? 'Free' : formatPrice(s.cost)})</p>
        `;
    }
    
    const p = checkoutState.payment;
    const reviewPaymentDetails = document.getElementById('review-payment-details');
    if (reviewPaymentDetails) {
        reviewPaymentDetails.innerHTML = `
            <p><strong>Method:</strong> ${p.method === 'card' ? 'Credit/Debit Card' : (p.method === 'paypal' ? 'PayPal' : 'Gift Card')}</p>
            <p><strong>Card:</strong> ${p.method === 'card' ? `ending in **** ${p.last4}` : 'N/A'}</p>
        `;
    }

    const reviewItemsContainer = document.getElementById('review-items-container');
    const reviewItemCount = document.getElementById('review-item-count');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if(reviewItemCount) reviewItemCount.textContent = totalItems;
    
    if (reviewItemsContainer) {
        reviewItemsContainer.innerHTML = cart.map(item => `
            <div class="flex justify-between text-sm text-gray-700 dark-mode:text-gray-400 border-b border-gray-100 dark-mode:border-gray-800 py-2">
                <span>${item.name} (x${item.quantity})</span>
                <span>${formatPrice(item.price * item.quantity)}</span>
            </div>
        `).join('');
    }
}


function validateShipping() {
    const form = document.getElementById('shipping-form');
    if (!form) return false;
    
    if (!form.checkValidity()) {
        form.reportValidity();
        showToast('Please fill out all required shipping fields.');
        return false;
    }
    updateShippingState();
    return true;
}

function validatePayment() {
    const form = document.getElementById('payment-form');
    if (!form) return false;

    if (!form.checkValidity()) {
        form.reportValidity();
        showToast('Please fill out all required payment fields.');
        return false;
    }
    
    const selectedMethodInput = form.querySelector('input[name="payment-method"]:checked');
    if (selectedMethodInput) {
        checkoutState.payment.method = selectedMethodInput.value;
    } else {
        checkoutState.payment.method = 'card';
    }
    
    if (checkoutState.payment.method === 'card') {
        const cardNumberInput = form.querySelector('#card-number');
        const cardNameInput = form.querySelector('#card-name');
        
        if (cardNumberInput && cardNameInput) {
            checkoutState.payment.last4 = cardNumberInput.value.slice(-4);
            checkoutState.payment.name = cardNameInput.value;
        } else {
            checkoutState.payment.last4 = '1234'; 
            checkoutState.payment.name = 'Mock User'; 
        }
    } else {
         checkoutState.payment.last4 = 'N/A';
         checkoutState.payment.name = 'N/A';
    }
    
    return true;
}

function toggleBillingAddress() {
    const checkbox = document.getElementById('same-as-shipping');
    const fields = document.getElementById('billing-address-fields');
    if (checkbox && fields) {
        if (checkbox.checked) {
            fields.classList.add('hidden');
        } else {
            fields.classList.remove('hidden');
        }
    }
}

function placeOrder() {
    if (cart.length === 0) {
        showToast('Cannot place order. Your cart is empty.');
        navigateTo('shop');
        return;
    }

    const orderDetails = {
        id: Date.now(),
        items: JSON.parse(JSON.stringify(cart)),
        shipping: JSON.parse(JSON.stringify(checkoutState.shipping)),
        payment: JSON.parse(JSON.stringify(checkoutState.payment)),
        totals: JSON.parse(JSON.stringify(checkoutState.totals)),
        date: new Date().toLocaleDateString('en-US'),
        status: 'Processing'
    };
    
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.textContent = 'Processing...';
        placeOrderBtn.disabled = true;
    }

    setTimeout(() => {
        user.orders.unshift(orderDetails);
        saveUserState();
        
        clearCart(); 

        showToast(`Order #${orderDetails.id} successfully placed! Total: ${formatPrice(orderDetails.totals.total)}`);
        
        if (placeOrderBtn) {
            placeOrderBtn.textContent = 'Place Order';
            placeOrderBtn.disabled = false;
        }
        
        navigateTo('home');

    }, 2000);
}


// ==========================================================
// 5. ACCOUNT & AUTHENTICATION LOGIC
// ==========================================================

function saveUserState() {
    localStorage.setItem('isAuthenticated', isAuthenticated);
    localStorage.setItem('user', JSON.stringify(user));
}

function updateAccountPage() {
    const dashboard = document.getElementById('account-dashboard');
    const authForms = document.getElementById('login-register-forms');
    const accountHeading = document.getElementById('account-heading');
    const orderCount = document.getElementById('order-count');

    if (!dashboard || !authForms || !accountHeading || !orderCount) return;
    
    if (isAuthenticated) {
        dashboard.classList.remove('hidden');
        authForms.classList.add('hidden');
        accountHeading.textContent = 'My Account';
        document.getElementById('account-user-name').textContent = user.name.split(' ')[0];
        orderCount.textContent = user.orders.length;
        showAccountSection('overview');
    } else {
        dashboard.classList.add('hidden');
        authForms.classList.remove('hidden');
        accountHeading.textContent = 'Sign In / Register';
        toggleAuthForm('login');
    }
}

function toggleAuthForm(formType) {
    const loginPanel = document.getElementById('login-panel');
    const registerPanel = document.getElementById('register-panel');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');

    if (formType === 'login') {
        loginPanel.classList.remove('hidden');
        registerPanel.classList.add('hidden');
        loginTab.classList.add('border-gray-900');
        loginTab.classList.remove('border-transparent', 'text-gray-500');
        registerTab.classList.remove('border-gray-900');
        registerTab.classList.add('border-transparent', 'text-gray-500');
        loginTab.setAttribute('aria-selected', 'true');
        registerTab.setAttribute('aria-selected', 'false');
    } else {
        loginPanel.classList.add('hidden');
        registerPanel.classList.remove('hidden');
        registerTab.classList.add('border-gray-900');
        registerTab.classList.remove('border-transparent', 'text-gray-500');
        loginTab.classList.remove('border-gray-900');
        loginTab.classList.add('border-transparent', 'text-gray-500');
        loginTab.setAttribute('aria-selected', 'false');
        registerTab.setAttribute('aria-selected', 'true');
    }
}

function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showToast('Please enter both email and password.');
        return;
    }
    
    // Mock login logic
    if (email === 'user@test.com' && password === 'password') {
        user.name = 'Mock Customer';
        user.email = email;
    } else {
        user.name = 'New User';
        user.email = email;
    }
    isAuthenticated = true;
    saveUserState();
    updateAccountPage();
    showToast(`Successfully logged in as ${user.name.split(' ')[0]}. (Mock)`);
}

function register() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    if (!name || !email || !password) {
        showToast('Please fill out all registration fields.');
        return;
    }
    
    user.name = name;
    user.email = email;
    isAuthenticated = true;
    saveUserState();
    updateAccountPage();
    showToast(`Account created successfully! Welcome, ${user.name.split(' ')[0]}.`);
}

function logout() {
    isAuthenticated = false;
    user = { name: 'Guest', email: '', orders: user.orders };
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    updateAccountPage();
    showToast('You have been logged out.');
}

function showAccountSection(section) {
    const detailSection = document.getElementById('account-detail-section');
    if (!detailSection) return;

    detailSection.innerHTML = '';
    
    document.querySelectorAll('#account-dashboard nav button').forEach(btn => {
         btn.classList.remove('bg-gray-100', 'dark-mode:bg-gray-800');
         if (btn.textContent.toLowerCase().includes(section)) {
             btn.classList.add('bg-gray-100', 'dark-mode:bg-gray-800');
         }
    });
    
    switch (section) {
        case 'overview':
             detailSection.innerHTML = `
                <h3 class="text-2xl font-bold mb-4">Account Overview</h3>
                <p class="text-lg">You are currently logged in as: <strong>${user.name}</strong> (${user.email})</p>
                <p class="mt-4 text-gray-700 dark-mode:text-gray-400">From your account dashboard, you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.</p>
                <button class="btn-primary mt-6" onclick="showAccountSection('profile')">Edit Profile</button>
            `;
            break;
        case 'orders':
            if (user.orders.length === 0) {
                detailSection.innerHTML = `<h3 class="text-2xl font-bold mb-4">Order History</h3><p class="text-gray-600 dark-mode:text-gray-400">You haven't placed any orders yet.</p>`;
            } else {
                const orderList = user.orders.map(order => `
                    <div class="p-4 border border-gray-200 dark-mode:border-gray-700 mb-4 bg-white dark-mode:bg-gray-700">
                        <div class="flex justify-between items-center font-bold mb-2">
                            <span>Order #${order.id}</span>
                            <span>${formatPrice(order.totals.total)}</span>
                        </div>
                        <p class="text-sm text-gray-600 dark-mode:text-gray-400">Placed on: ${order.date} | Status: <span class="text-green-600">${order.status}</span></p>
                        <p class="text-sm text-gray-600 dark-mode:text-gray-400">Items: ${order.items.reduce((sum, item) => sum + item.quantity, 0)} total items</p>
                    </div>
                `).join('');
                detailSection.innerHTML = `<h3 class="text-2xl font-bold mb-4">Order History (${user.orders.length})</h3>${orderList}`;
            }
            break;
        case 'profile':
            detailSection.innerHTML = `
                <h3 class="text-2xl font-bold mb-4">Profile Details</h3>
                <form class="space-y-4">
                    <label class="block">
                        <span class="text-gray-700 dark-mode:text-gray-400">Name</span>
                        <input type="text" value="${user.name}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-gray-900 focus:border-gray-900 dark-mode:bg-gray-800">
                    </label>
                    <label class="block">
                        <span class="text-gray-700 dark-mode:text-gray-400">Email Address</span>
                        <input type="email" value="${user.email}" disabled class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 bg-gray-100 cursor-not-allowed dark-mode:bg-gray-900">
                    </label>
                    <button type="button" class="btn-primary" onclick="showToast('Profile updated! (Mock)')">Save Changes</button>
                </form>
            `;
            break;
        case 'addresses':
            detailSection.innerHTML = `
                <h3 class="text-2xl font-bold mb-4">Manage Addresses</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="p-4 border border-gray-200 dark-mode:border-gray-700 bg-white dark-mode:bg-gray-700">
                        <h4 class="font-semibold mb-2">Default Shipping Address</h4>
                        <p class="text-sm text-gray-600 dark-mode:text-gray-400">John Doe</p>
                        <p class="text-sm text-gray-600 dark-mode:text-gray-400">123 Mock Lane</p>
                        <p class="text-sm text-gray-600 dark-mode:text-gray-400">New York, NY 10001</p>
                        <button class="text-sm mt-3 text-gray-600 hover:text-gray-900 underline dark-mode:text-gray-400 dark-mode:hover:text-white" onclick="showToast('Editing address... (Mock)')">Edit</button>
                    </div>
                    <div class="p-4 border border-gray-200 dark-mode:border-gray-700 bg-white dark-mode:bg-gray-700">
                        <h4 class="font-semibold mb-2">Default Billing Address</h4>
                        <p class="text-sm text-gray-600 dark-mode:text-gray-400">Same as Shipping</p>
                        <button class="text-sm mt-3 text-gray-600 hover:text-gray-900 underline dark-mode:text-gray-400 dark-mode:hover:text-white" onclick="showToast('Adding new address... (Mock)')">Add New Address</button>
                    </div>
                </div>
            `;
            break;
        default:
            showAccountSection('overview');
    }
}


// ==========================================================
// 6. ADMIN DASHBOARD LOGIC
// ==========================================================

function initAdminDashboard() {
    if (document.getElementById('admin-dashboard-section')) {
        if (isAdminAuthenticated) {
            showAdminDashboard();
        } else {
            showAdminLogin();
        }
        document.getElementById('product-form')?.addEventListener('submit', handleProductSubmit);
    }
}

function showAdminLogin() {
    document.getElementById('admin-login-section').classList.remove('hidden');
    document.getElementById('admin-dashboard-section').classList.add('hidden');
    document.getElementById('admin-nav').classList.add('hidden');
}

function showAdminDashboard() {
    document.getElementById('admin-login-section').classList.add('hidden');
    document.getElementById('admin-dashboard-section').classList.remove('hidden');
    document.getElementById('admin-nav').classList.remove('hidden');
    
    renderAdminStats();
    showAdminTab('products'); 
}

function adminLogin() {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;

    if (email === 'admin@luxe.com' && password === '12345') {
        isAdminAuthenticated = true;
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        showAdminDashboard();
        showToast('Admin logged in successfully!');
    } else {
        showToast('Invalid admin credentials.');
    }
}

function adminLogout() {
    isAdminAuthenticated = false;
    sessionStorage.removeItem('isAdminAuthenticated');
    showAdminLogin();
    showToast('Admin logged out.');
}

function renderAdminStats() {
    const totalOrders = user.orders.length;
    const totalRevenue = user.orders.reduce((sum, order) => sum + order.totals.total, 0);
    const totalProducts = products.length;
    const newCustomers = user.orders.length > 0 ? 1 : 0; 
    
    document.getElementById('stat-revenue').textContent = formatPrice(totalRevenue);
    document.getElementById('stat-orders').textContent = totalOrders;
    document.getElementById('stat-products').textContent = totalProducts;
    document.getElementById('stat-customers').textContent = newCustomers;
}

function showAdminTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));

    const tabContent = document.getElementById(`tab-${tabName}`);
    const tabButton = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
    
    if (tabContent && tabButton) {
        tabContent.classList.remove('hidden');
        tabButton.classList.add('active');
        
        if (tabName === 'products') {
            renderProductTable();
        } else if (tabName === 'orders') {
            renderOrderTable();
        }
    }
}

// --- Product Management (CRUD) ---

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
    if (document.getElementById('page-shop')?.classList.contains('active')) {
        renderProducts(products);
    }
}

function renderProductTable() {
    const tbody = document.getElementById('product-table-body');
    if (!tbody) return;

    tbody.innerHTML = products.map(p => `
        <tr class="hover:bg-gray-50 border-b border-gray-100">
            <td class="py-3 px-4 text-sm">${p.id}</td>
            <td class="py-3 px-4 font-medium">${p.name}</td>
            <td class="py-3 px-4">${formatPrice(p.price)}</td>
            <td class="py-3 px-4">${p.category}</td>
            <td class="py-3 px-4 flex gap-2">
                <button class="text-indigo-600 hover:text-indigo-900 text-sm" onclick="openProductModal(${p.id})">Edit</button>
                <button class="text-red-600 hover:text-red-900 text-sm" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('product-modal-title');
    const submitBtn = document.getElementById('modal-submit-btn');

    form.reset(); 

    if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            title.textContent = 'Edit Product';
            submitBtn.textContent = 'Save Changes';
            document.getElementById('modal-product-id').value = product.id;
            document.getElementById('modal-name').value = product.name;
            document.getElementById('modal-price').value = product.price;
            document.getElementById('modal-category').value = product.category;
            document.getElementById('modal-tags').value = product.tags.join(', ');
        }
    } else {
        title.textContent = 'Add New Product';
        submitBtn.textContent = 'Add Product';
        document.getElementById('modal-product-id').value = ''; 
    }

    if (modal) modal.classList.add('active');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('active');
}

function handleProductSubmit(event) {
    event.preventDefault();
    
    const id = document.getElementById('modal-product-id').value;
    const name = document.getElementById('modal-name').value;
    const price = parseFloat(document.getElementById('modal-price').value);
    const category = document.getElementById('modal-category').value;
    const tagsString = document.getElementById('modal-tags').value;
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    if (id) {
        const index = products.findIndex(p => p.id == id);
        if (index !== -1) {
            products[index] = { ...products[index], name, price, category, tags };
            showToast(`Product ${name} updated successfully.`);
        }
    } else {
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const newProduct = {
            id: newId, 
            name, 
            price, 
            category, 
            color: 'TBD', 
            size: 'TBD', 
            rating: 5, 
            tags, 
            new: true 
        };
        products.push(newProduct);
        showToast(`Product ${name} added successfully.`);
    }

    saveProducts();
    renderProductTable();
    closeProductModal();
}

function deleteProduct(productId) {
    if (confirm(`Are you sure you want to delete Product ID ${productId}?`)) {
        products = products.filter(p => p.id !== productId);
        saveProducts();
        renderProductTable();
        showToast(`Product ID ${productId} deleted.`);
    }
}

// --- Order Management ---

function renderOrderTable() {
    const tbody = document.getElementById('order-table-body');
    if (!tbody) return;

    const orders = [...user.orders].reverse(); // Show newest orders first
    
    tbody.innerHTML = orders.map(order => {
        let statusColor = 'text-blue-600';
        if (order.status === 'Shipped') statusColor = 'text-green-600';
        if (order.status === 'Canceled') statusColor = 'text-red-600';
        
        const customerName = order.shipping.firstName + ' ' + order.shipping.lastName;

        return `
            <tr class="hover:bg-gray-50 border-b border-gray-100">
                <td class="py-3 px-4 text-sm">${order.id}</td>
                <td class="py-3 px-4">${customerName}</td>
                <td class="py-3 px-4 font-bold">${formatPrice(order.totals.total)}</td>
                <td class="py-3 px-4">
                    <span class="${statusColor} font-semibold">${order.status}</span>
                </td>
                <td class="py-3 px-4">
                    <select onchange="updateOrderStatus(${order.id}, this.value)" class="p-1 border border-gray-300 rounded text-sm">
                        <option value="${order.status}">${order.status}</option>
                        <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Canceled" ${order.status === 'Canceled' ? 'selected' : ''}>Canceled</option>
                    </select>
                </td>
            </tr>
        `;
    }).join('');
}

function updateOrderStatus(orderId, newStatus) {
    const orderIndex = user.orders.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
        user.orders[orderIndex].status = newStatus;
        saveUserState(); 
        renderOrderTable(); 
        showToast(`Order #${orderId} status updated to ${newStatus}.`);
    }
}


// ==========================================================
// 7. MISCELLANEOUS UI FUNCTIONS
// ==========================================================

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

function applyCoupon() {
    const couponInput = document.getElementById('coupon-input');
    const coupon = couponInput ? couponInput.value : '';
    if (coupon.length > 0) {
        showToast(`Coupon "${coupon}" applied! (Mock: Discount calculated in totals)`);
        updateCheckoutTotals();
    } else {
        showToast('Please enter a coupon code.');
    }
}

let filteredProducts = products;
function renderProducts(productArray) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = productArray.slice(startIndex, startIndex + productsPerPage);
    
    const totalPages = Math.ceil(productArray.length / productsPerPage);
    const paginationInfo = document.getElementById('pagination-info');
    if (paginationInfo) paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    const productCount = document.getElementById('product-count');
    if (productCount) productCount.textContent = productArray.length;
    
    grid.innerHTML = paginatedProducts.map(product => `
        <article class="product-card bg-white dark-mode:bg-gray-700 p-4 border border-gray-100 dark-mode:border-gray-800 rounded" onclick="navigateTo('product', ${product.id})" tabindex="0" role="link">
            <div class="product-image">
                <span class="text-6xl" aria-hidden="true">${product.id % 2 === 0 ? '👚' : '👖'}</span>
            </div>
            <div class="pt-4">
                <p class="text-sm text-gray-500 dark-mode:text-gray-400">${product.category}</p>
                <h3 class="text-xl font-semibold mt-1">${product.name}</h3>
                <p class="text-lg font-bold mt-2">${formatPrice(product.price)}</p>
                <div class="stars mt-1 text-yellow-500" aria-label="Rating: ${product.rating} out of 5 stars">${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}</div>
                <button class="btn-primary w-full mt-4" onclick="event.stopPropagation(); addToCart(${product.id});">Add to Cart</button>
            </div>
        </article>
    `).join('');
}
function loadFeaturedProducts() {
    const featuredGrid = document.getElementById('featured-products');
    if (!featuredGrid) return;
    const featured = products.filter(p => p.new).slice(0, 4);
    featuredGrid.innerHTML = featured.map(product => `
        <article class="product-card text-center bg-white dark-mode:bg-gray-700 p-4 shadow-sm" onclick="navigateTo('product', ${product.id})" tabindex="0" role="link">
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
    const productTitle = document.getElementById('product-title');
    if(productTitle) productTitle.textContent = product.name;
    const productPrice = document.getElementById('product-price');
    if(productPrice) productPrice.textContent = formatPrice(product.price);
    const productDescription = document.getElementById('product-description');
    if(productDescription) productDescription.textContent = 'This is a detailed description for the ' + product.name + '. It is made of the finest materials and embodies our brand\'s commitment to quality and luxury.';
    const productBreadcrumb = document.getElementById('product-breadcrumb');
    if(productBreadcrumb) productBreadcrumb.textContent = product.name;
    const mainProductImage = document.getElementById('main-product-image');
    if(mainProductImage) mainProductImage.innerHTML = `<span class="text-8xl">${product.id % 2 === 0 ? '👚' : '👖'}</span>`;
    const productSku = document.getElementById('product-sku');
    if(productSku) productSku.textContent = `SKU: LUX-TS-${product.id.toString().padStart(3, '0')}`;
    const cartButton = document.getElementById('detail-add-to-cart');
    if(cartButton) {
        cartButton.onclick = () => { 
            const quantityInput = document.getElementById('quantity-input');
            const quantity = quantityInput ? quantityInput.value : 1;
            addToCart(product.id, quantity); 
        };
    }
}

function sortProducts() {
    const sortSelect = document.getElementById('sort-select');
    if (!sortSelect) return;
    currentSort = sortSelect.value;
    let sortedProducts = [...filteredProducts]; 
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
        case 'newest':
        default:
            sortedProducts.sort((a, b) => b.id - a.id);
            break;
    }
    currentPage = 1;
    renderProducts(sortedProducts);
    filteredProducts = sortedProducts; 
}
function applyFilters() {
    currentFilters = {};
    document.querySelectorAll('.filter-group input:checked').forEach(checkbox => {
        const filterType = checkbox.getAttribute('data-filter');
        const filterValue = checkbox.value;
        if (!currentFilters[filterType]) {
            currentFilters[filterType] = [];
        }
        currentFilters[filterType].push(filterValue);
    });
    filteredProducts = products.filter(product => {
        let passesAllFilters = true;
        for (const type in currentFilters) {
            if (currentFilters[type].length === 0) continue;
            let passesCurrentFilter = false;
            if (type === 'price') {
                currentFilters[type].forEach(range => {
                    const [min, max] = range.split('-').map(Number);
                    if (product.price >= min && product.price <= max) {
                        passesCurrentFilter = true;
                    }
                });
            } else if (type === 'rating') {
                currentFilters[type].forEach(minRating => {
                    if (product.rating >= parseInt(minRating)) {
                        passesCurrentFilter = true;
                    }
                });
            } else {
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
    sortProducts(); // Sorts the new filteredProducts array
}
function clearFilters() {
    document.querySelectorAll('.filter-group input:checked').forEach(checkbox => {
        checkbox.checked = false;
    });
    filteredProducts = products; // Reset filtered products to all products
    currentPage = 1;
    sortProducts(); // Apply sorting to the full list
}
function changePage(direction) {
    const totalProducts = filteredProducts.length; 
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderProducts(filteredProducts); 
    }
}
function changeCurrency(newCurrency) {
    currentCurrency = newCurrency;
    localStorage.setItem('currency', newCurrency);
    // Refresh all pages that show prices
    loadFeaturedProducts();
    renderProductDetail(products.find(p => p.id)?.id || 1); // Refresh detail page
    updateCartDisplay();
    updateCheckoutTotals();
    renderAdminStats();
    renderProductTable();
    renderOrderTable();

    if (document.getElementById('page-shop')?.classList.contains('active')) {
        renderProducts(filteredProducts); 
    }
}
function updateCountdown() {
    const saleEnd = new Date();
    saleEnd.setDate(saleEnd.getDate() + 7);
    function calculateTimeRemaining() {
        const now = new Date().getTime();
        const distance = saleEnd - now;
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        const pad = (num) => num.toString().padStart(2, '0');
        const daysEl = document.getElementById('countdown-days');
        const hoursEl = document.getElementById('countdown-hours');
        const minutesEl = document.getElementById('countdown-minutes');
        const secondsEl = document.getElementById('countdown-seconds');
        if (daysEl && hoursEl && minutesEl && secondsEl) {
             daysEl.textContent = pad(days);
             hoursEl.textContent = pad(hours);
             minutesEl.textContent = pad(minutes);
             secondsEl.textContent = pad(seconds);
        }
        if (distance < 0) {
            clearInterval(timerInterval);
            const promoHeading = document.getElementById('promo-heading');
            if(promoHeading) promoHeading.textContent = "SALE ENDED!";
            const countdownEl = document.querySelector('.countdown');
            if(countdownEl) countdownEl.innerHTML = 'Expired!';
        }
    }
    calculateTimeRemaining();
    const timerInterval = setInterval(calculateTimeRemaining, 1000);
}
// MOCK functions
function filterByCategory(category) { navigateTo('shop'); applyFilters(); showToast(`Filtered by Category: ${category}`); }
function toggleWishlist() { showToast('Wishlist feature is a mockup!'); }
function zoomImage() { showToast('Image Zoom Modal is a mockup!'); }
function showReviews() { showToast('Showing all product reviews!'); }
function selectColor(color, element) { 
    document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById('selected-color').textContent = color; 
}
function selectSize(size, element) { 
    document.querySelectorAll('.size-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById('selected-size').textContent = size; 
}
function toggleSizeGuide() { showToast('Size Guide Modal will open here!'); }
function changeMainImage(element) { showToast('Changing main product image...'); }
