import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import StatusBadge, { PaymentBadge } from '../components/StatusBadge';
import {
  ShieldAlert,
  Users,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#6366f1', '#a855f7', '#f59e0b', '#ef4444', '#64748b'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, ordersRes, usersRes, logsRes] = await Promise.all([
          adminService.getStats(),
          adminService.getAllOrders(),
          adminService.getAllUsers(),
          adminService.getRecentAuditTrail(),
        ]);
        setStats(statsRes);
        setOrders(ordersRes.orders || []);
        setUsers(usersRes.users || []);
        setAuditLogs(logsRes.logs || []);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  // Convert statusCounts to array for PieChart
  const statusChartData = stats?.statusCounts
    ? Object.entries(stats.statusCounts).map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value,
      }))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
            Platform Operations & Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Escrow Administrative Command
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor gross merchandise value, Razorpay settlements, dispute arbitration, and audit trail
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/disputes"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center space-x-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Dispute Resolution Hub ({stats?.openDisputes || 0})</span>
          </Link>
        </div>
      </div>

      {/* 15. ADMIN DASHBOARD STATS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Gross Merchandise Value (GMV)</span>
          <div className="text-2xl font-extrabold text-slate-900">
            ₹{stats?.totalGMV?.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">All recorded orders</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Secured Payments</span>
          <div className="text-2xl font-extrabold text-blue-700">
            ₹{stats?.totalPaymentsSecured?.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">Captured in Razorpay</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Released Farmer Payouts</span>
          <div className="text-2xl font-extrabold text-emerald-700">
            ₹{stats?.totalPayoutsReleased?.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Delivered & verified</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Refunds Processed</span>
          <div className="text-2xl font-extrabold text-slate-700">
            ₹{stats?.totalRefunds?.toLocaleString()}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">{stats?.openDisputes || 0} open disputes</span>
        </div>
      </div>

      {/* Secondary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
          <div>
            <div className="text-slate-400 font-medium">Farmers Enrolled</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats?.totalFarmers}</div>
          </div>
          <Users className="w-6 h-6 text-emerald-600" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
          <div>
            <div className="text-slate-400 font-medium">Commercial Buyers</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats?.totalBuyers}</div>
          </div>
          <ShoppingBag className="w-6 h-6 text-blue-600" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
          <div>
            <div className="text-slate-400 font-medium">Total Orders Placed</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats?.totalOrders}</div>
          </div>
          <TrendingUp className="w-6 h-6 text-purple-600" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
          <div>
            <div className="text-slate-400 font-medium">Dispute Rate</div>
            <div className="text-xl font-bold text-rose-700 mt-0.5">
              {stats?.totalOrders ? ((stats.allDisputesCount / stats.totalOrders) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <AlertTriangle className="w-6 h-6 text-rose-600" />
        </div>
      </div>

      {/* Orders Distribution & Platform Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders State Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Order Lifecycle Distribution</h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  fontSize={10}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Audit Log Feed */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">System Audit Trail Feed</h3>
            <span className="text-[10px] text-slate-400 font-mono">Latest 15 platform events</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 text-xs">
            {auditLogs.map((log) => (
              <div key={log._id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                    <span>{log.action}</span>
                    {log.orderId?.orderNumber && (
                      <span className="text-slate-400 font-mono text-[10px]">
                        ({log.orderId.orderNumber})
                      </span>
                    )}
                  </div>
                  {log.metadata && (
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {JSON.stringify(log.metadata)}
                    </p>
                  )}
                </div>
                <div className="text-right text-[10px] text-slate-400 shrink-0 ml-2">
                  <div>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">All Platform Orders</h3>
          <span className="text-xs text-slate-500">{orders.length} total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Produce</th>
                <th className="py-3 px-4">Farmer</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 10).map((o) => (
                <tr key={o._id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{o.orderNumber}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{o.produceId?.cropName}</td>
                  <td className="py-3 px-4 text-slate-600">{o.farmerId?.name}</td>
                  <td className="py-3 px-4 text-slate-600">{o.buyerId?.name}</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">₹{o.totalAmount?.toLocaleString()}</td>
                  <td className="py-3 px-4"><StatusBadge status={o.status} /></td>
                  <td className="py-3 px-4"><PaymentBadge status={o.paymentStatus} /></td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/orders/${o._id}`}
                      className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white rounded-lg font-semibold transition-colors"
                    >
                      Audit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
