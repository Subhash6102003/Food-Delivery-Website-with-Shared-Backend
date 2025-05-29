const express = require('express');
const {
  getAllItems,
  getMenuItem,
  getRestaurantMenu,
  getFeaturedItems,
  getMenuItemsByCategory
} = require('../controllers/menuController');

const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllItems);
router.get('/featured', getFeaturedItems);
router.get('/category/:category', getMenuItemsByCategory);
router.get('/restaurant/:restaurantId', getRestaurantMenu);
router.get('/:id', getMenuItem);

module.exports = router;