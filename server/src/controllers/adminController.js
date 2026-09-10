const User = require('../models/User');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Payout = require('../models/Payout');
const Dispute = require('../models/Dispute');
const AuditLog = require('../models/AuditLog');

const getStats = async (req, res) => {
  try {
    const [
      totalFarmers,
      totalBuyers,
      totalOrders,
      orders,
      capturedPayments,
      completedPayouts,
      openDisputes,
      allDisputesCount,
    ] = await Promise.all([
      User.countDocuments({ role: 'FARMER' }),
      User.countDocuments({ role: 'BUYER' }),
      Order.countDocuments(),
      Order.find().select('status paymentStatus totalAmount createdAt'),
      Payment.find({ status: { $in: ['CAPTURED', 'REFUNDED', 'PARTIALLY_REFUNDED'] } }),
      Payout.find({ status: 'PAYOUT_COMPLETED' }),
      Dispute.countDocuments({ status: 'OPEN' }),
      Dispute.countDocuments(),
    ]);

    const totalGMV = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalPaymentsSecured = capturedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPayoutsReleased = completedPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalRefundsAmount = totalPaymentsSecured - totalPayoutsReleased;

    const statusCounts = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    return res.json({
      totalFarmers,
      totalBuyers,
      totalOrders,
      totalGMV,
      totalPaymentsSecured,
      totalPayoutsReleased,
      totalRefunds: Math.max(0, totalRefundsAmount),
      openDisputes,
      allDisputesCount,
      statusCounts,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error loading admin stats' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json({ users, count: users.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('buyerId', 'name email businessName')
      .populate('farmerId', 'name email location')
      .populate('produceId', 'cropName category unit')
      .sort({ createdAt: -1 });
    return res.json({ orders, count: orders.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getRecentAuditTrail = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'name role email')
      .populate('orderId', 'orderNumber status')
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json({ logs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const resetPlatformData = async (req, res) => {
  try {
    const Produce = require('../models/Produce');
    const OTP = require('../models/OTP');
    const Rating = require('../models/Rating');

    await Promise.all([
      Produce.deleteMany({}),
      Order.deleteMany({}),
      Payment.deleteMany({}),
      Payout.deleteMany({}),
      Dispute.deleteMany({}),
      AuditLog.deleteMany({}),
      OTP.deleteMany({}),
      Rating.deleteMany({}),
    ]);

    return res.json({
      message: 'Platform demo data reset successfully. All orders, GMV, payments, and disputes are now cleared.',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error resetting platform data' });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  getAllOrders,
  getRecentAuditTrail,
  resetPlatformData,
};
