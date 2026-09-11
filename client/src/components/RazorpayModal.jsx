import React, { useState } from 'react';
import { ShieldCheck, Lock, Check, Loader2, CreditCard, ArrowRight } from 'lucide-react';
import { paymentService } from '../services/paymentService';

const RazorpayModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [simulationStep, setSimulationStep] = useState(0);

  if (!isOpen || !order) return null;

  const handleSimulatePayment = async () => {
    setLoading(true);
    setError('');
    setSimulationStep(1); // Connecting

    try {
      // 1. Create payment session on backend
      const session = await paymentService.createPaymentSession(order._id);
      setSimulationStep(2); // Authorizing Escrow Lock

      await new Promise((r) => setTimeout(r, 600));

      // 2. Verify payment session
      const verifyPayload = {
        orderId: order._id,
        razorpayOrderId: session.razorpayOrderId,
        razorpayPaymentId: `pay_demo_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        razorpaySignature: 'DEMO_VERIFIED_SIGNATURE_FARMPAY',
      };

      const result = await paymentService.verifyPayment(verifyPayload);
      setSimulationStep(3); // Secured!

      await new Promise((r) => setTimeout(r, 400));
      onSuccess(result.order);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Payment simulation failed');
      setSimulationStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleLiveRazorpay = async () => {
    setLoading(true);
    setError('');
    setSimulationStep(0);

    try {
      // 1. Create payment session on backend (preferring real Razorpay order)
      const session = await paymentService.createPaymentSession(order._id, false);

      // Verify Razorpay Checkout SDK is loaded
      if (!window.Razorpay) {
        // Load dynamically if not loaded
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Razorpay Checkout SDK.'));
          document.body.appendChild(script);
        });
      }

      if (window.Razorpay) {
        const isDemoOrder = session.razorpayOrderId?.startsWith('order_demo_');
        const options = {
          key: session.keyId,
          amount: Math.round(order.totalAmount * 100),
          currency: 'INR',
          name: 'FarmPay Agricultural Escrow',
          description: `Secured Escrow for Order #${order.orderNumber}`,
          image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=120&q=80',
          order_id: isDemoOrder ? undefined : session.razorpayOrderId,
          handler: async function (response) {
            try {
              setLoading(true);
              const verifyRes = await paymentService.verifyPayment({
                orderId: order._id,
                razorpayOrderId: response.razorpay_order_id || session.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              onSuccess(verifyRes.order);
              onClose();
            } catch (vErr) {
              setError(vErr.response?.data?.error || 'Signature verification failed');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: order.buyerId?.name || 'Valued Buyer',
            email: order.buyerId?.email || '',
            contact: order.buyerId?.phone || '',
          },
          theme: {
            color: '#059669',
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setError(resp.error?.description || 'Payment failed or was cancelled');
          setLoading(false);
        });
        rzp.open();
      } else {
        await handleSimulatePayment();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to initiate Razorpay session');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">FarmPay Escrow Checkout</h3>
          <p className="text-xs text-slate-500">
            Powered by Razorpay Orders & Controlled Payment Release
          </p>
        </div>

        <div className="my-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Produce:</span>
            <span className="font-semibold text-slate-800">{order.produceId?.cropName}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Quantity:</span>
            <span className="font-medium text-slate-800">{order.quantity} {order.produceId?.unit || 'kg'}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Unit Price:</span>
            <span className="font-medium text-slate-800">₹{order.unitPrice} / {order.produceId?.unit || 'kg'}</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-bold text-slate-900">
            <span>Total Payable:</span>
            <span className="text-emerald-700">₹{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-start space-x-2">
          <Lock className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
          <p>
            <strong>Buyer Protection Guarantee:</strong> Your ₹{order.totalAmount.toLocaleString()} remains safely secured in escrow. Funds are transferred to the farmer only after you inspect produce and share the OTP.
          </p>
        </div>

        {error && (
          <div className="mt-3 text-xs text-rose-600 bg-rose-50 p-2.5 rounded border border-rose-200">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {/* Primary Action: Live Razorpay Gateway */}
          <button
            onClick={handleLiveRazorpay}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-sm"
          >
            {loading && simulationStep === 0 ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Opening Razorpay Gateway...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay ₹{order.totalAmount.toLocaleString()} with Razorpay</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-center text-slate-400">
            Supports UPI (GPay, PhonePe, Paytm), QR Code, Cards & NetBanking
          </p>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold tracking-wider">Or Instant Demo Mode</span>
            </div>
          </div>

          {/* Secondary Action: 1-Click Simulation */}
          <button
            onClick={handleSimulatePayment}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 text-xs disabled:opacity-50"
          >
            {loading && simulationStep > 0 ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>
                  {simulationStep === 1 && 'Creating Escrow Order...'}
                  {simulationStep === 2 && 'Securing Funds in Escrow...'}
                  {simulationStep === 3 && 'Payment Secured!'}
                </span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>1-Click Test Escrow Simulation</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 font-medium"
          >
            Cancel and Review Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default RazorpayModal;

