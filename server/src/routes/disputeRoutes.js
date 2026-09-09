const express = require('express');
const router = express.Router();
const { raiseDispute, getDisputes, getDisputeById, resolveDispute } = require('../controllers/disputeController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.post('/', verifyToken, checkRole('BUYER', 'ADMIN'), raiseDispute);
router.get('/', verifyToken, getDisputes);
router.get('/:id', verifyToken, getDisputeById);
router.post('/:id/resolve', verifyToken, checkRole('ADMIN'), resolveDispute);

module.exports = router;
