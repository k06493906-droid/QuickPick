// Cart Handler - Manage shopping cart operations

// Get cart from local storage
const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');

// Save cart to local storage
const saveCart = (cart) => localStorage.setItem('cart', JSON.stringify(cart));

// Update cart count in navbar
const updateCartCount = () => {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').textContent = totalItems;
};

// View cart
const viewCart = () => {
  if (!isAuthenticated()) {
    alert('Please login to view cart');
    toggleAuth();
    return;
  }

  navigateTo('cart');
  displayCart();
};

// Display cart items
const displayCart = () => {
  const cart = getCart();
  const cartItemsContainer = document.getElementById('cart-items');

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
    document.getElementById('cart-total').textContent = '0.00';
    return;
  }

  cartItemsContainer.innerHTML = '';
  let total = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.productName}</div>
        <div class="cart-item-quantity">Unit Price: ₹${item.price.toFixed(2)}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQuantity('${item.productId}', ${item.quantity - 1})">-</button>
          <span class="qty-display">Qty: ${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity('${item.productId}', ${item.quantity + 1})">+</button>
        </div>
      </div>
      <div class="cart-item-price">₹${itemTotal.toFixed(2)}</div>
      <button class="btn-remove" onclick="removeFromCart('${item.productId}')">Remove</button>
    `;

    cartItemsContainer.appendChild(cartItem);
  });

  document.getElementById('cart-total').textContent = total.toFixed(2);
};

// Remove item from cart
const removeFromCart = (productId) => {
  let cart = getCart();
  cart = cart.filter((item) => item.productId !== productId);
  saveCart(cart);
  updateCartCount();
  displayCart();
  alert('Item removed from cart');
};

// Update quantity
const updateQuantity = (productId, newQuantity) => {
  let cart = getCart();
  const item = cart.find((i) => i.productId === productId);

  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = newQuantity;
      saveCart(cart);
      updateCartCount();
      displayCart();
    }
  }
};

// Checkout - Show Order Summary Page
const checkout = () => {
  if (!isAuthenticated()) {
    alert('Please login to checkout');
    toggleAuth();
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    alert('Your cart is empty');
    return;
  }

  displayOrderSummary(cart);
};

// Display Order Summary Page
const displayOrderSummary = (cart) => {
  const allSections = document.querySelectorAll('main section, section[id="cart"], section[id="order-summary"], section[id="order-history"]');
  allSections.forEach((s) => {
    s.style.display = 'none';
  });
  
  const orderSummarySection = document.getElementById('order-summary');
  const categoryStrip = document.querySelector('.category-strip');
  
  if (orderSummarySection) orderSummarySection.style.display = 'block';
  if (categoryStrip) categoryStrip.style.display = 'none';

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18;
  const shipping = subtotal > 500 ? 0 : 50;
  const grandTotal = subtotal + tax + shipping;

  const summaryItemsContainer = document.getElementById('summary-items');
  summaryItemsContainer.innerHTML = '';

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'summary-item';
    itemDiv.innerHTML = `
      <div class="item-details">
        <span class="item-name">${item.productName}</span>
        <span class="item-qty">Qty: ${item.quantity}</span>
      </div>
      <div class="item-price">₹${itemTotal.toFixed(2)}</div>
    `;
    summaryItemsContainer.appendChild(itemDiv);
  });

  document.getElementById('subtotal').textContent = subtotal.toFixed(2);
  document.getElementById('tax').textContent = tax.toFixed(2);
  document.getElementById('shipping').textContent = shipping.toFixed(2);
  document.getElementById('grand-total').textContent = grandTotal.toFixed(2);

  document.getElementById('shipping-address').value = '';
  document.getElementById('payment-method').value = '';
  
  window.scrollTo(0, 0);
};

// Confirm Order with Razorpay Integration
const confirmOrder = async () => {
  const shippingAddress = document.getElementById('shipping-address').value;
  const paymentMethod = document.getElementById('payment-method').value;

  if (!shippingAddress.trim()) {
    alert('Please enter a shipping address');
    return;
  }

  if (!paymentMethod) {
    alert('Please select a payment method');
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    alert('Your cart is empty');
    return;
  }

  // Calculate grand total for Razorpay (must match what's displayed)
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18;
  const shipping = subtotal > 500 ? 0 : 50;
  const grandTotal = subtotal + tax + shipping;

  try {
    showNotification('Initializing payment...', 'info');
    
    // 1. Create Razorpay Order in Backend
    const rzpOrder = await paymentAPI.createOrder(grandTotal);
    
    // 2. Configure Razorpay Checkout
    const options = {
      key: 'rzp_test_SXxQ225pe3KBKo', // Test Key
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      name: 'QuickPick',
      description: 'Order Payment',
      order_id: rzpOrder.id,
      handler: async function (response) {
        // This function runs after successful payment
        try {
          showNotification('Payment successful! Finalizing order...', 'info');
          
          // 3. Create the actual order in database after payment success
          const orderResponse = await orderAPI.createOrder(
            cart, 
            shippingAddress, 
            paymentMethod, 
            response.razorpay_payment_id
          );
          
          alert('Order placed successfully! Order ID: ' + orderResponse.order._id);
          localStorage.removeItem('cart');
          updateCartCount();
          
          // Redirect to order history to see the new order
          viewOrderHistory();
        } catch (error) {
          console.error('Order creation failed after payment:', error);
          alert('Payment was successful, but order creation failed. Please contact support with Payment ID: ' + response.razorpay_payment_id);
        }
      },
      prefill: {
        name: 'Guest User', 
        email: 'user@example.com',
        contact: '9999999999', // Prefill contact to ensure all methods like UPI are shown
      },
      config: {
        display: {
          blocks: {
            banks: {
              name: 'Most used methods',
              instruments: [
                {
                  method: 'upi'
                },
                {
                  method: 'card'
                }
              ],
            },
          },
          sequence: ['block.banks'],
          preferences: {
            show_default_blocks: true,
          },
        },
      },
      theme: {
        color: '#667eea',
      },
      modal: {
        ondismiss: function() {
          showNotification('Payment cancelled by user', 'error');
        }
      }
    };

    // 3. Open Razorpay Checkout Popup
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
      alert('Payment Failed: ' + response.error.description);
    });
    rzp.open();
    
  } catch (error) {
    console.error('Payment initialization failed:', error);
    alert('Failed to initialize payment: ' + error.message);
  }
};

// Back to Cart
const backToCart = () => {
  const allSections = document.querySelectorAll('main section, section[id="cart"], section[id="order-summary"], section[id="order-history"]');
  allSections.forEach((s) => {
    s.style.display = 'none';
  });
  
  const cartSection = document.getElementById('cart');
  const categoryStrip = document.querySelector('.category-strip');
  
  if (cartSection) cartSection.style.display = 'block';
  if (categoryStrip) categoryStrip.style.display = 'none';
  
  displayCart();
  window.scrollTo(0, 0);
};

// Initialize cart count on page load
updateCartCount();
