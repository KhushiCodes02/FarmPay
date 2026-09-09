const cron = require('node-cron');
const Order = require('../models/Order');
const paymentService = require('../services/paymentService');
const auditService = require('../services/auditService');

/**
 * 10. AUTO RELEASE BACKGROUND JOB
 * Runs every minute to find orders past the 24-hour release deadline
 * that have no dispute and haven't yet been manually confirmed.
 * Do NOT rely on setTimeout().
 */
const initAutoReleaseJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      const eligibleOrders = await Order.find({
        status: 'DELIVERED_PENDING_CONFIRMATION',
        releaseDeadline: { $lte: now },
        disputeStatus: 'NONE',
      });

      if (eligibleOrders.length > 0) {
        console.log(`[AutoRelease Job] Found ${eligibleOrders.length} order(s) eligible for auto-release.`);
      }

      for (const order of eligibleOrders) {
        try {
          console.log(`[AutoRelease Job] Auto-releasing payment for Order: ${order.orderNumber} (ID: ${order._id})`);
          
          await auditService.logAction(order._id, null, 'Auto Release Triggered', {
            releaseDeadline: order.releaseDeadline,
            now,
            note: '24-hour dispute window expired without dispute. Controlled payment released to farmer.',
          });

          await paymentService.releasePayment({
            orderId: order._id,
            triggeredBy: 'AUTO_RELEASE_DEADLINE',
          });

          console.log(`[AutoRelease Job] Successfully auto-released Order: ${order.orderNumber}`);
        } catch (orderErr) {
          console.error(`[AutoRelease Job] Error processing order ${order._id}:`, orderErr.message);
        }
      }
    } catch (err) {
      console.error('[AutoRelease Job] Scheduled job error:', err.message);
    }
  });

  console.log('Auto-release background cron job initialized (checking every minute).');
};

module.exports = { initAutoReleaseJob };
