// Recommendations Handler - Load and display AI recommendations and related products

// Load and display recommendations on home page
const loadRecommendationsOnHome = async () => {
  if (!isAuthenticated()) {
    return;
  }

  // Only load recommendations if the home page is currently visible
  const homeSection = document.getElementById('home');
  if (!homeSection || homeSection.style.display === 'none') {
    return;
  }

  try {
    const recommendations = await orderAPI.getRecommendations();

    // We need 8 unique products: 4 for AI, 4 for related
    let aiPicks = [];
    let relatedPicks = [];

    if (recommendations.length >= 8) {
      // Enough AI recommendations — take first 4 for AI, next 4 for related
      aiPicks = recommendations.slice(0, 4);
      relatedPicks = recommendations.slice(4, 8);
    } else if (recommendations.length >= 4) {
      // Some AI recommendations — use them for AI, fill related from allProducts
      aiPicks = recommendations.slice(0, 4);
      const usedIds = new Set(aiPicks.map(p => p._id));
      relatedPicks = (allProducts || [])
        .filter(p => !usedIds.has(p._id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
    } else {
      // Few AI recommendations — show what we have, fill the rest from allProducts
      aiPicks = recommendations.slice(0, 4);
      const usedIds = new Set(aiPicks.map(p => p._id));
      relatedPicks = (allProducts || [])
        .filter(p => !usedIds.has(p._id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
    }

    if (aiPicks.length > 0) displayRecommendations(aiPicks);
    if (relatedPicks.length >= 2) displayRelatedProducts(relatedPicks);

  } catch (error) {
    console.error('Failed to load recommendations:', error);
  }
};

// Display AI recommendations (4 products)
const displayRecommendations = (recommendations) => {
  const recommendationsList = document.getElementById('recommendations-list');
  const aiSection = document.getElementById('ai-recommendations');

  if (!recommendationsList || recommendations.length === 0) {
    return;
  }

  recommendationsList.innerHTML = '';

  recommendations.forEach((product) => {
    const card = createProductCard(product);
    recommendationsList.appendChild(card);
  });

  aiSection.style.display = 'block';
};

// Display related products (4 different products)
const displayRelatedProducts = (products) => {
  const relatedSection = document.getElementById('related-products');
  const relatedGrid = document.getElementById('related-products-grid');

  if (!products || products.length < 2 || !relatedGrid) {
    return;
  }

  relatedGrid.innerHTML = '';

  products.slice(0, 4).forEach((product) => {
    const card = createProductCard(product);
    relatedGrid.appendChild(card);
  });

  relatedSection.style.display = 'block';
};

// Add recommendations API function
const orderAPI_extended = {
  getRecommendations: () => apiCall('/api/products/recommendations/ai', 'GET'),
};

// Extend orderAPI with recommendations
Object.assign(orderAPI, orderAPI_extended);
