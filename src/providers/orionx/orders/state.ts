let orders = {};

/**
 * Store whole orders array in a market (mainly for initial load). Set as key value for searching O(1) later
 * @param {String} marketCode The Market symbol to set
 * @param {Array} newOrders The array of orders to be set
 * @returns {Object} The new object of the marketCode as key value: 'HNhGd3LJE8KSaEvTY': [{...order1}, {...order2}]
 */
export function set(marketCode, newOrders) {
  if (!marketCode) {
    orders = newOrders;
    return;
  }
  orders[marketCode] = {};
  for (const order of newOrders) {
    orders[marketCode][order._id] = order;
  }
  return orders[marketCode];
}

/**
 * Get all orders from a given market as key value object
 * @param {String} marketCode The marketCode symbol to get
 * @returns {Object} The object with all orders
 */
export function get(marketCode) {
  if (!marketCode) return orders;
  return orders[marketCode];
}

/**
 * Get a given order from a market by ID
 * @param {String} marketCode The marketCode symbol from the order
 * @param {Stirng} _id The id of the order
 * @returns {Object} Returns the whole oder object
 */
export function find(marketCode, _id) {
  if (!orders[marketCode]) return undefined;
  return orders[marketCode][_id];
}

/**
 * Find and update an order in a single operation
 * @param {String} marketCode The market code symbol
 * @param {String} _id The id of the order
 * @param {Object} newOrder The new order to store
 * @returns {Object} Returns the new order
 */
export function findAndUpdate(marketCode, _id, newOrder) {
  if (!orders[marketCode]) orders[marketCode] = {};
  orders[marketCode][_id] = newOrder;
  return orders[marketCode][_id];
}

/**
 * Removes an order by ID
 * @param {String} marketCode The market code symbol
 * @param {String} _id The id of the order
 * @returns {Boolean} Returns true if successfully deleted
 */
export function removeOrder(marketCode, _id) {
  if (!orders[marketCode]) return true;
  try {
    delete orders[marketCode][_id];
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
}
