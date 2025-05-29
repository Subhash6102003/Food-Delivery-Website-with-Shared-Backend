const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const dataService = require('../services/dataService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod } = req.body;

    // Validate required fields
    if (!restaurantId || !items || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        error: 'Please provide restaurant, items, and delivery address'
      });
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }

    // Get menu item details and calculate total
    let total = 0;
    let orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          error: `Menu item ${item.menuItemId} not found`
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        total: itemTotal
      });
    }

    // Add delivery fee and tax
    const deliveryFee = 2.99;
    const taxRate = 0.08;
    const subtotal = total;
    const tax = subtotal * taxRate;
    total = subtotal + tax + deliveryFee;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      restaurant: restaurantId,
      items: orderItems,
      deliveryAddress,
      paymentMethod: paymentMethod || 'cash_on_delivery',
      subtotal,
      deliveryFee,
      tax,
      total,
      status: 'pending'
    });

    // Populate restaurant and user details
    const populatedOrder = await Order.findById(order._id)
      .populate('restaurant', 'name address phone')
      .populate('user', 'name phone');

    res.status(201).json({
      success: true,
      data: populatedOrder,
      message: 'Order placed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    // For admin, get all orders
    // For customer, get only their orders
    // For restaurant, get only orders for their restaurant
    let query = {};
    
    if (req.user.role === 'customer') {
      query = { user: req.user.id };
    } else if (req.user.role === 'restaurant') {
      query = { restaurant: req.user.id };
    }

    const orders = await Order.find(query)
      .populate('restaurant', 'name address')
      .populate('user', 'name phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name address phone')
      .populate('user', 'name phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Make sure user has access to this order
    if (
      req.user.role !== 'admin' && 
      req.user.id !== order.user.toString() &&
      req.user.id !== order.restaurant.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }

    // Use shared data service to update order status
    const order = await dataService.updateOrderStatus(req.params.id, status, req.user.id);

    res.status(200).json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/user/:userId
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    // Make sure user is requesting their own orders or is an admin
    if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access these orders'
      });
    }

    const orders = await Order.find({ user: req.params.userId })
      .populate('restaurant', 'name address')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get restaurant orders
// @route   GET /api/orders/restaurant/:restaurantId
// @access  Private
exports.getRestaurantOrders = async (req, res) => {
  try {
    // Make sure user is the restaurant owner or an admin
    if (req.user.role !== 'admin' && req.user.id !== req.params.restaurantId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access these orders'
      });
    }

    const orders = await Order.find({ restaurant: req.params.restaurantId })
      .populate('user', 'name phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get pending restaurant orders
// @route   GET /api/orders/restaurant/:restaurantId/pending
// @access  Private
exports.getPendingRestaurantOrders = async (req, res) => {
  try {
    // Make sure user is the restaurant owner or an admin
    if (req.user.role !== 'admin' && req.user.id !== req.params.restaurantId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access these orders'
      });
    }

    // Use shared data service to get pending orders
    const pendingOrders = await dataService.getPendingOrders(req.params.restaurantId);

    res.status(200).json({
      success: true,
      count: pendingOrders.length,
      data: pendingOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};