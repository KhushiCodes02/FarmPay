const express = require('express');
const router = express.Router();
const { createRating, getRatings } = require('../controllers/ratingController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createRating);
router.get('/user/:userId', getRatings);

module.exports = router;
