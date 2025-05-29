/**
 * Shared Data Service for both websites
 * This module provides centralized functions for data operations
 * that need to be consistent across both the consumer website and restaurant dashboard
 */

const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const User = require('../models/User');

/**
 * Update order status and notify all connected clients
 * @param {string} orderId - The ID of the order to update
 * @param {string} status - The new status
 * @param {string} userId - ID of the user making the change
 * @returns {Object} Updated order object
 */
exports.updateOrderStatus = async (orderId, status, userId) => {
  try {
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    order.status = status;
    order.statusUpdatedAt = Date.now();
    order.statusUpdatedBy = userId;
    
    await order.save();
    
    // In a real app with WebSockets, we'd emit an event here
    // to notify all connected clients about the status change
    console.log(`Order ${orderId} status updated to ${status}`);
    
    return order;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Create or update a menu item and sync across platforms
 * @param {Object} itemData - The menu item data
 * @param {string} restaurantId - ID of the restaurant
 * @returns {Object} Created/updated menu item
 */
exports.syncMenuItem = async (itemData, restaurantId) => {
  try {
    let menuItem;
    
    if (itemData._id) {
      // Update existing item
      menuItem = await MenuItem.findByIdAndUpdate(
        itemData._id,
        { ...itemData, restaurant: restaurantId },
        { new: true, runValidators: true }
      );
    } else {
      // Create new item
      menuItem = await MenuItem.create({
        ...itemData,
        restaurant: restaurantId
      });
    }
    
    return menuItem;
  } catch (error) {
    console.error('Error syncing menu item:', error);
    throw error;
  }
};

/**
 * Get all pending orders for a restaurant
 * @param {string} restaurantId - ID of the restaurant
 * @returns {Array} List of pending orders
 */
exports.getPendingOrders = async (restaurantId) => {
  try {
    const pendingOrders = await Order.find({
      restaurant: restaurantId,
      status: { $in: ['pending', 'preparing', 'ready_for_pickup'] }
    })
    .populate('user', 'name email phone')
    .populate('items.menuItem', 'name price')
    .sort({ createdAt: -1 });
    
    return pendingOrders;
  } catch (error) {
    console.error('Error getting pending orders:', error);
    throw error;
  }
};

/**
 * Update restaurant information and sync across platforms
 * @param {Object} restaurantData - Updated restaurant data
 * @returns {Object} Updated restaurant
 */
exports.updateRestaurantInfo = async (restaurantId, restaurantData) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      restaurantData,
      { new: true, runValidators: true }
    );
    
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }
    
    return restaurant;
  } catch (error) {
    console.error('Error updating restaurant info:', error);
    throw error;
  }
};

/**
 * Get restaurant analytics data
 * @param {string} restaurantId - ID of the restaurant
 * @returns {Object} Analytics data
 */
exports.getRestaurantAnalytics = async (restaurantId) => {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get orders from today
    const todayOrders = await Order.find({
      restaurant: restaurantId,
      createdAt: { $gte: today }
    });
    
    // Calculate today's revenue
    const todayRevenue = todayOrders.reduce((total, order) => {
      return total + order.total;
    }, 0);
    
    // Get all customers who ordered from this restaurant
    const customers = await Order.distinct('user', {
      restaurant: restaurantId
    });
    
    // Get counts by status
    const ordersByStatus = await Order.aggregate([
      { $match: { restaurant: mongoose.Types.ObjectId(restaurantId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    return {
      todayOrdersCount: todayOrders.length,
      todayRevenue,
      totalCustomers: customers.length,
      ordersByStatus: ordersByStatus.reduce((obj, item) => {
        obj[item._id] = item.count;
        return obj;
      }, {})
    };
  } catch (error) {
    console.error('Error getting restaurant analytics:', error);
    throw error;
  }
};