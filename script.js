document.addEventListener('DOMContentLoaded', () => {

    // --- 1. PREMIUM FEATURE: CART SIMULATION ---

    const cartCounter = document.getElementById('cart-counter');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const confirmMessage = document.getElementById('cart-confirm-message');
    let cartCount = 0;

    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            cartCount++;
            cartCounter.textContent = cartCount;

            // Show confirmation message
            confirmMessage.textContent = 'Item added to cart!';
            confirmMessage.classList.add('show');

            // Hide after 2 seconds
            setTimeout(() => {
                confirmMessage.classList.remove('show');
            }, 2000);
        });
    });


    // --- 2. PREMIUM FEATURE: PRODUCT FILTERING & SORTING ---

    const productList = document.getElementById('product-list');
    const productCards = Array.from(productList.querySelectorAll('.product-card'));
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-select');

    // Filtering Logic
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.getAttribute('data-filter');

            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            productCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Sorting Logic
    sortSelect.addEventListener('change', () => {
        const sortValue = sortSelect.value;
        const sortedProducts = productCards.sort((a, b) => {
            const priceA = parseFloat(a.getAttribute('data-price'));
            const priceB = parseFloat(b.getAttribute('data-price'));
            const ratingA = parseFloat(a.getAttribute('data-rating'));
            const ratingB = parseFloat(b.getAttribute('data-rating'));

            if (sortValue === 'price-asc') {
                return priceA - priceB;
            } else if (sortValue === 'price-desc') {
                return priceB - priceA;
            } else if (sortValue === 'rating-desc') {
                return ratingB - ratingA; // Highest rating first
            }
            return 0; // default
        });

        // Re-append products in the new order
        sortedProducts.forEach(card => {
            productList.appendChild(card);
        });
    });


    // --- 3. PREMIUM FEATURE: MULTI-LINGUAL SUPPORT ---

    const translations = {
        'en': {
            announcement: '✦ FREE SHIPPING WORLDWIDE ON ALL ORDERS ✦',
            home: 'Home',
            shop: 'Shop',
            cart: 'Cart',
            account: 'Account',
            admin: 'Admin Dashboard',
            hero_title: 'Complete E-commerce Template',
            hero_subtitle: 'A fully-featured static template with all essential pages for fast deployment.',
            shop_now: 'Shop Now',
            featured_title: 'Featured Products',
            featured_subtitle: 'Handpicked selections for you',
            all_products_title: 'All Products',
            all_products_subtitle: 'Explore our complete collection',
            sort_by: 'Sort By:',
            sort_default: 'Default',
            sort_price_asc: 'Price: Low to High',
            sort_price_desc: 'Price: High to Low',
            sort_rating_desc: 'Rating',
            subtotal: 'Subtotal:',
            shipping: 'Shipping:',
            total: 'Total:',
            proceed_checkout: 'Proceed to Checkout',
            detail_title: 'Product Detail Mockup (Silk Evening Dress)',
            product_detail_desc: 'Luxurious silk dress perfect for any evening occasion. Features a minimalist design with a flattering silhouette.',
            reviews_title: 'Customer Reviews (3)',
            related_title: 'Related Products',
        },
        'es': {
            announcement: '✦ ENVÍO GRATIS A TODO EL MUNDO EN TODOS LOS PEDIDOS ✦',
            home: 'Inicio',
            shop: 'Tienda',
            cart: 'Carrito',
            account: 'Cuenta',
            admin: 'Panel de Admin',
            hero_title: 'Plantilla de Comercio Electrónico Completa',
            hero_subtitle: 'Una plantilla estática con todas las páginas esenciales para una implementación rápida.',
            shop_now: 'Comprar Ahora',
            featured_title: 'Productos Destacados',
            featured_subtitle: 'Selecciones escogidas para ti',
            all_products_title: 'Todos los Productos',
            all_products_subtitle: 'Explora nuestra colección completa',
            sort_by: 'Ordenar Por:',
            sort_default: 'Defecto',
            sort_price_asc: 'Precio: Bajo a Alto',
            sort_price_desc: 'Precio: Alto a Bajo',
            sort_rating_desc: 'Puntuación',
            subtotal: 'Subtotal:',
            shipping: 'Envío:',
            total: 'Total:',
            proceed_checkout: 'Proceder al Pago',
            detail_title: 'Maqueta de Detalle de Producto (Vestido de Seda)',
            product_detail_desc: 'Lujoso vestido de seda perfecto para cualquier ocasión nocturna. Presenta un diseño minimalista con una silueta favorecedora.',
            reviews_title: 'Opiniones de Clientes (3)',
            related_title: 'Productos Relacionados',
        }
    };

    const langButtons = document.querySelectorAll('.lang-switcher');
    let currentLang = 'en';

    function setLanguage(lang) {
        currentLang = lang;
        document.querySelectorAll('.lang-text').forEach(element => {
            const key = element.getAttribute('data-lang-key');
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });
        document.documentElement.lang = lang; // Set HTML lang attribute
    }

    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const newLang = button.getAttribute('data-lang');
            setLanguage(newLang);
        });
    });

    // Set initial language
    setLanguage(currentLang);

});
