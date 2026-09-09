const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: '' },
  },
  { timestamps: true }
);

// Prevent multiple ratings for the same order from the same user
ratingSchema.index({ orderId: 1, fromUserId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
