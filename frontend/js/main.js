// Main Entry Point - Initialize QuickPick application

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

// Initialize application
const initializeApp = async () => {
  loadProducts();
  updateAuthUI();
  updateCartCount();
  goHome();
  if (isAuthenticated()) {
    await loadRecommendationsOnHome();
  }
  
  // Initialize Smart Search Suggestions
  initSearchSuggestions();
  
  console.log('QuickPick application initialized successfully');
};

// Initialize Search Suggestions logic
const initSearchSuggestions = () => {
  const searchInput = document.getElementById('search-input');
  const suggestionsContainer = document.getElementById('suggestions');
  
  if (!searchInput || !suggestionsContainer) return;
  
  let debounceTimer;
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    clearTimeout(debounceTimer);
    
    if (query.length < 2) {
      suggestionsContainer.innerHTML = '';
      suggestionsContainer.style.display = 'none';
      return;
    }
    
    debounceTimer = setTimeout(async () => {
      try {
        const suggestions = await productAPI.searchProductsSuggestions(query);
        displaySuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    }, 300);
  });
  
  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
      suggestionsContainer.style.display = 'none';
    }
  });
};

// Display search suggestions in dropdown
const displaySuggestions = (suggestions) => {
  const suggestionsContainer = document.getElementById('suggestions');
  if (!suggestionsContainer) return;
  
  if (suggestions.length === 0) {
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.style.display = 'none';
    return;
  }
  
  suggestionsContainer.innerHTML = suggestions.map(product => `
    <div class="suggestion-item" onclick="goToProductDetail('${product._id}')">
      <div class="suggestion-name">${product.name}</div>
      <div style="font-size: 0.8rem; color: #666; margin-left: auto;">in ${product.category}</div>
    </div>
  `).join('');
  
  suggestionsContainer.style.display = 'block';
};

// Redirect to product detail page (using existing product logic)
const goToProductDetail = (productId) => {
  const suggestionsContainer = document.getElementById('suggestions');
  if (suggestionsContainer) suggestionsContainer.style.display = 'none';
  
  // In this project, we scroll to the product or show details
  // For now, let's filter products to show only this one
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  
  const product = allProducts.find(p => p._id === productId);
  if (product) {
    goToProducts();
    displayProducts([product]);
    showNotification(`Showing details for ${product.name}`);
  }
};

// Utility function to show notification
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem;
    background-color: ${type === 'error' ? '#e74c3c' : '#27ae60'};
    color: #fff;
    border-radius: 5px;
    z-index: 2000;
    animation: slideIn 0.3s ease-in-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
};

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// Handle navigation
const navigateTo = (section) => {
  const allSections = document.querySelectorAll('main section, section[id="cart"], section[id="order-summary"], section[id="order-history"]');
  allSections.forEach((s) => {
    s.style.display = 'none';
  });

  const categoryStrip = document.querySelector('.category-strip');
  
  const sectionElement = document.getElementById(section);
  if (sectionElement) {
    sectionElement.style.display = 'block';
    
    if (categoryStrip) {
      categoryStrip.style.display = (section === 'products') ? 'block' : 'none';
    }
  }
};

// Format currency
const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

// Validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Go to home page
const goHome = async () => {
  const allSections = document.querySelectorAll('main section, section[id="cart"], section[id="order-summary"], section[id="order-history"]');
  allSections.forEach((s) => {
    s.style.display = 'none';
  });
  
  const homeSection = document.getElementById('home');
  const categoryStrip = document.querySelector('.category-strip');
  const aiRecommendations = document.getElementById('ai-recommendations');
  
  if (homeSection) homeSection.style.display = 'block';
  if (categoryStrip) categoryStrip.style.display = 'block';
  if (aiRecommendations && isAuthenticated()) aiRecommendations.style.display = 'block';
  
  if (isAuthenticated()) {
    await loadRecommendationsOnHome();
  }
  window.scrollTo(0, 0);
};

// Go to products page
const goToProducts = () => {
  const allSections = document.querySelectorAll('main section, section[id="cart"], section[id="order-summary"], section[id="order-history"]');
  allSections.forEach((s) => {
    s.style.display = 'none';
  });
  
  const productsSection = document.getElementById('products');
  const categoryStrip = document.querySelector('.category-strip');
  
  if (productsSection) productsSection.style.display = 'block';
  if (categoryStrip) categoryStrip.style.display = 'block';
  
  window.scrollTo(0, 0);
};

// Go to cart page
const goToCart = () => {
  if (!isAuthenticated()) {
    alert('Please login to view cart');
    toggleAuth();
    return;
  }
  
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

// Handle search functionality
const handleSearch = (event) => {
  if (event.key === 'Enter') {
    const searchQuery = document.getElementById('search-input').value.trim();
    if (searchQuery) {
      goToProducts();
      searchProducts(searchQuery);
    } else {
      searchProducts('');
    }
  }
};

// Clear search and show all products
const clearSearch = () => {
  document.getElementById('search-input').value = '';
  searchProducts('');
  showNotification('Search cleared');
};

// Filter products by category
const filterByCategory = (category) => {
  const allSections = document.querySelectorAll('main section, section[id="cart"], section[id="order-summary"], section[id="order-history"]');
  allSections.forEach((s) => {
    s.style.display = 'none';
  });
  
  const productsSection = document.getElementById('products');
  const categoryStrip = document.querySelector('.category-strip');
  
  if (productsSection) productsSection.style.display = 'block';
  if (categoryStrip) categoryStrip.style.display = 'block';
  
  const filtered = allProducts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  displayProducts(filtered);
  showNotification(`Showing ${category} products`);
  
  window.scrollTo(0, 0);
};

// Log app version
console.log('QuickPick v1.0.0 - Full Stack E-Commerce Application');
