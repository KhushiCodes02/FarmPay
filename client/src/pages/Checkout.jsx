import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import RazorpayModal from '../components/RazorpayModal';
import { ShieldCheck, MapPin, Calendar, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const produce = location.state?.produce;
  const initialQuantity = location.state?.selectedQuantity || 10;

  if (!produce) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-800">No produce selected</h2>
        <p className="text-xs text-slate-500">Please choose a produce listing from the marketplace.</p>
        <Link to="/marketplace" className="inline-block px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  const [quantity, setQuantity] = useState(initialQuantity);
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [address, setAddress] = useState({
    street: 'Sector 18 Commercial Hub',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);

  // Price estimate (for buyer UI display - backend calculates actual total strictly from DB)
  const estimatedTotal = quantity * produce.pricePerUnit;

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 8. Order creation: backend calculates totalAmount = quantity * DB pricePerUnit
      const res = await orderService.createOrder({
        produceId: produce._id,
        quantity: Number(quantity),
        deliveryDate: new Date(deliveryDate),
        deliveryAddress: address,
      });

      setCreatedOrder(res.order);
      setShowRazorpayModal(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initialize order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (updatedOrder) => {
    navigate(`/orders/${updatedOrder._id}`, {
      state: { paymentSuccessNotice: true },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Confirm Order & Escrow Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review delivery details. Funds are held in escrow until you verify delivery with OTP.
        </p>
      </div>

      {error && (
        <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Form: Delivery Address & Date */}
        <form onSubmit={handleCreateOrder} className="md:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Target Delivery Date</span>
            </h3>
            <input
              type="date"
              required
              value={deliveryDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Delivery Address / Warehouse</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  placeholder="Street / Warehouse dock"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg hover:shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Secure Order & Proceed to Razorpay</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Right Col: Order Summary */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Order Summary</h3>

            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <img
                src={produce.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=120&q=80'}
                alt={produce.cropName}
                className="w-14 h-14 rounded-xl object-cover border border-slate-100"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{produce.cropName}</h4>
                <p className="text-xs text-slate-500">From: {produce.farmerId?.name}</p>
                <span className="text-xs font-semibold text-emerald-700">₹{produce.pricePerUnit} / {produce.unit}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Quantity:</span>
                <span className="font-bold text-slate-800">{quantity} {produce.unit}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Produce Rate:</span>
                <span className="font-semibold text-slate-800">₹{produce.pricePerUnit} / {produce.unit}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Escrow Processing:</span>
                <span className="font-semibold text-emerald-700">FREE</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-emerald-700">₹{estimatedTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
              <div className="font-semibold text-slate-700 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                Escrow Protection Rule:
              </div>
              <p className="text-[11px] leading-relaxed">
                Funds are immediately locked in escrow. Farmer cannot withdraw until you verify the delivery OTP upon inspection.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Escrow Modal */}
      {createdOrder && (
        <RazorpayModal
          isOpen={showRazorpayModal}
          onClose={() => setShowRazorpayModal(false)}
          order={createdOrder}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Checkout;
