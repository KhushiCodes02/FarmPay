const express = require('express');
const router = express.Router();
const { createPayment, verifyPayment, getPaymentStatus } = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/create', verifyToken, createPayment);
router.post('/verify', verifyToken, verifyPayment);
router.get('/:orderId', verifyToken, getPaymentStatus);

module.exports = router;
