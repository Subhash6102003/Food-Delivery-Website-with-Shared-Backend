// Food Delivery Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Debug logging to check if script is running
    console.log("Script loaded and running");
    
    // Check if all sections exist and log their heights
    console.log("Hero section exists:", !!document.querySelector('.hero'));
    console.log("Restaurants section exists:", !!document.querySelector('#restaurants'));
    console.log("Donate section exists:", !!document.querySelector('#donate'));
    console.log("NGO section exists:", !!document.querySelector('#ngo'));
    
    if(document.querySelector('.hero')) {
        console.log("Hero section height:", document.querySelector('.hero').offsetHeight);
    }
    if(document.querySelector('#restaurants')) {
        console.log("Restaurants section height:", document.querySelector('#restaurants').offsetHeight);
    }
    if(document.querySelector('#donate')) {
        console.log("Donate section height:", document.querySelector('#donate').offsetHeight);
    }
    if(document.querySelector('#ngo')) {
        console.log("NGO section height:", document.querySelector('#ngo').offsetHeight);
    }
    
    // Remove GSAP and Three.js checks
    
    // API base URL - Updated to use the new MongoDB-backed API
    const API_BASE_URL = 'http://localhost:5001/api';
    
    // Global state
    const state = {
        cart: [],
        user: null,
        activeRestaurant: null,
        activeCategory: 'all',
        menuItems: {},
        previousOrders: []
    };
    
    // ===== Utility Functions =====
    
    // Show toast notification
    const showToast = (message, type = 'info', duration = 3000) => {
        const toastContainer = document.querySelector('.toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${iconMap[type]}"></i>
            <div class="toast-content">
                <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">&times;</button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Simple show animation without GSAP
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Set up close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        });
        
        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentElement) toast.remove();
                }, 300);
            }
        }, duration);
    };
    
    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };
    
    // Toggle modal visibility
    const toggleModal = (modalId, show = true) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        if (show) {
            modal.classList.add('active');
            setTimeout(() => {
                if (modal.querySelector('.modal-content')) {
                    modal.querySelector('.modal-content').style.opacity = '1';
                    modal.querySelector('.modal-content').style.transform = 'translateY(0)';
                }
            }, 10);
        } else {
            if (modal.querySelector('.modal-content')) {
                modal.querySelector('.modal-content').style.opacity = '0';
                modal.querySelector('.modal-content').style.transform = 'translateY(-50px)';
            }
            setTimeout(() => {
                modal.classList.remove('active');
            }, 300);
        }
    };
    
    // ===== API Functions =====

    // API request handler
    const apiRequest = async (endpoint, method = 'GET', data = null) => {
        try {
            // Set up request options
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            // Add auth token if user is logged in
            if (state.user && state.user.token) {
                options.headers['Authorization'] = `Bearer ${state.user.token}`;
            }
            
            // Add body for non-GET requests
            if (method !== 'GET' && data) {
                options.body = JSON.stringify(data);
            }
            
            // Make the request
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Something went wrong');
            }
            
            return result;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    };
    
    // ===== Mobile Navigation Toggle =====
    const setupMobileNav = () => {
        // This would be implemented with a hamburger menu for mobile devices
        console.log('Mobile navigation setup complete');
    };

    // ===== Authentication =====
    
    // Auth Modal Tabs
    const setupAuthModal = () => {
        // Tab switching
        const tabBtns = document.querySelectorAll('.modal-tab .tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabName = this.dataset.tab;
                
                // Update active tab button
                tabBtns.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Show the correct form
                const forms = document.querySelectorAll('.auth-form');
                forms.forEach(form => {
                    form.style.display = 'none';
                });
                document.getElementById(`${tabName}Form`).style.display = 'flex';
            });
        });
        
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                
                if (!email || !password) {
                    showToast('Please fill in all fields', 'error');
                    return;
                }
                
                try {
                    showToast('Logging in...', 'info');
                    
                    // Call the login API endpoint
                    const result = await apiRequest('/auth/login', 'POST', { email, password });
                    
                    // Store user data in state
                    state.user = {
                        ...result.user,
                        token: result.token
                    };
                    
                    // Save user data to local storage for persistence
                    localStorage.setItem('foodDeliveryUser', JSON.stringify(state.user));
                    
                    // Update UI for logged in user
                    updateUserUI();
                    
                    // Close modal and show success message
                    toggleModal('authModal', false);
                    showToast(result.message || 'Successfully logged in!', 'success');
                } catch (error) {
                    showToast(error.message || 'Login failed', 'error');
                }
            });
        }
        
        // Sign up form submission
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const name = document.getElementById('signupName').value;
                const email = document.getElementById('signupEmail').value;
                const password = document.getElementById('signupPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                
                if (!name || !email || !password || !confirmPassword) {
                    showToast('Please fill in all fields', 'error');
                    return;
                }
                
                if (password !== confirmPassword) {
                    showToast('Passwords do not match', 'error');
                    return;
                }
                
                try {
                    showToast('Creating account...', 'info');
                    
                    // Call the register API endpoint
                    const result = await apiRequest('/auth/register', 'POST', { name, email, password });
                    
                    // Store user data in state
                    state.user = {
                        ...result.user,
                        token: result.token
                    };
                    
                    // Save user data to local storage for persistence
                    localStorage.setItem('foodDeliveryUser', JSON.stringify(state.user));
                    
                    // Update UI for logged in user
                    updateUserUI();
                    
                    // Close modal and show success message
                    toggleModal('authModal', false);
                    showToast(result.message || 'Account created successfully!', 'success');
                } catch (error) {
                    showToast(error.message || 'Registration failed', 'error');
                }
            });
        }
        
        // Password toggle visibility
        const togglePasswordBtns = document.querySelectorAll('.toggle-password');
        togglePasswordBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const passwordInput = this.parentElement.querySelector('input');
                const icon = this.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
        
        // Social login buttons (simulated)
        document.querySelectorAll('.provider-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const provider = this.classList[1]; // google, facebook, etc.
                
                // In a real app, this would call an OAuth endpoint
                showToast(`Logging in with ${provider}...`, 'info');
                
                setTimeout(() => {
                    // Simulate successful social login
                    state.user = {
                        id: 999,
                        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
                        email: `user@${provider}.com`,
                        token: 'mock-oauth-token'
                    };
                    
                    // Save to local storage
                    localStorage.setItem('foodDeliveryUser', JSON.stringify(state.user));
                    
                    updateUserUI();
                    toggleModal('authModal', false);
                    showToast('Successfully logged in with social account!', 'success');
                }, 1500);
            });
        });
    };
    
    // Update UI based on user authentication state
    const updateUserUI = () => {
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const userDropdown = document.getElementById('userDropdown');
        
        if (state.user) {
            // User is logged in
            loginBtn.style.display = 'none';
            signupBtn.style.display = 'none';
            userDropdown.style.display = 'block';
            
            // Update user info
            userDropdown.querySelector('.avatar').textContent = state.user.name.charAt(0);
            userDropdown.querySelector('.username').textContent = state.user.name;
            
            // Load user's previous orders if they exist
            loadUserOrders();
        } else {
            // User is logged out
            loginBtn.style.display = 'inline-block';
            signupBtn.style.display = 'inline-block';
            userDropdown.style.display = 'none';
        }
    };
    
    // Handle user dropdown
    const setupUserDropdown = () => {
        const dropdownToggle = document.querySelector('.user-dropdown-toggle');
        const dropdownContent = document.querySelector('.user-dropdown-content');
        
        if (dropdownToggle && dropdownContent) {
            dropdownToggle.addEventListener('click', () => {
                dropdownContent.classList.toggle('active');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.user-dropdown')) {
                    dropdownContent.classList.remove('active');
                }
            });
            
            // Logout button
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Clear user state
                    state.user = null;
                    localStorage.removeItem('foodDeliveryUser');
                    
                    // Clear orders
                    state.previousOrders = [];
                    
                    updateUserUI();
                    dropdownContent.classList.remove('active');
                    showToast('You have been logged out', 'info');
                });
            }
        }
    };
    
    // ===== Cart Functionality =====
    
    // Add item to cart
    const addToCart = (item, quantity = 1) => {
        // Check if item already in cart
        const existingItem = state.cart.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            // Update quantity if already in cart
            existingItem.quantity += quantity;
        } else {
            // Add new item to cart
            state.cart.push({
                ...item,
                quantity
            });
        }
        
        // Save cart to local storage
        localStorage.setItem('foodDeliveryCart', JSON.stringify(state.cart));
        
        // Update cart UI
        updateCartUI();
        showToast(`Added ${item.name} to cart`, 'success');
    };
    
    // Remove item from cart
    const removeFromCart = (itemId) => {
        const itemIndex = state.cart.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            const removedItem = state.cart.splice(itemIndex, 1)[0];
            
            // Update local storage
            localStorage.setItem('foodDeliveryCart', JSON.stringify(state.cart));
            
            updateCartUI();
            showToast(`Removed ${removedItem.name} from cart`, 'info');
        }
    };
    
    // Update item quantity in cart
    const updateCartItemQuantity = (itemId, newQuantity) => {
        const item = state.cart.find(item => item.id === itemId);
        
        if (item) {
            if (newQuantity <= 0) {
                removeFromCart(itemId);
            } else {
                item.quantity = newQuantity;
                
                // Update local storage
                localStorage.setItem('foodDeliveryCart', JSON.stringify(state.cart));
                
                updateCartUI();
            }
        }
    };
    
    // Calculate cart totals
    const calculateCartTotals = () => {
        const subtotal = state.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        
        const deliveryFee = subtotal > 0 ? 2.99 : 0;
        const tax = subtotal * 0.08; // 8% tax rate
        const total = subtotal + deliveryFee + tax;
        
        return {
            subtotal,
            deliveryFee,
            tax,
            total
        };
    };
    
    // Update cart UI elements
    const updateCartUI = () => {
        // Update cart icon/indicator in navbar if it exists
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = state.cart.reduce((count, item) => count + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        // Update cart modal if it's open
        const cartItemsContainer = document.querySelector('.cart-items');
        
        if (cartItemsContainer) {
            // Clear current items
            cartItemsContainer.innerHTML = '';
            
            if (state.cart.length === 0) {
                // Show empty cart message
                const emptyMsg = document.createElement('div');
                emptyMsg.className = 'empty-cart-message';
                emptyMsg.textContent = 'Your cart is empty';
                cartItemsContainer.appendChild(emptyMsg);
            } else {
                // Add items to cart
                state.cart.forEach(item => {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <div class="cart-item-details">
                            <div class="cart-item-title">${item.name}</div>
                            <div class="cart-item-price">${formatCurrency(item.price)}</div>
                        </div>
                        <div class="cart-item-actions">
                            <div class="item-quantity">
                                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                                <span class="quantity-value">${item.quantity}</span>
                                <button class="quantity-btn increase" data-id="${item.id}">+</button>
                            </div>
                            <button class="remove-item" data-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    cartItemsContainer.appendChild(cartItem);
                    
                    // Add event listeners for quantity buttons
                    cartItem.querySelector('.decrease').addEventListener('click', () => {
                        updateCartItemQuantity(item.id, item.quantity - 1);
                    });
                    
                    cartItem.querySelector('.increase').addEventListener('click', () => {
                        updateCartItemQuantity(item.id, item.quantity + 1);
                    });
                    
                    cartItem.querySelector('.remove-item').addEventListener('click', () => {
                        removeFromCart(item.id);
                    });
                });
            }
        }
        
        // Update cart totals
        const totals = calculateCartTotals();
        
        // Update subtotal, delivery fee, tax, and total in the cart modal
        const subtotalEl = document.querySelector('.cart-summary .cart-total:nth-child(1) .cart-total-value');
        const deliveryEl = document.querySelector('.cart-summary .cart-total:nth-child(2) .cart-total-value');
        const taxEl = document.querySelector('.cart-summary .cart-total:nth-child(3) .cart-total-value');
        const totalEl = document.querySelector('.cart-summary .cart-total:nth-child(4) .cart-total-value');
        
        if (subtotalEl) subtotalEl.textContent = formatCurrency(totals.subtotal);
        if (deliveryEl) deliveryEl.textContent = formatCurrency(totals.deliveryFee);
        if (taxEl) taxEl.textContent = formatCurrency(totals.tax);
        if (totalEl) totalEl.textContent = formatCurrency(totals.total);
        
        // Update mini cart summary in menu modal if it exists
        const miniCartTotal = document.querySelector('.cart-summary-mini strong');
        if (miniCartTotal) {
            miniCartTotal.textContent = formatCurrency(totals.total);
        }
    };

    // ===== Menu and Restaurant Functionality =====
    
    // Fetch restaurants from the API
    const fetchRestaurants = async () => {
        try {
            const result = await apiRequest('/restaurants');
            return result.data;
        } catch (error) {
            showToast('Failed to load restaurants', 'error');
            return [];
        }
    };
    
    // Fetch menu for a specific restaurant
    const fetchRestaurantMenu = async (restaurantId) => {
        try {
            const result = await apiRequest(`/restaurants/${restaurantId}/menu`);
            return result.data;
        } catch (error) {
            showToast('Failed to load menu items', 'error');
            return [];
        }
    };
    
    // Populate restaurant cards on the page
    const populateRestaurants = async () => {
        const restaurantGrid = document.querySelector('.restaurant-grid');
        if (!restaurantGrid) return;
        
        try {
            // Show loading state
            restaurantGrid.innerHTML = '<div class="loading">Loading restaurants...</div>';
            
            // Fetch restaurants from API
            const restaurants = await fetchRestaurants();
            
            // Clear loading state
            restaurantGrid.innerHTML = '';
            
            if (restaurants.length === 0) {
                restaurantGrid.innerHTML = '<div class="empty-message">No restaurants found</div>';
                return;
            }
            
            // Add restaurant cards
            restaurants.forEach(restaurant => {
                const card = document.createElement('div');
                card.className = 'restaurant-card';
                card.innerHTML = `
                    <div class="restaurant-image">
                        <img src="${restaurant.image}" alt="${restaurant.name}">
                        <span class="rating"><i class="fas fa-star"></i> ${restaurant.rating}</span>
                    </div>
                    <div class="restaurant-info">
                        <h3>${restaurant.name}</h3>
                        <p class="cuisine">${restaurant.cuisine}</p>
                        <div class="restaurant-meta">
                            <span><i class="fas fa-clock"></i> ${restaurant.deliveryTime}</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${restaurant.distance}</span>
                        </div>
                    </div>
                `;
                restaurantGrid.appendChild(card);
                
                // Add click event to open restaurant menu
                card.addEventListener('click', () => {
                    openRestaurantMenu(restaurant.id);
                });
            });
        } catch (error) {
            restaurantGrid.innerHTML = '<div class="error-message">Failed to load restaurants</div>';
            console.error('Error loading restaurants:', error);
        }
    };
    
    // Open restaurant menu modal
    const openRestaurantMenu = async (restaurantId) => {
        try {
            // Show loading
            toggleModal('menuModal', true);
            document.querySelector('.menu-items').innerHTML = '<div class="loading">Loading menu...</div>';
            
            // Set active restaurant
            state.activeRestaurant = restaurantId;
            
            // Fetch restaurant details
            const restaurantResult = await apiRequest(`/restaurants/${restaurantId}`);
            const restaurant = restaurantResult.data;
            
            // Fetch menu items
            const menuItems = await fetchRestaurantMenu(restaurantId);
            
            // Update modal with restaurant info
            const restaurantNameEl = document.getElementById('restaurantName');
            const restaurantCuisineEl = document.getElementById('restaurantCuisine');
            const restaurantRatingEl = document.getElementById('restaurantRating');
            const restaurantTimeEl = document.getElementById('restaurantTime');
            
            if (restaurantNameEl) restaurantNameEl.textContent = restaurant.name;
            if (restaurantCuisineEl) restaurantCuisineEl.textContent = restaurant.cuisine;
            if (restaurantRatingEl) restaurantRatingEl.textContent = restaurant.rating;
            if (restaurantTimeEl) restaurantTimeEl.textContent = restaurant.deliveryTime;
            
            // Reset active category
            state.activeCategory = 'all';
            document.querySelectorAll('.menu-category').forEach(item => {
                if (item.dataset.category === 'all') {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // Populate menu items
            populateMenuItems(menuItems);
            
        } catch (error) {
            showToast('Failed to open restaurant menu', 'error');
            toggleModal('menuModal', false);
            console.error('Error opening restaurant menu:', error);
        }
    };
    
    // Populate menu items in the menu modal
    const populateMenuItems = (items) => {
        const menuItemsContainer = document.querySelector('.menu-items');
        if (!menuItemsContainer) return;
        
        // Clear current items
        menuItemsContainer.innerHTML = '';
        
        // Filter items based on active category
        const filteredItems = state.activeCategory === 'all' ? 
            items : 
            items.filter(item => item.category === state.activeCategory);
        
        if (filteredItems.length === 0) {
            menuItemsContainer.innerHTML = '<div class="empty-category">No items in this category</div>';
            return;
        }
        
        // Add items to menu
        filteredItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.innerHTML = `
                <div class="menu-item-details">
                    <h4 class="menu-item-name">${item.name}</h4>
                    <p class="menu-item-description">${item.description}</p>
                    <div class="menu-item-price">${formatCurrency(item.price)}</div>
                </div>
                <div class="menu-item-actions">
                    <button class="btn btn-primary btn-sm add-to-cart" data-id="${item.id}">Add to Cart</button>
                </div>
            `;
            menuItemsContainer.appendChild(menuItem);
            
            // Add click event for add to cart button
            menuItem.querySelector('.add-to-cart').addEventListener('click', () => {
                addToCart(item);
            });
        });
    };
    
    // Setup menu category filters
    const setupMenuCategories = () => {
        const categoryButtons = document.querySelectorAll('.menu-category');
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', async function() {
                // Update active category button
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Set active category
                state.activeCategory = this.dataset.category;
                
                try {
                    // Get current restaurant items
                    const menuItems = await fetchRestaurantMenu(state.activeRestaurant);
                    
                    // Populate filtered menu items
                    populateMenuItems(menuItems);
                } catch (error) {
                    console.error('Error filtering menu items:', error);
                }
            });
        });
    };

    // ===== Donation Functionality =====
    
    // Submit donation form
    const submitDonation = async (donationData) => {
        try {
            // Add user ID if logged in
            if (state.user) {
                donationData.userId = state.user.id;
            }
            
            const result = await apiRequest('/donations', 'POST', donationData);
            return result;
        } catch (error) {
            throw error;
        }
    };
    
    // Fetch NGO partners
    const fetchNgoPartners = async () => {
        try {
            const result = await apiRequest('/ngos');
            return result.data;
        } catch (error) {
            showToast('Failed to load NGO partners', 'error');
            return [];
        }
    };
    
    // Populate NGO partners on the page
    const populateNgoPartners = async () => {
        const ngoGrid = document.querySelector('.ngo-grid');
        if (!ngoGrid) return;
        
        try {
            // Show loading state
            ngoGrid.innerHTML = '<div class="loading">Loading NGO partners...</div>';
            
            // Fetch NGO partners from API
            const ngoPartners = await fetchNgoPartners();
            
            // Clear loading state
            ngoGrid.innerHTML = '';
            
            if (ngoPartners.length === 0) {
                ngoGrid.innerHTML = '<div class="empty-message">No NGO partners found</div>';
                return;
            }
            
            // Add NGO cards
            ngoPartners.forEach(ngo => {
                const card = document.createElement('div');
                card.className = 'ngo-card';
                card.innerHTML = `
                    <div class="ngo-logo">
                        <img src="https://placehold.co/150x150/1e1e1e/4CAF50/?text=NGO" alt="${ngo.name}">
                    </div>
                    <h3>${ngo.name}</h3>
                    <p>${ngo.description}</p>
                    <button class="btn btn-outline btn-sm">Learn More</button>
                `;
                ngoGrid.appendChild(card);
            });
        } catch (error) {
            ngoGrid.innerHTML = '<div class="error-message">Failed to load NGO partners</div>';
            console.error('Error loading NGO partners:', error);
        }
    };

    // ===== Order Functionality =====
    
    // Place order
    const placeOrder = async (orderData) => {
        try {
            // Add user ID if logged in
            if (state.user) {
                orderData.userId = state.user.id;
            } else {
                throw new Error('You must be logged in to place an order');
            }
            
            const result = await apiRequest('/orders', 'POST', orderData);
            return result;
        } catch (error) {
            throw error;
        }
    };
    
    // Get user orders
    const getUserOrders = async () => {
        if (!state.user) return [];
        
        try {
            const result = await apiRequest(`/users/${state.user.id}/orders`);
            return result.data;
        } catch (error) {
            showToast('Failed to load your orders', 'error');
            return [];
        }
    };
    
    // Load and display user's previous orders
    const loadUserOrders = async () => {
        const ordersSection = document.getElementById('orders');
        if (!ordersSection || !state.user) return;
        
        try {
            // Fetch orders
            const orders = await getUserOrders();
            state.previousOrders = orders;
            
            // Get the container for orders
            const ordersContainer = ordersSection.querySelector('.orders-container') || 
                                   ordersSection.querySelector('.section-content');
            
            // If no container exists, create one
            if (!ordersContainer) {
                const newContainer = document.createElement('div');
                newContainer.className = 'orders-container';
                ordersSection.appendChild(newContainer);
                
                // Add the section header if it doesn't exist
                if (!ordersSection.querySelector('.section-header')) {
                    const header = document.createElement('div');
                    header.className = 'section-header';
                    header.innerHTML = '<h2>Your Orders</h2>';
                    ordersSection.insertBefore(header, newContainer);
                }
                
                populateOrdersUI(newContainer, orders);
            } else {
                populateOrdersUI(ordersContainer, orders);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };
    
    // Populate the orders UI with order data
    const populateOrdersUI = (container, orders) => {
        // Clear the container
        container.innerHTML = '';
        
        if (orders.length === 0) {
            container.innerHTML = '<div class="empty-message">You have no previous orders</div>';
            return;
        }
        
        // Create an order card for each order
        orders.forEach(order => {
            // Find the restaurant name
            const restaurant = mockDB.restaurants.find(r => r.id === order.restaurantId);
            const restaurantName = restaurant ? restaurant.name : 'Unknown Restaurant';
            
            const orderDate = new Date(order.createdAt).toLocaleDateString();
            
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            
            // Calculate the total items
            const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
            
            orderCard.innerHTML = `
                <div class="order-header">
                    <div class="order-restaurant">
                        <h3>${restaurantName}</h3>
                        <span class="order-date">${orderDate}</span>
                    </div>
                    <div class="order-status ${order.status}">
                        ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                </div>
                <div class="order-details">
                    <div class="order-summary">
                        <div class="order-items-count">
                            ${totalItems} item${totalItems !== 1 ? 's' : ''}
                        </div>
                        <div class="order-total">
                            ${formatCurrency(order.totalAmount)}
                        </div>
                    </div>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <span class="order-item-name">${item.name}</span>
                                <span class="order-item-quantity">×${item.quantity}</span>
                                <span class="order-item-price">${formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="order-actions">
                    <button class="btn btn-outline btn-sm">Reorder</button>
                    <button class="btn btn-primary btn-sm">Track Order</button>
                </div>
            `;
            
            container.appendChild(orderCard);
            
            // Add click event for the reorder button
            orderCard.querySelector('.order-actions .btn-outline').addEventListener('click', () => {
                // Add all items from this order to the cart
                order.items.forEach(item => {
                    addToCart(item, item.quantity);
                });
                
                showToast('Items added to cart', 'success');
            });
        });
    };

    // ===== Event Listeners =====
    
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                toggleModal(modal.id, false);
            }
        });
    });
    
    // Also close modal when clicking outside content
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                toggleModal(this.id, false);
            }
        });
    });
    
    // Open auth modal
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            document.querySelector('.tab-btn[data-tab="login"]').click();
            toggleModal('authModal', true);
        });
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            document.querySelector('.tab-btn[data-tab="signup"]').click();
            toggleModal('authModal', true);
        });
    }
    
    // Cart modal buttons
    const viewCartBtn = document.getElementById('viewCartBtn');
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', () => {
            toggleModal('menuModal', false);
            setTimeout(() => {
                toggleModal('cartModal', true);
            }, 300);
        });
    }
    
    const continueShopping = document.getElementById('continueShopping');
    if (continueShopping) {
        continueShopping.addEventListener('click', () => {
            toggleModal('cartModal', false);
            setTimeout(() => {
                toggleModal('menuModal', true);
            }, 300);
        });
    }
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            if (state.cart.length === 0) {
                showToast('Your cart is empty', 'warning');
                return;
            }
            
            // Check if user is logged in
            if (!state.user) {
                showToast('Please log in to place an order', 'warning');
                toggleModal('cartModal', false);
                setTimeout(() => {
                    document.querySelector('.tab-btn[data-tab="login"]').click();
                    toggleModal('authModal', true);
                }, 300);
                return;
            }
            
            try {
                // Create order object
                const orderData = {
                    userId: state.user.id,
                    restaurantId: state.activeRestaurant,
                    items: state.cart,
                    totalAmount: calculateCartTotals().total,
                    deliveryAddress: 'Default Address' // In a real app, you would let the user choose an address
                };
                
                // Show processing message
                showToast('Processing your order...', 'info');
                toggleModal('cartModal', false);
                
                // Place the order
                const result = await placeOrder(orderData);
                
                // Clear cart after successful order
                state.cart = [];
                localStorage.removeItem('foodDeliveryCart');
                updateCartUI();
                
                // Refresh orders
                await loadUserOrders();
                
                // Show success message
                showToast(result.message || 'Order placed successfully! Your food will arrive soon.', 'success', 5000);
            } catch (error) {
                showToast(error.message || 'Failed to place order', 'error');
                console.error('Order placement error:', error);
            }
        });
    }
    
    // Hero buttons
    const orderFoodBtn = document.getElementById('orderFoodBtn');
    if (orderFoodBtn) {
        orderFoodBtn.addEventListener('click', () => {
            const restaurantsSection = document.getElementById('restaurants');
            if (restaurantsSection) {
                restaurantsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    const donateFoodBtn = document.getElementById('donateFoodBtn');
    if (donateFoodBtn) {
        donateFoodBtn.addEventListener('click', () => {
            const donateSection = document.getElementById('donate');
            if (donateSection) {
                donateSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // NGO card buttons
    const ngoButtons = document.querySelectorAll('.ngo-card .btn');
    ngoButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const ngoName = this.closest('.ngo-card').querySelector('h3').textContent;
            showToast(`Loading more information about ${ngoName}...`, 'info');
        });
    });
    
    // NGO CTA button
    const ngoRegisterBtn = document.querySelector('.ngo-cta .btn');
    if (ngoRegisterBtn) {
        ngoRegisterBtn.addEventListener('click', () => {
            toggleModal('ngoModal', true);
        });
    }
    
    // NGO Registration Form
    const ngoRegistrationForm = document.getElementById('ngoRegistrationForm');
    if (ngoRegistrationForm) {
        ngoRegistrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulate form submission
            showToast('Processing your application...', 'info');
            
            setTimeout(() => {
                toggleModal('ngoModal', false);
                showToast('Your NGO registration has been submitted for review!', 'success', 5000);
                this.reset();
            }, 2000);
        });
    }
    
    // Form Submission Handling for Donation Form
    const donationForm = document.querySelector('.donate-form form');
    if (donationForm) {
        donationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const reason = document.getElementById('donationReason').value;
            const quantity = document.getElementById('quantity').value;
            const freshness = document.getElementById('freshness').value;
            const address = document.getElementById('address').value;
            
            // Validate form
            if (!reason || !quantity || !freshness || !address) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            try {
                // Show processing message
                showToast('Processing donation...', 'info');
                
                // Create donation object
                const donationData = {
                    reason,
                    quantity,
                    freshness,
                    address
                };
                
                // Submit donation
                const result = await submitDonation(donationData);
                
                // Show success message and reset form
                showToast(result.message || 'Thank you for your donation! An NGO representative will contact you soon.', 'success', 5000);
                donationForm.reset();
            } catch (error) {
                showToast(error.message || 'Failed to submit donation', 'error');
                console.error('Donation submission error:', error);
            }
        });
    }
    
    // Newsletter Subscription
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            if (!email) {
                showToast('Please enter your email address', 'error');
                return;
            }
            
            // Simulate form submission
            showToast('Subscribing...', 'info');
            
            setTimeout(() => {
                showToast('Thank you for subscribing to our newsletter!', 'success');
                this.reset();
            }, 1500);
        });
    }
    
    // Remove all GSAP and Three.js animation code
    
    // Add simple button hover effects with plain CSS classes
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.classList.add('btn-hover');
        });
        
        button.addEventListener('mouseleave', () => {
            button.classList.remove('btn-hover');
        });
    });

    // Setup navigation links
    const setupNavLinks = () => {
        const navLinks = document.querySelectorAll('.nav-links li a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Remove active class from all links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to clicked link
                this.classList.add('active');
            });
        });
    };

    // ===== Initialization =====
    const init = async () => {
        // Check for saved user data
        const savedUser = localStorage.getItem('foodDeliveryUser');
        if (savedUser) {
            try {
                state.user = JSON.parse(savedUser);
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                localStorage.removeItem('foodDeliveryUser');
            }
        }
        
        // Check for saved cart data
        const savedCart = localStorage.getItem('foodDeliveryCart');
        if (savedCart) {
            try {
                state.cart = JSON.parse(savedCart);
            } catch (error) {
                console.error('Error parsing saved cart data:', error);
                localStorage.removeItem('foodDeliveryCart');
            }
        }
        
        setupMobileNav();
        setupAuthModal();
        setupUserDropdown();
        setupMenuCategories();
        setupNavLinks(); // Setup navigation links active state
        updateUserUI();
        updateCartUI();
        
        // Populate data from API
        await populateRestaurants();
        await populateNgoPartners();
    };
    
    init();
    
    // Setup logout functionality
    setupLogout();
    
    // Initialize auth UI
    updateAuthUI();
});

// Implement proper logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                // Call logout API
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                // Clear local storage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('cart');
                
                // Show success message
                showNotification('Successfully logged out!', 'success');
                
                // Update UI to reflect logged out state
                updateAuthUI();
                
                // Redirect to home page
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
                
            } catch (error) {
                console.error('Logout error:', error);
                
                // Even if API call fails, clear local storage and update UI
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('cart');
                
                updateAuthUI();
                showNotification('Logged out successfully', 'success');
                
                // Redirect to home page
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        });
    }
}

// Update auth UI based on login state
function updateAuthUI() {
    const authLinks = document.querySelector('.auth-links');
    const userInfo = document.querySelector('.user-info');
    const userAvatar = document.querySelector('.user-avatar');
    const userName = document.querySelector('.user-name');
    const logoutBtn = document.getElementById('logoutBtn');
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && user.name) {
        // User is logged in
        if (authLinks) authLinks.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'flex';
            if (userAvatar) userAvatar.textContent = user.name.charAt(0).toUpperCase();
            if (userName) userName.textContent = user.name;
        }
    } else {
        // User is logged out
        if (authLinks) authLinks.style.display = 'flex';
        if (userInfo) userInfo.style.display = 'none';
    }
}