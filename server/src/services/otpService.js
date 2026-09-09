const crypto = require('crypto');
const OTP = require('../models/OTP');
const { isDemoMode } = require('../config/razorpay');

const hashOTP = (code) => {
  return crypto.createHash('sha256').update(code.toString()).digest('hex');
};

const generateOTP = async (orderId) => {
  // Generate secure 6-digit random number
  const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = hashOTP(rawCode);

  // Expiration in 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Invalidate any existing active OTP for this order
  await OTP.deleteMany({ orderId });

  const otpDoc = await OTP.create({
    orderId,
    codeHash,
    rawDemoCode: isDemoMode ? rawCode : undefined,
    expiresAt,
    attempts: 0,
    maxAttempts: 3,
  });

  if (isDemoMode) {
    console.log(`===============================================`);
    console.log(`[DEMO MODE OTP DISPATCH]`);
    console.log(`Order ID: ${orderId}`);
    console.log(`Simulated SMS sent to Buyer with OTP: ${rawCode}`);
    console.log(`Valid for 15 minutes`);
    console.log(`===============================================`);
  }

  return {
    success: true,
    expiresAt,
    demoCode: isDemoMode ? rawCode : null,
  };
};

const verifyOTP = async (orderId, inputCode) => {
  if (!inputCode) {
    throw new Error('OTP code is required');
  }

  const otpDoc = await OTP.findOne({ orderId }).sort({ createdAt: -1 });

  if (!otpDoc) {
    throw new Error('No active OTP found for this order. Please request a new delivery confirmation code.');
  }

  if (otpDoc.verifiedAt) {
    throw new Error('This OTP has already been verified. One-time use policy enforced.');
  }

  if (new Date() > otpDoc.expiresAt) {
    throw new Error('OTP has expired. Please request a new delivery confirmation code.');
  }

  if (otpDoc.attempts >= otpDoc.maxAttempts) {
    throw new Error('Maximum OTP verification attempts exceeded (3/3). Request a fresh code.');
  }

  const inputHash = hashOTP(inputCode.trim());

  if (inputHash !== otpDoc.codeHash) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    const remaining = otpDoc.maxAttempts - otpDoc.attempts;
    throw new Error(`Incorrect OTP. ${remaining} attempt(s) remaining.`);
  }

  otpDoc.verifiedAt = new Date();
  await otpDoc.save();

  return { success: true, verifiedAt: otpDoc.verifiedAt };
};

const getActiveDemoOTP = async (orderId) => {
  if (!isDemoMode) return null;
  const otpDoc = await OTP.findOne({ orderId, verifiedAt: { $exists: false } }).sort({ createdAt: -1 });
  if (!otpDoc || new Date() > otpDoc.expiresAt) return null;
  return otpDoc.rawDemoCode;
};

module.exports = {
  generateOTP,
  verifyOTP,
  getActiveDemoOTP,
  hashOTP,
};
