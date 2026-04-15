// API Helper Functions - Handle all backend API calls

const API_BASE_URL = 'https://quickpick-1gss.onrender.com';

// Get stored JWT token from localStorage
const getToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

// Make API request
const apiCall = async (endpoint, method = 'GET', data = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = getToken();
    console.log('Token status:', !!token);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log('API Request:', endpoint);
    console.log('Request Body:', data);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Invalid response from server:", text);
      throw new Error("Invalid response from server");
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'API Error');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

// Auth API Functions
const authAPI = {
  signup: (name, email, password) =>
    apiCall('/api/auth/signup', 'POST', { name, email, password }),

  login: (email, password) =>
    apiCall('/api/auth/login', 'POST', { email, password }),

  sendOTP: (email, mode) =>
    apiCall('/api/auth/send-otp', 'POST', { email, mode }),

  verifyOTP: (data) =>
    apiCall('/api/auth/verify-otp', 'POST', data),
};

// Product API Functions
const productAPI = {
  getAllProducts: () => apiCall('/api/products', 'GET'),

  getProductById: (id) => apiCall(`/api/products/${id}`, 'GET'),

  createProduct: (productData) =>
    apiCall('/api/products', 'POST', productData),

  updateProduct: (id, productData) =>
    apiCall(`/api/products/${id}`, 'PUT', productData),

  deleteProduct: (id) =>
    apiCall(`/api/products/${id}`, 'DELETE'),

  searchProductsSuggestions: (query) =>
    apiCall(`/api/products/search?q=${query}`, 'GET'),
};

// User API Functions
const userAPI = {
  getUserProfile: () => apiCall('/api/user/profile', 'GET'),

  updateUserProfile: (userData) =>
    apiCall('/api/user/profile', 'PUT', userData),

  getAllUsers: () => apiCall('/api/user', 'GET'),

  deleteUser: () => apiCall('/api/user/profile', 'DELETE'),
};

// Cart API Functions
const cartAPI = {
  getCart: () => apiCall('/api/cart', 'GET'),

  addToCart: (productId, quantity) =>
    apiCall('/api/cart/add', 'POST', { productId, quantity }),

  removeFromCart: (productId) =>
    apiCall('/api/cart/remove', 'POST', { productId }),

  clearCart: () => apiCall('/api/cart/clear', 'DELETE'),
};

// Order API Functions
const orderAPI = {
  getUserOrders: () => apiCall('/api/orders', 'GET'),

  getOrderById: (id) => apiCall(`/api/orders/${id}`, 'GET'),

  createOrder: (cartItems, shippingAddress, paymentMethod, paymentId = null) =>
    apiCall('/api/orders', 'POST', { items: cartItems, shippingAddress, paymentMethod, paymentId }),

  updateOrderStatus: (id, status, paymentStatus) =>
    apiCall(`/api/orders/${id}`, 'PUT', { status, paymentStatus }),

  cancelOrder: (id) => apiCall(`/api/orders/${id}`, 'DELETE'),
};

// Payment API Functions
const paymentAPI = {
  createOrder: (amount) => apiCall('/api/payment/create-order', 'POST', { amount }),
  verifyPayment: (paymentData) => apiCall('/api/payment/verify-payment', 'POST', paymentData),
};
