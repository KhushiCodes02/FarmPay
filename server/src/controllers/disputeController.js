const Dispute = require('../models/Dispute');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const paymentService = require('../services/paymentService');
const auditService = require('../services/auditService');

const raiseDispute = async (req, res) => {
  try {
    const { orderId, reason, description, refundAmount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.buyerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only the buyer who placed the order can raise a dispute.' });
    }

    if (order.status === 'COMPLETED' && order.paymentStatus === 'RELEASED') {
      return res.status(400).json({ error: 'Dispute cannot be raised: Payment has already been released to farmer.' });
    }

    if (order.status === 'DISPUTED') {
      return res.status(400).json({ error: 'A dispute is already open for this order.' });
    }

    const requestedRefund = refundAmount ? Number(refundAmount) : order.totalAmount;
    if (requestedRefund > order.totalAmount) {
      return res.status(400).json({ error: `Requested refund (₹${requestedRefund}) cannot exceed order total (₹${order.totalAmount})` });
    }

    const dispute = await Dispute.create({
      orderId: order._id,
      buyerId: order.buyerId,
      farmerId: order.farmerId,
      reason,
      description,
      refundAmount: requestedRefund,
      status: 'OPEN',
    });

    order.status = 'DISPUTED';
    order.disputeStatus = 'OPEN';
    await order.save();

    await auditService.logAction(order._id, req.user.id, 'Dispute Opened', {
      disputeId: dispute._id,
      reason,
      requestedRefund,
      note: 'Payment protected. Automatic 24h release blocked.',
    });

    return res.status(201).json({
      message: 'Dispute raised successfully. Escrow payment locked pending resolution.',
      dispute,
      order,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to raise dispute' });
  }
};

const getDisputes = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'BUYER') {
      filter.buyerId = req.user.id;
    } else if (req.user.role === 'FARMER') {
      filter.farmerId = req.user.id;
    }

    const disputes = await Dispute.find(filter)
      .populate('buyerId', 'name email phone businessName')
      .populate('farmerId', 'name email phone location')
      .populate({
        path: 'orderId',
        populate: { path: 'produceId', select: 'cropName category unit' }
      })
      .sort({ createdAt: -1 });

    return res.json({ disputes, count: disputes.length });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error fetching disputes' });
  }
};

const getDisputeById = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('buyerId', 'name email phone businessName')
      .populate('farmerId', 'name email phone location bankAccount')
      .populate({
        path: 'orderId',
        populate: { path: 'produceId', select: 'cropName category unit pricePerUnit' }
      });

    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    return res.json({ dispute });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error fetching dispute' });
  }
};

const resolveDispute = async (req, res) => {
  try {
    const { action, refundAmount, notes } = req.body;
    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    if (dispute.status !== 'OPEN' && dispute.status !== 'UNDER_REVIEW') {
      return res.status(400).json({ error: 'This dispute has already been resolved.' });
    }

    const order = await Order.findById(dispute.orderId);
    if (!order) return res.status(404).json({ error: 'Associated order not found' });

    let resolutionResult;
    let newDisputeStatus;
    let actualRefund = 0;
    let farmerPayout = 0;

    if (action === 'FULL_REFUND') {
      actualRefund = order.totalAmount;
      resolutionResult = await paymentService.refundPayment({
        orderId: order._id,
        amount: order.totalAmount,
        reason: notes || `Dispute resolved: Full refund for ${dispute.reason}`,
        adminId: req.user.id,
        disputeId: dispute._id,
      });
      newDisputeStatus = 'RESOLVED_REFUND';
      order.disputeStatus = 'RESOLVED_REFUND';
    } else if (action === 'PARTIAL_REFUND') {
      actualRefund = Number(refundAmount);
      if (!actualRefund || actualRefund <= 0 || actualRefund >= order.totalAmount) {
        return res.status(400).json({
          error: `Partial refund must be greater than 0 and less than total order amount (₹${order.totalAmount}).`
        });
      }
      farmerPayout = order.totalAmount - actualRefund;
      resolutionResult = await paymentService.refundPayment({
        orderId: order._id,
        amount: actualRefund,
        reason: notes || `Dispute resolved: Partial refund of ₹${actualRefund} for ${dispute.reason}`,
        adminId: req.user.id,
        disputeId: dispute._id,
      });
      newDisputeStatus = 'RESOLVED_PARTIAL_REFUND';
      order.disputeStatus = 'RESOLVED_PARTIAL_REFUND';
    } else if (action === 'APPROVE_PAYOUT') {
      farmerPayout = order.totalAmount;
      order.disputeStatus = 'RESOLVED_PAYOUT';
      await order.save();

      resolutionResult = await paymentService.releasePayment({
        orderId: order._id,
        triggeredBy: 'ADMIN_RESOLUTION',
        userId: req.user.id,
      });
      newDisputeStatus = 'RESOLVED_REJECTED_PAYOUT';
    } else {
      return res.status(400).json({ error: 'Invalid resolution action. Use FULL_REFUND, PARTIAL_REFUND, or APPROVE_PAYOUT.' });
    }

    dispute.status = newDisputeStatus;
    dispute.resolution = {
      notes: notes || 'Resolved by Platform Admin',
      resolvedBy: req.user.id,
      refundAmount: actualRefund,
      farmerPayoutAmount: farmerPayout,
      resolvedAt: new Date(),
    };
    await dispute.save();
    await order.save();

    await auditService.logAction(order._id, req.user.id, 'Dispute Resolved', {
      action,
      refundAmount: actualRefund,
      farmerPayout,
      disputeId: dispute._id,
      notes,
    });

    return res.json({
      message: `Dispute resolved with ${action}`,
      dispute,
      order,
      resolutionResult,
    });
  } catch (error) {
    console.error('resolveDispute error:', error);
    return res.status(400).json({ error: error.message || 'Error resolving dispute' });
  }
};

module.exports = {
  raiseDispute,
  getDisputes,
  getDisputeById,
  resolveDispute,
};
