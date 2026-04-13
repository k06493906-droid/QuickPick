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
      '<p>Error loading orders. Please try again.</p>';
  }
};

// Display Orders
const displayOrders = (orders) => {
  const ordersContainer = document.getElementById('orders-container');
  ordersContainer.innerHTML = '';

  if (orders.length === 0) {
    ordersContainer.innerHTML = `
      <div class="no-orders">
        <p>No orders yet</p>
        <button onclick="backToProducts()" class="btn-back-products">Continue Shopping</button>
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

  const statusColor = getStatusColor(order.status);
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
        <div class="order-id">Order ID: ${order._id}</div>
        <div class="order-date">Ordered on: ${orderDate}</div>
        <div class="delivery-date" style="color: #666; font-size: 0.9rem; margin-top: 4px;">
          🚚 <strong>Estimated Delivery:</strong> ${deliveryDate}
        </div>
      </div>
      <div class="order-status" style="background-color: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
        ${order.status.toUpperCase()}
      </div>
    </div>

    <div class="order-items">
      ${itemsHtml}
    </div>

    <div class="order-details">
      <div class="detail-row">
        <span>Shipping Address:</span>
        <span>${order.shippingAddress}</span>
      </div>
      <div class="detail-row">
        <span>Payment Method:</span>
        <span>${capitalizeFirst(order.paymentMethod)}</span>
      </div>
      <div class="detail-row">
        <span>Payment Status:</span>
        <span>${capitalizeFirst(order.paymentStatus)}</span>
      </div>
    </div>

    <div class="order-total">
      <span>Total Amount:</span>
      <span>₹${order.totalAmount.toFixed(2)}</span>
    </div>

    <div class="order-actions">
      <button onclick="viewOrderDetails('${order._id}')" class="btn-view-details">View Details</button>
      <button onclick="cancelOrderIfPending('${order._id}', '${order.status}')" class="btn-cancel">
        ${order.status === 'Placed' ? 'Cancel Order' : 'N/A'}
      </button>
    </div>
  `;

  return card;
};

// Get Status Color based on Tracking Flow
const getStatusColor = (status) => {
  const colors = {
    'Placed': '#f39c12',            // Orange
    'Shipped': '#3498db',           // Blue
    'Out for Delivery': '#9b59b6', // Purple
    'Delivered': '#27ae60',         // Green
    'cancelled': '#e74c3c',         // Red
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
