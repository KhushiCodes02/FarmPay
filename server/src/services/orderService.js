const Order = require('../models/Order');
const Produce = require('../models/Produce');
const auditService = require('./auditService');

// 5. VALID STATE MACHINE TRANSITIONS
const ALLOWED_TRANSITIONS = {
  PENDING_PAYMENT: ['PAYMENT_SECURED', 'CANCELLED'],
  PAYMENT_SECURED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED_PENDING_CONFIRMATION', 'PROCESSING'],
  DELIVERED_PENDING_CONFIRMATION: ['COMPLETED', 'DISPUTED'],
  DISPUTED: ['REFUNDED', 'COMPLETED'],
  COMPLETED: [], // Final state
  REFUNDED: [], // Final state
  CANCELLED: [], // Final state
};

const validateStateTransition = (currentStatus, nextStatus) => {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(nextStatus)) {
    throw new Error(`Invalid state transition from ${currentStatus} to ${nextStatus}.`);
  }
  return true;
};

/**
 * 8. ORDER CREATION - Backend must validate inventory and calculate total
 */
const createOrder = async ({ buyerId, produceId, quantity, deliveryDate, deliveryAddress }) => {
  if (!quantity || quantity <= 0) {
    throw new Error('Quantity must be greater than zero');
  }

  // 8. Backend validates quantity + current price from database
  // Atomically reserve inventory to prevent overselling
  const produce = await Produce.findOneAndUpdate(
    { _id: produceId, quantityAvailable: { $gte: quantity }, status: { $ne: 'INACTIVE' } },
    { $inc: { quantityAvailable: -quantity } },
    { new: true }
  );

  if (!produce) {
    const existing = await Produce.findById(produceId);
    if (!existing) throw new Error('Produce listing not found');
    throw new Error(`Insufficient stock. Requested: ${quantity}, Available: ${existing.quantityAvailable}`);
  }

  // Update status if stock ran out
  if (produce.quantityAvailable === 0) {
    produce.status = 'SOLD_OUT';
    await produce.save();
  } else if (produce.quantityAvailable < 20) {
    produce.status = 'LOW_STOCK';
    await produce.save();
  }

  // Total calculated strictly from DB price
  const unitPrice = produce.pricePerUnit;
  const totalAmount = Math.round(quantity * unitPrice);

  // Generate readable Order Number
  const orderNumber = `FP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  const order = await Order.create({
    orderNumber,
    buyerId,
    farmerId: produce.farmerId,
    produceId,
    quantity,
    unitPrice,
    totalAmount,
    deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    deliveryAddress: deliveryAddress || { street: '', city: produce.location, state: '', pincode: '' },
    status: 'PENDING_PAYMENT',
    paymentStatus: 'PENDING',
    deliveryStatus: 'NOT_STARTED',
    disputeStatus: 'NONE',
  });

  await auditService.logAction(order._id, buyerId, 'Order Created', {
    orderNumber,
    quantity,
    unitPrice,
    totalAmount,
    produceName: produce.cropName,
  });

  return order;
};

module.exports = {
  createOrder,
  validateStateTransition,
  ALLOWED_TRANSITIONS,
};
