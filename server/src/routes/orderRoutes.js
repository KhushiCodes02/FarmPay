const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateDeliveryStatus,
  sendDeliveryOTP,
  verifyDeliveryOTP,
  releasePayment,
} = require('../controllers/orderController');
const { raiseDispute } = require('../controllers/disputeController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const { otpLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/', verifyToken, checkRole('BUYER', 'ADMIN'), createOrder);
router.get('/', verifyToken, getOrders);
router.get('/:id', verifyToken, getOrderById);
router.put('/:id/delivery-status', verifyToken, checkRole('FARMER', 'ADMIN'), updateDeliveryStatus);
router.post('/:id/send-otp', verifyToken, otpLimiter, sendDeliveryOTP);
router.post('/:id/verify-otp', verifyToken, otpLimiter, verifyDeliveryOTP);
router.post('/:id/release', verifyToken, releasePayment);
router.post('/:id/dispute', verifyToken, checkRole('BUYER', 'ADMIN'), raiseDispute);

module.exports = router;
