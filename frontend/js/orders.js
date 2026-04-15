// Order History Handler - View past orders

// View Order History
const viewOrderHistory = async () => {
  if (!isAuthenticated()) {
    alert('Please login to view order history');
    toggleAuth();
    return;
  }

  const allSections = document.querySelectorAll('main section, section[id="cart"], section[id="order-summary"], section[id="order-history"]');
  allSections.forEach((s) => {
    s.style.display = 'none';
  });
  
  const orderHistorySection = document.getElementById('order-history');
  const categoryStrip = document.querySelector('.category-strip');
  
  if (orderHistorySection) orderHistorySection.style.display = 'block';
  if (categoryStrip) categoryStrip.style.display = 'none';
  
  await loadOrderHistory();
  window.scrollTo(0, 0);
};

// Load Order History from Backend
const loadOrderHistory = async () => {
  try {
    const orders = await orderAPI.getUserOrders();
    displayOrders(orders);
  } catch (error) {
    console.error('Failed to load orders:', error);
    document.getElementById('orders-container').innerHTML =
      '<div class="empty-state"><span class="empty-icon">😕</span><p>Error loading orders. Please try again.</p></div>';
  }
};

// Display Orders
const displayOrders = (orders) => {
  const ordersContainer = document.getElementById('orders-container');
  ordersContainer.innerHTML = '';

  if (orders.length === 0) {
    ordersContainer.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📦</span>
        <h3>No orders yet</h3>
        <p>Your order history will appear here once you make a purchase.</p>
        <button onclick="backToProducts()" class="btn-primary-outline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          Continue Shopping
        </button>
      </div>
    `;
    return;
  }

  orders.forEach((order) => {
    const orderCard = createOrderCard(order);
    ordersContainer.appendChild(orderCard);
  });
};

// Create Order Card
const createOrderCard = (order) => {
  const card = document.createElement('div');
  card.className = 'order-card';

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Format Estimated Delivery Date
  const deliveryDate = order.estimatedDelivery 
    ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not available';

  const statusClass = getStatusClass(order.status);
  const itemsHtml = order.items.map((item) => {
    const productName = item.productId?.name || item.productName || 'Product';
    return `
      <div class="order-item">
        <span class="item-info">${productName} × ${item.quantity}</span>
        <span class="item-total">₹${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `;
  }).join('');

  card.innerHTML = `
    <div class="order-header">
      <div>
        <div class="order-id">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          ${order._id.slice(-8).toUpperCase()}
        </div>
        <div class="order-date">${orderDate}</div>
        <div class="delivery-date">
          🚚 <strong>Est. Delivery:</strong> ${deliveryDate}
        </div>
      </div>
      <span class="order-status-badge ${statusClass}">
        ${order.status.toUpperCase()}
      </span>
    </div>

    <div class="order-items">
      ${itemsHtml}
    </div>

    <div class="order-details">
      <div class="detail-row">
        <span>Shipping</span>
        <span>${order.shippingAddress}</span>
      </div>
      <div class="detail-row">
        <span>Payment</span>
        <span>${capitalizeFirst(order.paymentMethod)} · ${capitalizeFirst(order.paymentStatus)}</span>
      </div>
    </div>

    <div class="order-footer">
      <div class="order-total">
        <span>Total</span>
        <span class="total-amount">₹${order.totalAmount.toFixed(2)}</span>
      </div>
      <div class="order-actions">
        <button onclick="viewOrderDetails('${order._id}')" class="btn-order-action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View Details
        </button>
        ${order.status === 'Placed' ? `
          <button onclick="cancelOrderIfPending('${order._id}', '${order.status}')" class="btn-order-cancel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            Cancel
          </button>
        ` : ''}
      </div>
    </div>
  `;

  return card;
};

// Get Status CSS Class
const getStatusClass = (status) => {
  const classes = {
    'Placed': 'status-placed',
    'Shipped': 'status-shipped',
    'Out for Delivery': 'status-out-delivery',
    'Delivered': 'status-delivered',
    'cancelled': 'status-cancelled',
  };
  return classes[status] || 'status-default';
};

// Get Status Color based on Tracking Flow
const getStatusColor = (status) => {
  const colors = {
    'Placed': '#f39c12',
    'Shipped': '#3498db',
    'Out for Delivery': '#9b59b6',
    'Delivered': '#27ae60',
    'cancelled': '#e74c3c',
  };
  return colors[status] || '#95a5a6';
};

// Capitalize First Letter
const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// View Order Details
const viewOrderDetails = (orderId) => {
  alert(`Order ID: ${orderId}\n\nDetailed view coming soon!`);
};

// Cancel Order If Pending (Now 'Placed')
const cancelOrderIfPending = async (orderId, status) => {
  if (status !== 'Placed') {
    alert(`Cannot cancel ${status} order`);
    return;
  }

  if (confirm('Are you sure you want to cancel this order?')) {
    try {
      await orderAPI.cancelOrder(orderId);
      alert('Order cancelled successfully');
      await loadOrderHistory();
    } catch (error) {
      alert('Failed to cancel order: ' + error.message);
    }
  }
};

// Back to Products
const backToProducts = () => {
  goToProducts();
};
