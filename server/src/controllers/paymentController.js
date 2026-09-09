const paymentService = require('../services/paymentService');
const Order = require('../models/Order');

const createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.buyerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to pay for this order.' });
    }

    if (order.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({ error: `Cannot initiate payment. Order status is ${order.status}.` });
    }

    const paymentSession = await paymentService.createPayment({
      orderId: order._id,
      amount: order.totalAmount,
      customerInfo: { email: req.user.email, userId: req.user.id },
      orderNumber: order.orderNumber,
    });

    return res.json({
      message: 'Payment session created',
      ...paymentSession,
      order,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to create payment session' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const result = await paymentService.verifyPayment({
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      userId: req.user.id,
    });

    return res.json({
      message: 'Payment verified and secured successfully! Escrow state active.',
      ...result,
    });
  } catch (error) {
    console.error('verifyPayment error:', error);
    return res.status(400).json({ error: error.message || 'Payment verification failed' });
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const status = await paymentService.getPaymentStatus(orderId);
    return res.json(status);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { createPayment, verifyPayment, getPaymentStatus };
