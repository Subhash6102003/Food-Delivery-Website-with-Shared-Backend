const express = require('express');
const {
  createOrder,
  getOrder,
  getMyOrders,
  cancelOrder,
  trackOrder
} = require('../controllers/orderController');

const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// All routes below this require authentication
router.use(protect);

router.post('/', authorize('customer'), createOrder);
router.get('/', authorize('customer'), getMyOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', authorize('customer'), cancelOrder);
router.get('/:id/track', authorize('customer'), trackOrder);

module.exports = router;