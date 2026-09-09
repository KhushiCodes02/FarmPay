const Rating = require('../models/Rating');
const Order = require('../models/Order');
const User = require('../models/User');

const createRating = async (req, res) => {
  try {
    const { orderId, rating, review } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Rating can only be submitted for COMPLETED orders.' });
    }

    const isBuyer = order.buyerId.toString() === req.user.id;
    const isFarmer = order.farmerId.toString() === req.user.id;

    if (!isBuyer && !isFarmer) {
      return res.status(403).json({ error: 'Only participants of this order can submit ratings.' });
    }

    const toUserId = isBuyer ? order.farmerId : order.buyerId;

    const existing = await Rating.findOne({ orderId, fromUserId: req.user.id });
    if (existing) {
      return res.status(400).json({ error: 'You have already submitted a rating for this order.' });
    }

    const ratingDoc = await Rating.create({
      orderId,
      fromUserId: req.user.id,
      toUserId,
      rating: Number(rating),
      review: review || '',
    });

    const allRatings = await Rating.find({ toUserId });
    const totalScore = allRatings.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = Number((totalScore / allRatings.length).toFixed(1));

    await User.findByIdAndUpdate(toUserId, {
      rating: avgRating,
      ratingCount: allRatings.length,
    });

    return res.status(201).json({
      message: 'Rating submitted successfully',
      rating: ratingDoc,
      newAverageRating: avgRating,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Error submitting rating' });
  }
};

const getRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    const ratings = await Rating.find({ toUserId: userId })
      .populate('fromUserId', 'name role')
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 });

    return res.json({ ratings, count: ratings.length });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error fetching ratings' });
  }
};

module.exports = { createRating, getRatings };
