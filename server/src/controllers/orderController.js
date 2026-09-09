const Order = require('../models/Order');
const Produce = require('../models/Produce');
const Payment = require('../models/Payment');
const Payout = require('../models/Payout');
const Dispute = require('../models/Dispute');
const Rating = require('../models/Rating');
const orderService = require('../services/orderService');
const otpService = require('../services/otpService');
const paymentService = require('../services/paymentService');
const auditService = require('../services/auditService');
const { isDemoMode } = require('../config/razorpay');

const createOrder = async (req, res) => {
  try {
    const { produceId, quantity, deliveryDate, deliveryAddress } = req.body;

    if (!produceId || !quantity) {
      return res.status(400).json({ error: 'Produce ID and quantity are required.' });
    }

    const order = await orderService.createOrder({
      buyerId: req.user.id,
      produceId,
      quantity: Number(quantity),
      deliveryDate,
      deliveryAddress,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('farmerId', 'name email location rating phone')
      .populate('produceId', 'cropName category unit pricePerUnit image');

    return res.status(201).json({
      message: 'Order placed successfully. Proceed to payment.',
      order: populatedOrder,
    });
  } catch (error) {
    console.error('createOrder error:', error);
    return res.status(400).json({ error: error.message || 'Failed to place order' });
  }
};

const getOrders = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'FARMER') {
      query.farmerId = req.user.id;
    } else if (req.user.role === 'BUYER') {
      query.buyerId = req.user.id;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const orders = await Order.find(query)
      .populate('buyerId', 'name email phone businessName')
      .populate('farmerId', 'name email phone location rating')
      .populate('produceId', 'cropName category unit image pricePerUnit')
      .sort({ createdAt: -1 });

    return res.json({ orders, count: orders.length });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error fetching orders' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'name email phone location businessName')
      .populate('farmerId', 'name email phone location rating businessName bankAccount')
      .populate('produceId', 'cropName category unit pricePerUnit image');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const isBuyer = order.buyerId._id.toString() === req.user.id;
    const isFarmer = order.farmerId._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isBuyer && !isFarmer && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to view this order.' });
    }

    const [payment, payout, dispute, auditLogs, activeDemoOTP, userRating] = await Promise.all([
      Payment.findOne({ orderId: order._id }),
      Payout.findOne({ orderId: order._id }),
      Dispute.findOne({ orderId: order._id }).populate('resolution.resolvedBy', 'name email'),
      auditService.getOrderAuditLogs(order._id),
      otpService.getActiveDemoOTP(order._id),
      Rating.findOne({ orderId: order._id, fromUserId: req.user.id }),
    ]);

    return res.json({
      order,
      payment,
      payout,
      dispute,
      auditLogs,
      activeDemoOTP: (isDemoMode && (isBuyer || isAdmin)) ? activeDemoOTP : null,
      userRating,
      isDemoMode,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error fetching order details' });
  }
};

const updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.farmerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only the assigned farmer or admin can update delivery status.' });
    }

    let nextOrderStatus;
    let nextDeliveryStatus;

    if (status === 'PROCESSING') {
      orderService.validateStateTransition(order.status, 'PROCESSING');
      nextOrderStatus = 'PROCESSING';
      nextDeliveryStatus = 'PROCESSING';
      await auditService.logAction(order._id, req.user.id, 'Farmer Processing', { note: 'Produce packed and being prepared' });
    } else if (status === 'OUT_FOR_DELIVERY') {
      orderService.validateStateTransition(order.status, 'OUT_FOR_DELIVERY');
      nextOrderStatus = 'OUT_FOR_DELIVERY';
      nextDeliveryStatus = 'OUT_FOR_DELIVERY';
      await auditService.logAction(order._id, req.user.id, 'Delivery Initiated', { note: 'Produce is out for delivery with courier' });
    } else if (status === 'DELIVERED_PENDING_CONFIRMATION') {
      orderService.validateStateTransition(order.status, 'DELIVERED_PENDING_CONFIRMATION');
      nextOrderStatus = 'DELIVERED_PENDING_CONFIRMATION';
      nextDeliveryStatus = 'DELIVERED_PENDING_CONFIRMATION';

      const otpResult = await otpService.generateOTP(order._id);
      order.releaseDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await auditService.logAction(order._id, req.user.id, 'Delivery Marked - OTP Dispatched', {
        expiresAt: otpResult.expiresAt,
        demoCode: otpResult.demoCode,
        releaseDeadline: order.releaseDeadline,
      });
    } else {
      return res.status(400).json({ error: 'Invalid delivery status provided.' });
    }

    order.status = nextOrderStatus;
    order.deliveryStatus = nextDeliveryStatus;
    await order.save();

    return res.json({
      message: `Order delivery status updated to ${nextOrderStatus}`,
      order,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Error updating delivery status' });
  }
};

const sendDeliveryOTP = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.status !== 'DELIVERED_PENDING_CONFIRMATION' && order.status !== 'OUT_FOR_DELIVERY') {
      return res.status(400).json({ error: 'OTP can only be dispatched when order is in delivery phase.' });
    }

    const otpResult = await otpService.generateOTP(order._id);
    await auditService.logAction(order._id, req.user.id, 'OTP Re-dispatched', {
      demoCode: otpResult.demoCode,
    });

    return res.json({
      message: 'Fresh delivery confirmation OTP generated and dispatched.',
      demoCode: otpResult.demoCode,
      expiresAt: otpResult.expiresAt,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error generating OTP' });
  }
};

const verifyDeliveryOTP = async (req, res) => {
  try {
    const { code } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.buyerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only the ordering buyer or admin can verify delivery OTP.' });
    }

    await otpService.verifyOTP(order._id, code);

    await auditService.logAction(order._id, req.user.id, 'OTP Verified', {
      method: '6-digit SHA-256 secure verification',
    });

    await auditService.logAction(order._id, req.user.id, 'Delivery Confirmed', {
      confirmedBy: req.user.name,
      confirmedAt: new Date(),
    });

    const releaseResult = await paymentService.releasePayment({
      orderId: order._id,
      triggeredBy: 'BUYER_CONFIRMATION',
      userId: req.user.id,
    });

    return res.json({
      message: 'Delivery confirmed successfully! Farmer payout release initiated.',
      order: releaseResult.order,
      payout: releaseResult.payout,
      isDemoMode: releaseResult.isDemoMode,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'OTP verification failed' });
  }
};

const releasePayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.buyerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to release payment.' });
    }

    const releaseResult = await paymentService.releasePayment({
      orderId: order._id,
      triggeredBy: req.user.role === 'ADMIN' ? 'ADMIN_RESOLUTION' : 'BUYER_MANUAL_RELEASE',
      userId: req.user.id,
    });

    return res.json({
      message: 'Payment released successfully to farmer account.',
      payout: releaseResult.payout,
      order: releaseResult.order,
      isDemoMode: releaseResult.isDemoMode,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Payment release failed' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateDeliveryStatus,
  sendDeliveryOTP,
  verifyDeliveryOTP,
  releasePayment,
};
