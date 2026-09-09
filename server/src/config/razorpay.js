const Razorpay = require("razorpay");

const isDemoMode = process.env.DEMO_MODE === "true" || !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith("rzp_test_farmpaydemo");

let razorpayInstance = null;

try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (error) {
  console.warn("Razorpay client initialization warning (using demo mode fallback):", error.message);
}

module.exports = {
  razorpayInstance,
  isDemoMode,
  keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_farmpaydemo123",
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "demo_webhook_secret_farmpay",
};
