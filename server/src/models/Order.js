const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    produceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produce', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryDate: { type: Date },
    deliveryAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: [
        'PENDING_PAYMENT',
        'PAYMENT_SECURED',
        'PROCESSING',
        'OUT_FOR_DELIVERY',
        'DELIVERED_PENDING_CONFIRMATION',
        'COMPLETED',
        'DISPUTED',
        'REFUNDED',
        'CANCELLED',
      ],
      default: 'PENDING_PAYMENT',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'SECURED', 'RELEASED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
      default: 'PENDING',
    },
    deliveryStatus: {
      type: String,
      enum: ['NOT_STARTED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED_PENDING_CONFIRMATION', 'CONFIRMED_DELIVERED'],
      default: 'NOT_STARTED',
    },
    disputeStatus: {
      type: String,
      enum: ['NONE', 'OPEN', 'RESOLVED_REFUND', 'RESOLVED_PAYOUT', 'RESOLVED_PARTIAL_REFUND'],
      default: 'NONE',
    },
    releaseDeadline: { type: Date },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpayPaymentLinkId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
