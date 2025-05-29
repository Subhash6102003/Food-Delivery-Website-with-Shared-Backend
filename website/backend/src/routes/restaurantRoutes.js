const express = require('express');
const {
  getRestaurants,
  getRestaurant,
  getTopRatedRestaurants,
  getRestaurantsByCuisine
} = require('../controllers/restaurantController');

const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/auth');

router.get('/', getRestaurants);
router.get('/top-rated', getTopRatedRestaurants);
router.get('/cuisine/:cuisineType', getRestaurantsByCuisine);
router.get('/:id', getRestaurant);

module.exports = router;