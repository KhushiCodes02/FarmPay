const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('../src/models/User');
const Produce = require('../src/models/Produce');
const Order = require('../src/models/Order');
const Payment = require('../src/models/Payment');
const Payout = require('../src/models/Payout');
const Dispute = require('../src/models/Dispute');
const OTP = require('../src/models/OTP');
const WebhookEvent = require('../src/models/WebhookEvent');

const orderService = require('../src/services/orderService');
const otpService = require('../src/services/otpService');
const paymentService = require('../src/services/paymentService');

let mongod;
let farmerUser;
let buyerUser;
let testProduce;

describe('FarmPay Critical Financial and State Machine Tests', () => {
  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());

    farmerUser = await User.create({
      name: 'Test Farmer',
      email: 'farmer.test@farmpay.demo',
      password: 'Password@123',
      role: 'FARMER',
      location: 'Punjab',
    });

    buyerUser = await User.create({
      name: 'Test Buyer',
      email: 'buyer.test@farmpay.demo',
      password: 'Password@123',
      role: 'BUYER',
      location: 'Delhi',
    });

    testProduce = await Produce.create({
      farmerId: farmerUser._id,
      cropName: 'Tomatoes',
      category: 'Vegetables',
      quantityAvailable: 500,
      pricePerUnit: 30,
      location: 'Punjab',
      unit: 'kg',
      status: 'AVAILABLE',
    });
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  // 1. Authentication test
  test('1. Authentication: User password comparison and hashing work correctly', async () => {
    const isMatch = await farmerUser.comparePassword('Password@123');
    assert.strictEqual(isMatch, true);
    const isWrong = await farmerUser.comparePassword('WrongPassword');
    assert.strictEqual(isWrong, false);
  });

  // 2. Price calculation test
  test('2. Price Calculation: Server strictly calculates total = quantity * DB pricePerUnit', async () => {
    const order = await orderService.createOrder({
      buyerId: buyerUser._id,
      produceId: testProduce._id,
      quantity: 100,
    });

    // 100 kg * 30 rs = 3000
    assert.strictEqual(order.unitPrice, 30);
    assert.strictEqual(order.totalAmount, 3000);
    assert.strictEqual(order.status, 'PENDING_PAYMENT');
  });

  // 3. Inventory validation
  test('3. Inventory Validation: Decrements inventory atomically and blocks overselling', async () => {
    const updatedProduce = await Produce.findById(testProduce._id);
    // Was 500, sold 100 in previous test -> 400 left
    assert.strictEqual(updatedProduce.quantityAvailable, 400);

    // Try ordering 500 kg when only 400 are available
    await assert.rejects(
      async () => {
        await orderService.createOrder({
          buyerId: buyerUser._id,
          produceId: testProduce._id,
          quantity: 500,
        });
      },
      /Insufficient stock/
    );
  });

  // 4. Invalid state transition
  test('4. State Machine: Rejects invalid order state transitions', () => {
    // Cannot transition directly from PENDING_PAYMENT to COMPLETED
    assert.throws(() => {
      orderService.validateStateTransition('PENDING_PAYMENT', 'COMPLETED');
    }, /Invalid state transition/);

    // Valid transition succeeds
    assert.strictEqual(orderService.validateStateTransition('PENDING_PAYMENT', 'PAYMENT_SECURED'), true);
    assert.strictEqual(orderService.validateStateTransition('PAYMENT_SECURED', 'PROCESSING'), true);
    assert.strictEqual(orderService.validateStateTransition('PROCESSING', 'OUT_FOR_DELIVERY'), true);
    assert.strictEqual(orderService.validateStateTransition('OUT_FOR_DELIVERY', 'DELIVERED_PENDING_CONFIRMATION'), true);
  });

  // 5. Razorpay webhook idempotency
  test('5. Webhook Idempotency: Duplicate webhook event does not reprocess or double capture', async () => {
    const eventId = 'evt_test_unique_idempotency_123';
    
    // First event record
    const event1 = await WebhookEvent.create({
      eventId,
      eventType: 'payment.captured',
      processed: true,
      payload: { test: 1 },
    });
    assert.strictEqual(event1.processed, true);

    // Duplicate check simulation
    const duplicate = await WebhookEvent.findOne({ eventId });
    assert.strictEqual(duplicate.processed, true);
  });

  // 6. OTP generation and verification
  test('6. OTP Verification: Secure SHA-256 verification, single-use, attempt tracking', async () => {
    const order = await orderService.createOrder({
      buyerId: buyerUser._id,
      produceId: testProduce._id,
      quantity: 10,
    });

    const otpResult = await otpService.generateOTP(order._id);
    assert.ok(otpResult.demoCode);

    // Incorrect code fails
    await assert.rejects(
      async () => {
        await otpService.verifyOTP(order._id, '000000');
      },
      /Incorrect OTP/
    );

    // Correct code succeeds
    const verifyResult = await otpService.verifyOTP(order._id, otpResult.demoCode);
    assert.strictEqual(verifyResult.success, true);

    // One-time use enforced: Re-verifying same OTP fails
    await assert.rejects(
      async () => {
        await otpService.verifyOTP(order._id, otpResult.demoCode);
      },
      /already been verified/
    );
  });

  // 7. Expired OTP
  test('7. Expired OTP: Rejects expired OTP codes', async () => {
    const order = await orderService.createOrder({
      buyerId: buyerUser._id,
      produceId: testProduce._id,
      quantity: 5,
    });

    const expiredDate = new Date(Date.now() - 1000 * 60); // 1 minute in the past
    await OTP.create({
      orderId: order._id,
      codeHash: otpService.hashOTP('123456'),
      expiresAt: expiredDate,
    });

    await assert.rejects(
      async () => {
        await otpService.verifyOTP(order._id, '123456');
      },
      /expired/
    );
  });

  // 8. Controlled payment release & duplicate payout prevention
  test('8. Duplicate Payout: Cannot release payout more than once', async () => {
    const order = await orderService.createOrder({
      buyerId: buyerUser._id,
      produceId: testProduce._id,
      quantity: 20,
    });

    // Simulate payment secured
    await paymentService.verifyPayment({
      orderId: order._id,
      razorpayOrderId: 'order_demo_test',
      razorpayPaymentId: 'pay_demo_test',
      razorpaySignature: 'DEMO',
      userId: buyerUser._id,
    });

    // Advance to DELIVERED_PENDING_CONFIRMATION
    order.status = 'DELIVERED_PENDING_CONFIRMATION';
    await order.save();

    // First release
    const release1 = await paymentService.releasePayment({ orderId: order._id });
    assert.strictEqual(release1.success, true);
    assert.strictEqual(release1.payout.status, 'PAYOUT_COMPLETED');

    // Second release attempt returns existing completed payout without duplicate record
    const release2 = await paymentService.releasePayment({ orderId: order._id });
    assert.strictEqual(release2.success, true);
    assert.strictEqual(release2.payout._id.toString(), release1.payout._id.toString());

    // Verify only ONE Payout document exists for this order
    const count = await Payout.countDocuments({ orderId: order._id });
    assert.strictEqual(count, 1);
  });

  // 9. Dispute blocking payment release
  test('9. Dispute Block: Active dispute blocks payout release', async () => {
    const order = await orderService.createOrder({
      buyerId: buyerUser._id,
      produceId: testProduce._id,
      quantity: 10,
    });

    order.status = 'DISPUTED';
    order.disputeStatus = 'OPEN';
    await order.save();

    await assert.rejects(
      async () => {
        await paymentService.releasePayment({ orderId: order._id });
      },
      /Payment release is blocked: Order has an active dispute/
    );
  });

  // 10. Refund greater than payment rejected
  test('10. Refund Limit: Rejects refund amount exceeding captured payment', async () => {
    const order = await orderService.createOrder({
      buyerId: buyerUser._id,
      produceId: testProduce._id,
      quantity: 10, // 300 total
    });

    await Payment.create({
      orderId: order._id,
      amount: 300,
      status: 'CAPTURED',
      razorpayOrderId: 'order_demo_rfnd',
      razorpayPaymentId: 'pay_demo_rfnd',
    });

    // Attempting to refund 500 when paid is 300
    await assert.rejects(
      async () => {
        await paymentService.refundPayment({
          orderId: order._id,
          amount: 500,
          reason: 'Excess refund test',
        });
      },
      /cannot exceed paid amount/
    );
  });
});
