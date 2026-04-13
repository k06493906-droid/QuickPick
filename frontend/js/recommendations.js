// Recommendations Handler - Load and display AI recommendations and related products

// Load and display recommendations on home page
const loadRecommendationsOnHome = async () => {
  if (!isAuthenticated()) {
    return;
  }

  try {
    const recommendations = await orderAPI.getRecommendations();
    displayRecommendations(recommendations);
    displayRelatedProducts(recommendations);
  } catch (error) {
    console.error('Failed to load recommendations:', error);
  }
};

// Display AI recommendations
const displayRecommendations = (recommendations) => {
  const recommendationsList = document.getElementById('recommendations-list');
  const aiSection = document.getElementById('ai-recommendations');

  if (!recommendationsList || recommendations.length === 0) {
    return;
  }

  recommendationsList.innerHTML = '';

  recommendations.forEach((product) => {
    const card = createRecommendationCard(product);
    recommendationsList.appendChild(card);
  });

  aiSection.style.display = 'block';
};

// Create recommendation card
const createRecommendationCard = (product) => {
  const card = document.createElement('div');
  card.className = 'recommendation-card';

  const rating = product.rating || 0;
  const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));

  card.innerHTML = `
    <div class="rec-product-image">${product.image ? `<img src="${product.image}" alt="${product.name}">` : '📦'}</div>
    <div class="rec-product-info">
      <div class="rec-product-name">${product.name}</div>
      <div class="rec-product-category">${product.category}</div>
      <div class="rec-product-rating">${stars}</div>
      <div class="rec-product-price">₹${product.price.toFixed(2)}</div>
      <div class="rec-product-actions">
        <button class="btn-add-to-rec-cart" onclick="addProductToCart('${product._id}', '${product.name}', ${product.price})">
          Add to Cart
        </button>
      </div>
    </div>
  `;

  return card;
};

// Display related products on left and right
const displayRelatedProducts = (recommendations) => {
  const relatedSection = document.getElementById('related-products');
  const leftProduct = document.getElementById('related-left-product');
  const rightProduct = document.getElementById('related-right-product');

  if (!recommendations || recommendations.length < 2) {
    return;
  }

  if (recommendations.length >= 1 && leftProduct) {
    leftProduct.innerHTML = createRelatedProductHTML(recommendations[0]);
  }

  if (recommendations.length >= 2 && rightProduct) {
    rightProduct.innerHTML = createRelatedProductHTML(recommendations[1]);
  }

  relatedSection.style.display = 'block';
};

// Create related product HTML
const createRelatedProductHTML = (product) => {
  return `
    <div class="related-product-image">${product.image ? `<img src="${product.image}" alt="${product.name}">` : '📦'}</div>
    <div class="related-product-details">
      <h3>${product.name}</h3>
      <p class="related-category">${product.category}</p>
      <p class="related-price">₹${product.price.toFixed(2)}</p>
      <button class="btn-view-related" onclick="addProductToCart('${product._id}', '${product.name}', ${product.price})">
        Add to Cart
      </button>
    </div>
  `;
};

// Add recommendations API function
const orderAPI_extended = {
  getRecommendations: () => apiCall('/products/recommendations/ai', 'GET'),
};

// Extend orderAPI with recommendations
Object.assign(orderAPI, orderAPI_extended);
