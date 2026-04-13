const natural = require('natural');
const TfIdf = natural.TfIdf;

/**
 * Content-Based Recommendation Engine
 * Uses TF-IDF vectorization and Cosine Similarity to find similar products.
 */

/**
 * Generates a text representation of a product for TF-IDF
 * @param {Object} product - Product document
 * @returns {string} - Combined text features
 */
const getProductText = (product) => {
  const name = product.name || '';
  const description = product.description || '';
  const category = product.category || '';
  const tags = Array.isArray(product.tags) ? product.tags.join(' ') : '';
  
  return `${name} ${description} ${category} ${tags}`.toLowerCase();
};

/**
 * Simple Cosine Similarity implementation for TF-IDF vectors
 * @param {Object} vecA - First vector (map of term -> measure)
 * @param {Object} vecB - Second vector (map of term -> measure)
 * @returns {number} - Similarity score (0 to 1)
 */
const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  // Get all unique terms from both vectors
  const terms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

  for (const term of terms) {
    const valA = vecA[term] || 0;
    const valB = vecB[term] || 0;
    dotProduct += valA * valB;
    magnitudeA += valA * valA;
    magnitudeB += valB * valB;
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
};

/**
 * Get top N similar products for a target product
 * @param {string} targetProductId - ID of the product to find matches for
 * @param {Array} allProducts - List of all products in the database
 * @param {number} limit - Number of recommendations to return
 * @returns {Array} - Top similar products
 */
const getSimilarProducts = (targetProductId, allProducts, limit = 5) => {
  if (!allProducts || allProducts.length === 0) return [];

  const tfidf = new TfIdf();
  
  // Add all products to TF-IDF documents
  allProducts.forEach((product) => {
    tfidf.addDocument(getProductText(product));
  });

  // Find index of target product
  const targetIndex = allProducts.findIndex(p => p._id.toString() === targetProductId.toString());
  if (targetIndex === -1) return [];

  // Extract vector for target product
  const targetVector = {};
  tfidf.listTerms(targetIndex).forEach((item) => {
    targetVector[item.term] = item.tfidf;
  });

  // Calculate similarity with all other products
  const similarities = allProducts.map((product, index) => {
    if (index === targetIndex) return { product, score: -1 }; // Skip self

    const currentVector = {};
    tfidf.listTerms(index).forEach((item) => {
      currentVector[item.term] = item.tfidf;
    });

    const score = cosineSimilarity(targetVector, currentVector);
    return { product, score };
  });

  // Sort by score and take top N
  return similarities
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.product);
};

module.exports = {
  getSimilarProducts
};
