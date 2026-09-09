const crypto = require('crypto');
const WebhookEvent = require('../models/WebhookEvent');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const auditService = require('../services/auditService');
const { webhookSecret, isDemoMode } = require('../config/razorpay');

/**
 * 6. RAZORPAY WEBHOOK HANDLER
 * Idempotent, signature-verified, never trusts frontend payment status
 */
const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const event = req.body;

    if (!event || !event.event) {
      return res.status(400).json({ error: 'Invalid webhook payload structure' });
    }

    const eventId = event.event_id || `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 6. IDEMPOTENCY CHECK
    // A duplicate webhook must not re-trigger actions
    const existingEvent = await WebhookEvent.findOne({ eventId });
    if (existingEvent && existingEvent.processed) {
      console.log(`Webhook duplicate ignored (Idempotent): ${eventId}`);
      return res.status(200).json({ status: 'ok', message: 'Webhook already processed' });
    }

    // Verify webhook signature (when not pure demo mock)
    if (!isDemoMode && signature && process.env.RAZORPAY_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('Razorpay Webhook signature verification failed');
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    const webhookDoc = await WebhookEvent.create({
      eventId,
      eventType: event.event,
      processed: false,
      payload: event,
    });

    const payload = event.payload;

    if (event.event === 'payment.captured' && payload && payload.payment) {
      const paymentEntity = payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;
      const notes = paymentEntity.notes || {};

      let order;
      if (notes.orderId) {
        order = await Order.findById(notes.orderId);
      } else {
        order = await Order.findOne({ razorpayOrderId });
      }

      if (order && order.status === 'PENDING_PAYMENT') {
        order.status = 'PAYMENT_SECURED';
        order.paymentStatus = 'SECURED';
        order.razorpayOrderId = razorpayOrderId;
        order.razorpayPaymentId = razorpayPaymentId;
        await order.save();

        await Payment.findOneAndUpdate(
          { orderId: order._id },
          {
            status: 'CAPTURED',
            razorpayOrderId,
            razorpayPaymentId,
            amount: paymentEntity.amount / 100,
          },
          { new: true, upsert: true }
        );

        await auditService.logAction(order._id, order.buyerId, 'Payment Secured (Webhook)', {
          eventId,
          razorpayPaymentId,
          amount: paymentEntity.amount / 100,
        });
      }
    }

    webhookDoc.processed = true;
    await webhookDoc.save();

    return res.status(200).json({ status: 'ok', processed: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(200).json({ status: 'error_logged', message: error.message });
  }
};

module.exports = { handleRazorpayWebhook };
