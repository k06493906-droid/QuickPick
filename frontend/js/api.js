// API Helper Functions - Handle all backend API calls

const API_BASE_URL = 'http://localhost:5000/api';

// Get stored JWT token from localStorage
const getToken = () => localStorage.getItem('authToken');

// Make API request
const apiCall = async (endpoint, method = 'GET', data = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = getToken();
    console.log('Token from localStorage:', token);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set:', headers['Authorization']);
    }

    const options = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log('Making request to:', `${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'API Error');
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
    apiCall('/auth/signup', 'POST', { name, email, password }),

  login: (email, password) =>
    apiCall('/auth/login', 'POST', { email, password }),

  sendOTP: (email) =>
    apiCall('/auth/send-otp', 'POST', { email }),

  verifyOTP: (email, otp) =>
    apiCall('/auth/verify-otp', 'POST', { email, otp }),
};

// Product API Functions
const productAPI = {
  getAllProducts: () => apiCall('/products', 'GET'),

  getProductById: (id) => apiCall(`/products/${id}`, 'GET'),

  createProduct: (productData) =>
    apiCall('/products', 'POST', productData),

  updateProduct: (id, productData) =>
    apiCall(`/products/${id}`, 'PUT', productData),

  deleteProduct: (id) =>
    apiCall(`/products/${id}`, 'DELETE'),

  searchProductsSuggestions: (query) =>
    apiCall(`/products/search?q=${query}`, 'GET'),
};

// User API Functions
const userAPI = {
  getUserProfile: () => apiCall('/users/profile', 'GET'),

  updateUserProfile: (userData) =>
    apiCall('/users/profile', 'PUT', userData),

  getAllUsers: () => apiCall('/users', 'GET'),

  deleteUser: () => apiCall('/users/profile', 'DELETE'),
};

// Cart API Functions
const cartAPI = {
  getCart: () => apiCall('/cart', 'GET'),

  addToCart: (productId, quantity) =>
    apiCall('/cart/add', 'POST', { productId, quantity }),

  removeFromCart: (productId) =>
    apiCall('/cart/remove', 'POST', { productId }),

  clearCart: () => apiCall('/cart/clear', 'DELETE'),
};

// Order API Functions
const orderAPI = {
  getUserOrders: () => apiCall('/orders', 'GET'),

  getOrderById: (id) => apiCall(`/orders/${id}`, 'GET'),

  createOrder: (cartItems, shippingAddress, paymentMethod, paymentId = null) =>
    apiCall('/orders', 'POST', { items: cartItems, shippingAddress, paymentMethod, paymentId }),

  updateOrderStatus: (id, status, paymentStatus) =>
    apiCall(`/orders/${id}`, 'PUT', { status, paymentStatus }),

  cancelOrder: (id) => apiCall(`/orders/${id}`, 'DELETE'),
};

// Payment API Functions
const paymentAPI = {
  createOrder: (amount) => apiCall('/payment/create-order', 'POST', { amount }),
  verifyPayment: (paymentData) => apiCall('/payment/verify-payment', 'POST', paymentData),
};
