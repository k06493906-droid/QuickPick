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

  // Stock badge logic
  let stockBadge = '';
  if (product.stock !== undefined) {
    if (product.stock <= 0) {
      stockBadge = '<span class="stock-badge out-of-stock">Out of Stock</span>';
    } else if (product.stock <= 5) {
      stockBadge = `<span class="stock-badge low-stock">Only ${product.stock} left</span>`;
    }
  }

  card.innerHTML = `
    <div class="product-image">
      ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<span class="product-placeholder">📦</span>'}
      ${stockBadge}
    </div>
    <div class="product-info">
      <div class="product-category">${product.category}</div>
      <div class="product-name">${product.name}</div>
      <div class="product-rating">${stars} (${product.reviews || 0})</div>
      <div class="product-price">₹${product.price.toFixed(2)}</div>
      <div class="product-actions">
        <button class="btn-add-cart" onclick="addProductToCart('${product._id}', '${product.name}', ${product.price})" ${product.stock <= 0 ? 'disabled' : ''}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
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

// View product details — open modal
const viewProductDetail = (productId) => {
  const product = allProducts.find((p) => p._id === productId);
  if (!product) return;

  const modal = document.getElementById('product-detail-modal');
  const rating = product.rating || 0;
  const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));

  // Image
  const imgEl = document.getElementById('modal-product-image');
  if (product.image) {
    imgEl.innerHTML = `<img src="${product.image}" alt="${product.name}">`;
  } else {
    imgEl.innerHTML = '<span class="product-placeholder">📦</span>';
  }

  // Info
  document.getElementById('modal-product-category').textContent = product.category;
  document.getElementById('modal-product-name').textContent = product.name;
  document.getElementById('modal-product-rating').innerHTML = `${stars} <span class="rating-count">(${product.reviews || 0} reviews)</span>`;
  document.getElementById('modal-product-price').textContent = `₹${product.price.toFixed(2)}`;
  document.getElementById('modal-product-desc').textContent = product.description || 'No description available for this product.';

  // Stock
  const stockEl = document.getElementById('modal-product-stock');
  if (product.stock !== undefined) {
    if (product.stock <= 0) {
      stockEl.innerHTML = '<span class="stock-tag out">Out of Stock</span>';
    } else if (product.stock <= 5) {
      stockEl.innerHTML = `<span class="stock-tag low">Only ${product.stock} left — hurry!</span>`;
    } else {
      stockEl.innerHTML = `<span class="stock-tag in">In Stock (${product.stock} available)</span>`;
    }
  } else {
    stockEl.innerHTML = '';
  }

  // Cart button
  const cartBtn = document.getElementById('modal-add-cart');
  cartBtn.onclick = () => {
    addProductToCart(product._id, product.name, product.price);
    closeProductDetail();
  };
  if (product.stock <= 0) {
    cartBtn.disabled = true;
    cartBtn.innerHTML = 'Out of Stock';
  } else {
    cartBtn.disabled = false;
    cartBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> Add to Cart`;
  }

  // Show modal
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
};

// Close product detail modal
const closeProductDetail = () => {
  const modal = document.getElementById('product-detail-modal');
  modal.classList.remove('show');
  document.body.style.overflow = '';
};

// Close on overlay click
const closeProductModal = (event) => {
  if (event.target === event.currentTarget) {
    closeProductDetail();
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
