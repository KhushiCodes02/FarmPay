import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { disputeService } from '../services/disputeService';
import { ratingService } from '../services/ratingService';
import { useAuth } from '../context/AuthContext';
import StatusBadge, { PaymentBadge } from '../components/StatusBadge';
import OrderTimeline from '../components/OrderTimeline';
import RazorpayModal from '../components/RazorpayModal';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  KeyRound,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Truck,
  ArrowRight,
  Loader2,
  RefreshCw,
  Send,
  Lock,
} from 'lucide-react';

const DISPUTE_REASONS = [
  'Quantity mismatch',
  'Quality issue',
  'Wrong produce',
  'Damaged produce',
  'Late delivery',
  'Non-delivery',
  'Other',
];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isFarmer, isBuyer, isAdmin } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals & Inputs
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    reason: 'Quantity mismatch',
    description: '',
    refundAmount: '',
  });

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingReview, setRatingReview] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await orderService.getOrderById(id);
      setData(res);
      if (!disputeForm.refundAmount && res.order?.totalAmount) {
        setDisputeForm((prev) => ({ ...prev, refundAmount: res.order.totalAmount }));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-2">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <span className="text-xs text-slate-400">Loading order escrow details...</span>
      </div>
    );
  }

  if (error || !data?.order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This order could not be retrieved.'}</p>
        <Link to="/marketplace" className="inline-block px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const { order, payment, payout, dispute, auditLogs, activeDemoOTP, userRating, isDemoMode } = data;

  // Role Checks
  const isOrderBuyer = order.buyerId?._id === user?.id || order.buyerId === user?.id;
  const isOrderFarmer = order.farmerId?._id === user?.id || order.farmerId === user?.id;

  // Farmer Actions
  const handleFarmerAdvanceStatus = async (nextStatus) => {
    setActionLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await orderService.updateDeliveryStatus(order._id, nextStatus);
      setSuccessMessage(`Delivery status successfully advanced to ${nextStatus}`);
      await fetchOrder();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update delivery status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await orderService.sendDeliveryOTP(order._id);
      setSuccessMessage(`Fresh delivery OTP dispatched: ${res.demoCode || 'SMS sent'}`);
      await fetchOrder();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setActionLoading(false);
    }
  };

  // Buyer OTP Confirmation Action
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpInput) return;
    setActionLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      // 9. Buyer enters OTP -> Delivery confirmed -> Trigger payout/release
      const res = await orderService.verifyDeliveryOTP(order._id, otpInput);
      setSuccessMessage(res.message || 'Delivery confirmed! Farmer payout released.');
      setOtpInput('');
      await fetchOrder();
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Raise Dispute Action
  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await disputeService.raiseDispute({
        orderId: order._id,
        reason: disputeForm.reason,
        description: disputeForm.description,
        refundAmount: Number(disputeForm.refundAmount),
      });
      setShowDisputeModal(false);
      setSuccessMessage('Dispute registered successfully. Escrow locked pending review.');
      await fetchOrder();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to raise dispute');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Rating Action
  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await ratingService.createRating({
        orderId: order._id,
        rating: ratingStars,
        review: ratingReview,
      });
      setShowRatingModal(false);
      setSuccessMessage('Rating submitted successfully!');
      await fetchOrder();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit rating');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar: Back & Order Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link to={isFarmer ? '/farmer/orders' : '/buyer/orders'} className="hover:text-emerald-700">
              Orders
            </Link>
            <span>/</span>
            <span className="font-mono text-slate-700 font-semibold">{order.orderNumber}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center space-x-3">
            <span>Order #{order.orderNumber}</span>
            <StatusBadge status={order.status} />
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <PaymentBadge status={order.paymentStatus} />
          {payout?.status === 'PAYOUT_COMPLETED' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              ✓ Payout Released
            </span>
          )}
        </div>
      </div>

      {/* Alerts / Feedback Toasts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-600 hover:text-rose-900 font-bold">✕</button>
        </div>
      )}

      {/* 9. DEMO MODE OTP BANNER CALLOUT */}
      {activeDemoOTP && order.status === 'DELIVERED_PENDING_CONFIRMATION' && (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-5 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500 text-white uppercase tracking-wider">
              <KeyRound className="w-3.5 h-3.5 mr-1" />
              DEMO OTP READY
            </div>
            <h4 className="font-bold text-sm text-slate-900">
              Simulated SMS Sent to Buyer: <span className="text-emerald-800 font-mono text-lg font-black tracking-widest bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">{activeDemoOTP}</span>
            </h4>
            <p className="text-xs text-slate-600">
              Produce has arrived at warehouse. Enter this 6-digit code below to confirm inspection and release payout to the farmer.
            </p>
          </div>

          {(isOrderBuyer || isAdmin) && (
            <button
              onClick={() => setOtpInput(activeDemoOTP)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow transition-colors shrink-0"
            >
              Auto-fill OTP ({activeDemoOTP})
            </button>
          )}
        </div>
      )}

      {/* 11. DEMO MODE PAYOUT SIMULATION BADGE */}
      {payout?.isDemoMode && payout?.status === 'PAYOUT_COMPLETED' && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">DEMO MODE — payout simulated:</span>
            <span>₹{payout.amount.toLocaleString()} credited to Farmer Fund Account (Ref: {payout.razorpayReferenceId})</span>
          </div>
          <span className="text-[10px] text-slate-500">Zero live capital moved</span>
        </div>
      )}

      {/* 16. ORDER TIMELINE & INTERACTIVE AUDIT TRAIL */}
      <OrderTimeline order={order} auditLogs={auditLogs} />

      {/* ACTION WORKFLOW PANEL BASED ON ROLE & STATE */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
          <Truck className="w-5 h-5 text-emerald-600" />
          <span>Order Actions & Workflow Stage</span>
        </h3>

        {/* 1. Buyer: Payment Pending */}
        {order.status === 'PENDING_PAYMENT' && isOrderBuyer && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-amber-900 text-sm">Action Required: Secure Payment</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Lock ₹{order.totalAmount.toLocaleString()} into controlled escrow to allow farmer to dispatch produce.
              </p>
            </div>
            <button
              onClick={() => setShowRazorpayModal(true)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Pay with Razorpay (₹{order.totalAmount})</span>
            </button>
          </div>
        )}

        {/* 2. Farmer: Status Updates */}
        {isOrderFarmer && (
          <div className="space-y-4">
            {order.status === 'PAYMENT_SECURED' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-blue-900 text-sm">Payment Secured in Escrow (₹{order.totalAmount})</h4>
                  <p className="text-xs text-blue-700 mt-0.5">Start packing and sorting produce for dispatch.</p>
                </div>
                <button
                  onClick={() => handleFarmerAdvanceStatus('PROCESSING')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all disabled:opacity-50"
                >
                  Mark Processing
                </button>
              </div>
            )}

            {order.status === 'PROCESSING' && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-indigo-900 text-sm">Produce Ready for Transport</h4>
                  <p className="text-xs text-indigo-700 mt-0.5">Hand over crates to transit carrier.</p>
                </div>
                <button
                  onClick={() => handleFarmerAdvanceStatus('OUT_FOR_DELIVERY')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow transition-all disabled:opacity-50"
                >
                  Mark Out For Delivery
                </button>
              </div>
            )}

            {order.status === 'OUT_FOR_DELIVERY' && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-purple-900 text-sm">Consignment Arrived at Buyer</h4>
                  <p className="text-xs text-purple-700 mt-0.5">
                    Clicking "Delivered" will dispatch the delivery verification OTP to the buyer.
                  </p>
                </div>
                <button
                  onClick={() => handleFarmerAdvanceStatus('DELIVERED_PENDING_CONFIRMATION')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-all disabled:opacity-50"
                >
                  Mark Delivered & Generate OTP
                </button>
              </div>
            )}

            {order.status === 'DELIVERED_PENDING_CONFIRMATION' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Waiting for Buyer OTP Confirmation</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Buyer must inspect produce and enter OTP. If not disputed, auto-release releases payout in 24 hours.
                  </p>
                </div>
                <button
                  onClick={handleResendOTP}
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-dispatch OTP</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. Buyer: OTP Verification Form & Dispute Trigger */}
        {order.status === 'DELIVERED_PENDING_CONFIRMATION' && (isOrderBuyer || isAdmin) && (
          <div className="space-y-4">
            <div className="p-5 bg-emerald-50/60 border border-emerald-300 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm flex items-center">
                    <KeyRound className="w-4 h-4 mr-1.5 text-emerald-600" />
                    Confirm Delivery Inspection with OTP
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Enter the 6-digit OTP to confirm satisfactory arrival. This immediately executes payout release to the farmer.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDisputeModal(true)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline shrink-0"
                >
                  Have an issue? Raise Dispute
                </button>
              </div>

              <form onSubmit={handleVerifyOTP} className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.trim())}
                  placeholder="Enter 6-digit OTP"
                  className="w-full sm:w-60 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-center text-lg font-mono font-bold tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={actionLoading || otpInput.length !== 6}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm & Release Payout</span>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 4. Order Completed - Show Rating Button */}
        {order.status === 'COMPLETED' && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-emerald-950 text-sm">Order Fully Fulfilled & Settled</h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Delivery confirmed with OTP. Payout released to farmer bank account.
              </p>
            </div>
            {!userRating ? (
              <button
                onClick={() => setShowRatingModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center space-x-1"
              >
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>Rate {isOrderBuyer ? 'Farmer' : 'Buyer'}</span>
              </button>
            ) : (
              <span className="text-xs text-slate-500 font-medium">
                ⭐ You rated this order: <strong>{userRating.rating}/5</strong>
              </span>
            )}
          </div>
        )}

        {/* 5. Order Disputed - Active Notice */}
        {order.status === 'DISPUTED' && dispute && (
          <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Active Dispute Case</span>
              <span className="text-xs font-mono text-rose-600">Dispute ID: {dispute._id.toString().slice(-6)}</span>
            </div>
            <div className="text-sm font-semibold text-slate-900">Reason: {dispute.reason}</div>
            <p className="text-xs text-slate-600">{dispute.description}</p>
            <div className="text-xs text-slate-700 pt-2 border-t border-rose-200 flex justify-between">
              <span>Claimed Refund Amount: <strong>₹{dispute.refundAmount.toLocaleString()}</strong></span>
              <span className="text-rose-700 font-medium">Status: {dispute.status}</span>
            </div>
            {isAdmin && (
              <Link
                to="/disputes"
                className="inline-block mt-2 px-4 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg"
              >
                Open Admin Dispute Resolution Center
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ORDER DETAILS & FINANCIAL GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Produce & Financial Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Produce & Pricing Breakdown</h3>

          <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
            <img
              src={order.produceId?.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=120&q=80'}
              alt={order.produceId?.cropName}
              className="w-16 h-16 rounded-xl object-cover border border-slate-100"
            />
            <div>
              <h4 className="font-bold text-slate-900 text-base">{order.produceId?.cropName}</h4>
              <span className="text-xs text-slate-500">{order.produceId?.category}</span>
              <div className="text-xs font-semibold text-emerald-700 mt-1">
                ₹{order.unitPrice} per {order.produceId?.unit || 'kg'}
              </div>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Order Quantity:</span>
              <span className="font-bold text-slate-800">{order.quantity} {order.produceId?.unit || 'kg'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Unit Price (Verified from DB):</span>
              <span className="font-medium text-slate-800">₹{order.unitPrice}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Payment Escrow State:</span>
              <span className="font-semibold text-emerald-700">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Razorpay Order ID:</span>
              <span className="font-mono text-slate-500">{order.razorpayOrderId || 'Pending'}</span>
            </div>
            {order.releaseDeadline && (
              <div className="flex justify-between text-slate-600">
                <span>Auto-Release Deadline:</span>
                <span className="font-medium text-purple-700">{new Date(order.releaseDeadline).toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Contract Value:</span>
              <span className="text-emerald-700">₹{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Counterparty & Delivery Address */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Delivery & Counterparty Details</h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Farmer / Supplier</span>
              <div className="font-bold text-slate-900 mt-0.5">{order.farmerId?.name}</div>
              <p className="text-slate-500 text-[11px]">{order.farmerId?.businessName}</p>
              <div className="text-slate-500 text-[11px] mt-1">{order.farmerId?.phone}</div>
              <div className="text-amber-500 font-bold flex items-center mt-1 text-[11px]">
                <Star className="w-3 h-3 fill-amber-400 mr-1" />
                {order.farmerId?.rating || 4.8} / 5.0
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Buyer / Consignee</span>
              <div className="font-bold text-slate-900 mt-0.5">{order.buyerId?.name}</div>
              <p className="text-slate-500 text-[11px]">{order.buyerId?.businessName}</p>
              <div className="text-slate-500 text-[11px] mt-1">{order.buyerId?.phone}</div>
              <div className="text-slate-500 text-[11px] mt-1">{order.buyerId?.location}</div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Shipping Destination</span>
            <div className="font-semibold text-slate-800">
              {order.deliveryAddress?.street || 'Commercial Warehouse'}
            </div>
            <div className="text-slate-500">
              {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
            </div>
            <div className="text-slate-500 pt-1 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>Target Delivery Date: <strong>{new Date(order.deliveryDate).toLocaleDateString()}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* DISPUTE MODAL */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center space-x-2 text-rose-600 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">Raise Order Dispute</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Raising a dispute immediately freezes automatic escrow release until admin reviews claim evidence.
            </p>

            <form onSubmit={handleRaiseDispute} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Dispute</label>
                <select
                  value={disputeForm.reason}
                  onChange={(e) => setDisputeForm({ ...disputeForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {DISPUTE_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Requested Refund Amount (Max ₹{order.totalAmount})
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={order.totalAmount}
                  value={disputeForm.refundAmount}
                  onChange={(e) => setDisputeForm({ ...disputeForm, refundAmount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description of Discrepancy</label>
                <textarea
                  required
                  rows={3}
                  value={disputeForm.description}
                  onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })}
                  placeholder="State exact weight shortfall, spoiled produce details, or transit damage..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-colors"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Submit Dispute & Lock Funds'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RATING MODAL */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 mb-2">Rate Your Experience</h3>
            <p className="text-xs text-slate-500 mb-4">
              Help build community trust by rating produce quality and fulfillment timeliness.
            </p>

            <form onSubmit={handleSubmitRating} className="space-y-4 text-xs">
              <div className="flex items-center justify-center space-x-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingStars(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= ratingStars ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Feedback / Review</label>
                <textarea
                  rows={3}
                  value={ratingReview}
                  onChange={(e) => setRatingReview(e.target.value)}
                  placeholder="Comment on grain moisture, packaging, on-time delivery..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Submit Rating
                </button>
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Razorpay Escrow Modal */}
      {order && (
        <RazorpayModal
          isOpen={showRazorpayModal}
          onClose={() => setShowRazorpayModal(false)}
          order={order}
          onSuccess={() => {
            setSuccessMessage('Payment successfully captured & locked into escrow!');
            fetchOrder();
          }}
        />
      )}
    </div>
  );
};

export default OrderDetails;
