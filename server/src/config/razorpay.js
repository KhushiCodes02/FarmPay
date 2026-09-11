const Razorpay = require("razorpay");

const rawKeyId = (process.env.RAZORPAY_KEY_ID || "").trim();
const rawKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

const keyId = rawKeyId || "rzp_test_farmpaydemo123";
const keySecret = rawKeySecret;

let razorpayInstance = null;

try {
  if (keyId && keySecret && !keyId.startsWith("rzp_test_farmpaydemo")) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
} catch (error) {
  console.warn("Razorpay client initialization warning (using demo mode fallback):", error.message);
}

const isDemoMode = process.env.DEMO_MODE === "true" || !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith("rzp_test_farmpaydemo") || process.env.NODE_ENV === "test";

module.exports = {
  razorpayInstance,
  isDemoMode,
  keyId,
  keySecret,
  hasLiveRazorpay: Boolean(razorpayInstance),
  webhookSecret: (process.env.RAZORPAY_WEBHOOK_SECRET || "demo_webhook_secret_farmpay").trim(),
};


