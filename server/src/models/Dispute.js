const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
      type: String,
      enum: [
        'Quantity mismatch',
        'Quality issue',
        'Wrong produce',
        'Damaged produce',
        'Late delivery',
        'Non-delivery',
        'Other',
      ],
      required: true,
    },
    description: { type: String, required: true },
    refundAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED_REFUND', 'RESOLVED_PARTIAL_REFUND', 'RESOLVED_REJECTED_PAYOUT'],
      default: 'OPEN',
      index: true,
    },
    resolution: {
      notes: { type: String },
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      refundAmount: { type: Number, default: 0 },
      farmerPayoutAmount: { type: Number, default: 0 },
      resolvedAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dispute', disputeSchema);
