const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true, index: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PAYOUT_PENDING', 'PAYOUT_PROCESSING', 'PAYOUT_COMPLETED', 'PAYOUT_FAILED'],
      default: 'PAYOUT_PENDING',
    },
    razorpayReferenceId: { type: String },
    isDemoMode: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payout', payoutSchema);
