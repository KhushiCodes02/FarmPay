import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import StatusBadge, { PaymentBadge } from '../components/StatusBadge';
import {
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const SPENDING_CHART = [
  { category: 'Grains', amount: 18100 },
  { category: 'Vegetables', amount: 15300 },
  { category: 'Oilseeds', amount: 8640 },
  { category: 'Spices', amount: 7250 },
  { category: 'Fruits', amount: 5500 },
];

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuyerOrders = async () => {
      try {
        const res = await orderService.getOrders();
        setOrders(res.orders || []);
      } catch (err) {
        console.error('Failed to load buyer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBuyerOrders();
  }, []);

  const totalSpending = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const activeOrders = orders.filter(
    (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && o.status !== 'REFUNDED'
  );
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const openDisputes = orders.filter((o) => o.status === 'DISPUTED');

  // Pending OTP confirmations (critical action callout)
  const pendingConfirmation = orders.filter(
    (o) => o.status === 'DELIVERED_PENDING_CONFIRMATION'
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Buyer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.businessName || 'Kisan Mandi Wholesale Traders'} • Escrow Protection Active
          </p>
        </div>

        <Link
          to="/marketplace"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 self-start"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Browse Marketplace</span>
        </Link>
      </div>

      {/* Action Banner: Pending OTP Confirmation */}
      {pendingConfirmation.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1 text-xs font-bold text-amber-800">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{pendingConfirmation.length} Consignment(s) Delivered & Awaiting OTP Verification</span>
            </div>
            <p className="text-xs text-amber-900">
              Produce has arrived at your warehouse. Inspect quality and enter your OTP to release payment.
            </p>
          </div>
          <Link
            to={`/orders/${pendingConfirmation[0]._id}`}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow shrink-0"
          >
            Confirm Delivery (Order #{pendingConfirmation[0].orderNumber})
          </Link>
        </div>
      )}

      {/* 15. BUYER DASHBOARD METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Escrow Volume</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            ₹{totalSpending.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">100% covered by buyer protection</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Active Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-700">
            {activeOrders.length}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">In transit or awaiting OTP</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Completed Orders</span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {completedOrders.length}
          </div>
          <p className="text-[11px] text-teal-600 font-medium">Verified and settled</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Open Disputes</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-700">
            {openDisputes.length}
          </div>
          <p className="text-[11px] text-rose-600 font-medium">Escrow safely locked</p>
        </div>
      </div>

      {/* Spending Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Procurement by Produce Category</h3>
            <p className="text-xs text-slate-500">Breakdown of direct wholesale purchases</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SPENDING_CHART}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(v) => [`₹${v.toLocaleString()}`, 'Purchases']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protection Summary Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Escrow Guarantee</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              When ordering on FarmPay, payments are routed through Razorpay into a controlled release state.
            </p>

            <ul className="space-y-2 text-xs text-slate-600 pt-2">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Funds released only upon OTP delivery confirmation</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Immediate dispute lock for weight or quality issues</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Admin partial refund or full refund protection</span>
              </li>
            </ul>
          </div>

          <Link
            to="/marketplace"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center block shadow transition-colors"
          >
            Browse Fresh Produce
          </Link>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">My Recent Procurement Orders</h3>
            <p className="text-xs text-slate-500">Monitor dispatch progress and verify deliveries</p>
          </div>
          <Link to="/buyer/orders" className="text-xs font-bold text-emerald-700 hover:underline">
            View All Orders →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 italic">
            You have not placed any orders yet. Visit the marketplace to order direct from farmers.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Produce</th>
                  <th className="py-3 px-4">Farmer</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {o.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {o.produceId?.cropName || 'Produce'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {o.farmerId?.name || 'Farmer'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {o.quantity} {o.produceId?.unit || 'kg'}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      ₹{o.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/orders/${o._id}`}
                        className="px-3 py-1 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-lg font-semibold transition-colors"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
