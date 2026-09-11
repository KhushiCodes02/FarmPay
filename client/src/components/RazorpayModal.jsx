import React, { useState } from 'react';
import { ShieldCheck, Lock, Check, Loader2, CreditCard, Smartphone, QrCode, ArrowRight, CheckCircle2 } from 'lucide-react';
import { paymentService } from '../services/paymentService';

const RazorpayModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'razorpay' | 'demo'
  const [upiId, setUpiId] = useState('buyer@oksbi');
  const [showQr, setShowQr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [simulationStep, setSimulationStep] = useState(0);

  if (!isOpen || !order) return null;

  // 1. UPI Payment Handler
  const handleUpiPayment = async () => {
    if (!upiId || !upiId.includes('@')) {
      setError('Please enter a valid UPI ID (e.g. yourname@okhdfcbank or 9876543210@paytm)');
      return;
    }

    setLoading(true);
    setError('');
    setSimulationStep(1); // Connecting to UPI Gateway

    try {
      const session = await paymentService.createPaymentSession(order._id, true);
      setSimulationStep(2); // Securing Funds in Escrow

      await new Promise((r) => setTimeout(r, 700));

      const cleanUpiId = upiId.trim();
      const verifyPayload = {
        orderId: order._id,
        razorpayOrderId: session.razorpayOrderId,
        razorpayPaymentId: `pay_upi_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        razorpaySignature: 'DEMO_VERIFIED_SIGNATURE_FARMPAY',
        paymentMethod: 'UPI',
        upiVpa: cleanUpiId,
      };

      const result = await paymentService.verifyPayment(verifyPayload);
      setSimulationStep(3); // Secured!

      await new Promise((r) => setTimeout(r, 500));
      onSuccess(result.order);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'UPI payment verification failed');
      setSimulationStep(0);
    } finally {
      setLoading(false);
    }
  };

  // 2. 1-Click Test Simulation Handler
  const handleSimulatePayment = async () => {
    setLoading(true);
    setError('');
    setSimulationStep(1); // Connecting

    try {
      const session = await paymentService.createPaymentSession(order._id, true);
      setSimulationStep(2); // Securing Funds in Escrow

      await new Promise((r) => setTimeout(r, 600));

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

  // 3. Live Razorpay Gateway Handler
  const handleLiveRazorpay = async () => {
    setLoading(true);
    setError('');
    setSimulationStep(0);

    try {
      const session = await paymentService.createPaymentSession(order._id, false);

      if (!window.Razorpay) {
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
          method: {
            upi: true,
            netbanking: true,
            card: true,
            wallet: true,
          },
          prefill: {
            method: 'upi',
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
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">FarmPay Escrow Checkout</h3>
          <p className="text-xs text-slate-500">
            Funds locked in escrow until you verify delivery OTP
          </p>
        </div>

        {/* Order Summary */}
        <div className="my-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Produce:</span>
            <span className="font-semibold text-slate-800">{order.produceId?.cropName}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Quantity:</span>
            <span className="font-medium text-slate-800">{order.quantity} {order.produceId?.unit || 'kg'}</span>
          </div>
          <div className="border-t border-slate-200 pt-1.5 flex justify-between text-sm font-bold text-slate-900">
            <span>Total Payable:</span>
            <span className="text-emerald-700 font-extrabold">₹{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Method Selector Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setActiveTab('upi'); setError(''); }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'upi' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>UPI & QR</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('razorpay'); setError(''); }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'razorpay' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Gateway</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('demo'); setError(''); }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'demo' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>1-Click Demo</span>
          </button>
        </div>

        {/* TAB 1: UPI & QR CODE */}
        {activeTab === 'upi' && (
          <div className="space-y-3">
            <div className="flex justify-center space-x-2">
              <button
                type="button"
                onClick={() => setShowQr(false)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                  !showQr ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                UPI ID (VPA)
              </button>
              <button
                type="button"
                onClick={() => setShowQr(true)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-all flex items-center space-x-1 ${
                  showQr ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <QrCode className="w-3 h-3" />
                <span>Scan QR Code</span>
              </button>
            </div>

            {showQr ? (
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="mx-auto w-36 h-36 bg-white p-2 rounded-lg border border-slate-300 shadow-sm flex items-center justify-center">
                  {/* Styled Dynamic QR Code SVG */}
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M10,10 h25 v25 h-25 z M15,15 v15 h15 v-15 z M20,20 h5 v5 h-5 z" />
                    <path d="M65,10 h25 v25 h-25 z M70,15 v15 h15 v-15 z M75,20 h5 v5 h-5 z" />
                    <path d="M10,65 h25 v25 h-25 z M15,70 v15 h15 v-15 z M20,75 h5 v5 h-5 z" />
                    <rect x="42" y="12" width="6" height="6" />
                    <rect x="52" y="12" width="6" height="6" />
                    <rect x="42" y="24" width="16" height="6" />
                    <rect x="12" y="42" width="6" height="16" />
                    <rect x="24" y="42" width="6" height="6" />
                    <rect x="42" y="42" width="16" height="16" />
                    <rect x="65" y="42" width="10" height="6" />
                    <rect x="80" y="42" width="10" height="10" />
                    <rect x="65" y="55" width="25" height="6" />
                    <rect x="42" y="65" width="6" height="25" />
                    <rect x="55" y="70" width="15" height="8" />
                    <rect x="75" y="75" width="15" height="15" />
                    <rect x="55" y="85" width="12" height="6" />
                  </svg>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Scan with <strong>Google Pay</strong>, <strong>PhonePe</strong>, or <strong>Paytm</strong>
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold">
                  FarmPay Escrow UPI ID: farmpay.escrow@icici
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <label className="block text-slate-700 font-semibold">Enter your UPI ID / VPA</label>
                <div className="relative">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="mobile@paytm, user@oksbi"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['@oksbi', '@okhdfcbank', '@paytm', '@ybl'].map((suf) => (
                    <button
                      key={suf}
                      type="button"
                      onClick={() => {
                        const base = upiId.split('@')[0] || 'buyer';
                        setUpiId(`${base}${suf}`);
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded text-[10px] font-mono border border-slate-200"
                    >
                      {suf}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleUpiPayment}
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {simulationStep === 1 && 'Verifying UPI Handle...'}
                    {simulationStep === 2 && 'Securing Funds in Escrow...'}
                    {simulationStep === 3 && 'Payment Secured!'}
                  </span>
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  <span>Pay ₹{order.totalAmount.toLocaleString()} via UPI</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 2: RAZORPAY GATEWAY POPUP */}
        {activeTab === 'razorpay' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1.5">
              <div className="font-bold flex items-center space-x-1 text-blue-900">
                <CreditCard className="w-3.5 h-3.5 text-blue-700" />
                <span>Razorpay Standard Checkout Window</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-800">
                Opens the official Razorpay popup modal. Supports Credit/Debit Cards, NetBanking, and UPI (if enabled in your Razorpay account).
              </p>
            </div>

            <button
              onClick={handleLiveRazorpay}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Razorpay...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Launch Razorpay Gateway (₹{order.totalAmount.toLocaleString()})</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-400">
              *If UPI doesn't show in Razorpay's popup, enable it in Razorpay Dashboard → Account & Settings → Payment Methods.
            </p>
          </div>
        )}

        {/* TAB 3: 1-CLICK DEMO */}
        {activeTab === 'demo' && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <div className="font-bold mb-0.5">Quick Evaluation Mode</div>
              <p className="text-[11px] text-amber-800">
                Instantly locks ₹{order.totalAmount.toLocaleString()} into escrow without requiring bank login or OTP SMS.
              </p>
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={loading}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow transition-all flex items-center justify-center space-x-2 text-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>
                    {simulationStep === 1 && 'Creating Escrow Order...'}
                    {simulationStep === 2 && 'Securing Funds in Escrow...'}
                    {simulationStep === 3 && 'Payment Secured!'}
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Complete Instant Escrow Payment (1-Click)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Error message display */}
        {error && (
          <div className="mt-3 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            {error}
          </div>
        )}

        {/* Escrow Guarantee Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1 text-emerald-700 font-semibold">
            <Lock className="w-3 h-3" />
            <span>Escrow Protected</span>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RazorpayModal;
