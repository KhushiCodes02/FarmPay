import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { produceService } from '../services/produceService';
import StatusBadge, { PaymentBadge } from '../components/StatusBadge';
import {
  TrendingUp,
  DollarSign,
  Package,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowUpRight,
  Loader2,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const CHART_DATA = [
  { month: 'Nov', earnings: 18500 },
  { month: 'Dec', earnings: 26000 },
  { month: 'Jan', earnings: 34500 },
  { month: 'Feb', earnings: 42000 },
  { month: 'Mar', earnings: 51250 },
];

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [produceCount, setProduceCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [ordersRes, produceRes] = await Promise.all([
          orderService.getOrders(),
          produceService.getProduce({ farmerId: user?.id || user?._id }),
        ]);
        setOrders(ordersRes.orders || []);
        setProduceCount(produceRes.count || 0);
      } catch (err) {
        console.error('Farmer dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [user]);

  // Financial Metrics
  const totalEarnings = orders
    .filter((o) => o.paymentStatus === 'RELEASED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingEscrow = orders
    .filter((o) => o.paymentStatus === 'SECURED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeOrders = orders.filter(
    (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && o.status !== 'REFUNDED'
  );

  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');

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
            Farmer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.businessName || 'Golden Fields Agriculture Co.'} • {user?.location || 'Punjab, India'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/farmer/create-listing"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List New Produce</span>
          </Link>
        </div>
      </div>

      {/* 15. FARMER DASHBOARD METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Settled Earnings</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            ₹{totalEarnings.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">✓ Released to bank via Razorpay</p>
        </div>

        {/* Pending Escrow Payments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Pending Escrow Funds</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-700">
            ₹{pendingEscrow.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Secured in escrow awaiting delivery OTP</p>
        </div>

        {/* Active Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Active Consignments</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {activeOrders.length}
          </div>
          <p className="text-[11px] text-amber-600 font-medium">In processing or transit</p>
        </div>

        {/* Completed Orders */}
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
          <p className="text-[11px] text-teal-600 font-medium">100% OTP verified</p>
        </div>
      </div>

      {/* Earnings Trend Chart & Produce Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Monthly Earnings Trend</h3>
              <p className="text-xs text-slate-500">Settled payouts from completed buyer orders</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              +28% this harvest
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString()}`, 'Settled Payout']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Produce Overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Produce Catalog</h3>
              <span className="text-xs font-semibold text-slate-500">{produceCount} active items</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your listings are directly visible to verified commercial buyers across wholesale mandis.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Verified Bank Account:</span>
                <span className="font-mono font-semibold text-slate-800">XXXX-4819</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payout Mode:</span>
                <span className="font-semibold text-emerald-700">Razorpay Route Direct</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Farmer Reputation:</span>
                <span className="font-bold text-amber-500">⭐ {user?.rating || 4.8} / 5.0</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <Link
              to="/farmer/listings"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold text-center block transition-colors"
            >
              Manage My Listings
            </Link>
            <Link
              to="/farmer/create-listing"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center block shadow transition-colors"
            >
              + Create New Produce Listing
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Orders & Payout Status</h3>
            <p className="text-xs text-slate-500">Track shipments, dispatch OTPs, and monitor payment release</p>
          </div>
          <Link to="/farmer/orders" className="text-xs font-bold text-emerald-700 hover:underline">
            View All Orders →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 italic">
            No orders received yet. Produce listings will show incoming orders here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Produce</th>
                  <th className="py-3 px-4">Buyer</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {o.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {o.produceId?.cropName || 'Produce'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {o.buyerId?.name || 'Buyer'}
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
                        className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg font-semibold transition-colors"
                      >
                        Manage
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

export default FarmerDashboard;
