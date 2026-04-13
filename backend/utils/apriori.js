/**
 * Association Rule Mining (Frequently Bought Together)
 * Implements a simplified Apriori-like algorithm for pair frequency counting.
 */

/**
 * Get products frequently purchased together with the target product
 * @param {string} targetProductId - Product ID to find pairs for
 * @param {Array} allOrders - List of all order documents
 * @param {number} threshold - Minimum frequency to consider a pair "frequent"
 * @returns {Array} - List of frequently bought together product IDs
 */
const getFrequentlyBoughtTogether = (targetProductId, allOrders, threshold = 2) => {
  if (!allOrders || allOrders.length === 0) return [];

  // Create transactions from orders
  const transactions = allOrders.map((order) => {
    // Collect all product IDs in a transaction (deduplicated)
    const productIds = order.items.map((item) => item.productId.toString());
    return [...new Set(productIds)];
  });

  // Filter transactions containing the target product
  const targetTransactions = transactions.filter((transaction) =>
    transaction.includes(targetProductId.toString())
  );

  if (targetTransactions.length === 0) return [];

  // Count occurrences of other products in these transactions
  const frequencyMap = {};

  targetTransactions.forEach((transaction) => {
    transaction.forEach((productId) => {
      // Skip the target product itself
      if (productId === targetProductId.toString()) return;

      frequencyMap[productId] = (frequencyMap[productId] || 0) + 1;
    });
  });

  // Filter products by threshold
  const frequentPairs = Object.keys(frequencyMap)
    .filter((productId) => frequencyMap[productId] >= threshold)
    .sort((a, b) => frequencyMap[b] - frequencyMap[a]);

  return frequentPairs;
};

module.exports = {
  getFrequentlyBoughtTogether
};
