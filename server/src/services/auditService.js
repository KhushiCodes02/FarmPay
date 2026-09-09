const AuditLog = require('../models/AuditLog');

const logAction = async (orderId, userId, action, metadata = {}) => {
  try {
    const log = await AuditLog.create({
      orderId,
      userId,
      action,
      metadata,
    });
    return log;
  } catch (error) {
    console.error('Failed to create AuditLog:', error.message);
  }
};

const getOrderAuditLogs = async (orderId) => {
  return AuditLog.find({ orderId }).sort({ createdAt: 1 }).populate('userId', 'name role email');
};

module.exports = { logAction, getOrderAuditLogs };
