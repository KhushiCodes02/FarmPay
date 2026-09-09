import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import StatusBadge, { PaymentBadge } from '../components/StatusBadge';
import { Loader2, KeyRound, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

const BuyerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchOrders = async () => {
    try {
      const res = await orderService.getOrders();
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load buyer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = statusFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Procurement Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track shipment stages, confirm delivery OTPs, and review escrow receipts</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {['ALL', 'PENDING_PAYMENT', 'PAYMENT_SECURED', 'OUT_FOR_DELIVERY', 'DELIVERED_PENDING_CONFIRMATION', 'COMPLETED', 'DISPUTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm text-slate-500 text-xs italic">
          No orders found matching the selected filter.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Produce</th>
                  <th className="py-3 px-4">Farmer / Origin</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Delivery Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {o.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {o.produceId?.cropName || 'Produce Item'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{o.farmerId?.name}</div>
                      <div className="text-[10px] text-slate-400">{o.farmerId?.location}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {o.quantity} {o.produceId?.unit || 'kg'}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-700">
                      ₹{o.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(o.deliveryDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <PaymentBadge status={o.paymentStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/orders/${o._id}`}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm inline-flex items-center space-x-1 ${
                          o.status === 'DELIVERED_PENDING_CONFIRMATION'
                            ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                            : o.status === 'PENDING_PAYMENT'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {o.status === 'DELIVERED_PENDING_CONFIRMATION' ? (
                          <>
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Enter OTP</span>
                          </>
                        ) : (
                          <span>View Order →</span>
                        )}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerOrders;
