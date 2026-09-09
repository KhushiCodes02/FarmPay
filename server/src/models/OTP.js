const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    codeHash: { type: String, required: true },
    rawDemoCode: { type: String }, // Provided only for DEMO_MODE visibility
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OTP', otpSchema);
