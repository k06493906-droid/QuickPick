// Products Handler - Load and display products

let allProducts = [];

// Load all products from API
const loadProducts = async () => {
  try {
    const response = await productAPI.getAllProducts();
    allProducts = response;
    displayProducts(allProducts);
  } catch (error) {
    console.error('Failed to load products:', error);
    document.getElementById('products-list').innerHTML =
      '<p>Error loading products. Please refresh the page.</p>';
  }
};

// Display products in grid
const displayProducts = (products) => {
  const productsList = document.getElementById('products-list');
  productsList.innerHTML = '';

  if (products.length === 0) {
    productsList.innerHTML = '<p>No products available</p>';
    return;
  }

  products.forEach((product) => {
    console.log('Product:', product.name, 'Image URL:', product.image);
    const productCard = createProductCard(product);
    productsList.appendChild(productCard);
  });
};

// Create product card element
const createProductCard = (product) => {
  const card = document.createElement('div');
  card.className = 'product-card';

  const rating = product.rating || 0;
  const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));

  card.innerHTML = `
    <div class="product-image">${product.image ? `<img src="${product.image}" alt="${product.name}">` : '📦'}</div>
    <div class="product-info">
      <div class="product-name">${product.name}</div>
      <div class="product-category">${product.category}</div>
      <div class="product-rating">${stars} (${product.reviews || 0})</div>
      <div class="product-price">₹${product.price.toFixed(2)}</div>
      <div class="product-actions">
        <button class="btn-add-cart" onclick="addProductToCart('${product._id}', '${product.name}', ${product.price})">
          Add to Cart
        </button>
        <button class="btn-view-detail" onclick="viewProductDetail('${product._id}')">
          Details
        </button>
      </div>
    </div>
  `;

  return card;
};

// Add product to cart
const addProductToCart = (productId, productName, price) => {
  if (!isAuthenticated()) {
    alert('Please login to add items to cart');
    toggleAuth();
    return;
  }

  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existingItem = cart.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ productId, productName, price, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert(`${productName} added to cart!`);
};

// View product details
const viewProductDetail = (productId) => {
  const product = allProducts.find((p) => p._id === productId);
  if (product) {
    alert(`
${product.name}
Category: ${product.category}
Price: ₹${product.price.toFixed(2)}
Stock: ${product.stock}
${product.description}
    `);
  }
};

// Search products
const searchProducts = (query) => {
  if (!query) {
    displayProducts(allProducts);
    document.getElementById('products').querySelector('h2').textContent = 'Featured Products';
    return;
  }

  const filtered = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
  );

  displayProducts(filtered);
  document.getElementById('products').querySelector('h2').textContent = `Search Results for "${query}" (${filtered.length} found)`;
  showNotification(`Found ${filtered.length} product${filtered.length !== 1 ? 's' : ''} matching "${query}"`);
};



// Scroll to products section
const scrollToProducts = () => {
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
};
