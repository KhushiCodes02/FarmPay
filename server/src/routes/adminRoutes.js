const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, getAllOrders, getRecentAuditTrail } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.use(verifyToken, checkRole('ADMIN'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/orders', getAllOrders);
router.get('/audit-trail', getRecentAuditTrail);

module.exports = router;
