// Navigation System
function navigateTo(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    // Show the selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
        window.scrollTo(0, 0); // Scroll to top
    } else {
        console.error('Page not found:', pageId);
    }
}

// Cart Logic
let cartCount = 0;

function addToCart() {
    cartCount++;
    const badge = document.getElementById('cart-badge');
    badge.innerText = cartCount;
    
    // Optional: Animation for the button
    alert("Item added to cart!");
}
