import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { DollarSign, ShieldCheck, CheckCircle2, Clock, Loader2, ArrowUpRight } from 'lucide-react';

const FarmerEarnings = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await orderService.getOrders();
        setOrders(res.orders || []);
      } catch (err) {
        console.error('Failed to load farmer earnings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const settledOrders = orders.filter((o) => o.paymentStatus === 'RELEASED');
  const escrowPendingOrders = orders.filter((o) => o.paymentStatus === 'SECURED');

  const totalSettled = settledOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalInEscrow = escrowPendingOrders.reduce((acc, o) => acc + o.totalAmount, 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Financial Settlement</span>
        <h1 className="text-2xl font-bold text-slate-900">Farmer Earnings & Payout History</h1>
        <p className="text-xs text-slate-500 mt-0.5">Automated payouts executed via Razorpay upon verified delivery OTP</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Total Settled Bank Payouts</span>
          <div className="text-3xl font-extrabold text-emerald-700">₹{totalSettled.toLocaleString()}</div>
          <p className="text-xs text-slate-500">{settledOrders.length} completed transactions</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Secured in Controlled Escrow</span>
          <div className="text-3xl font-extrabold text-blue-700">₹{totalInEscrow.toLocaleString()}</div>
          <p className="text-xs text-slate-500">{escrowPendingOrders.length} orders in transit/delivery</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Settled Payout Ledger</h3>
        {settledOrders.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No payouts settled yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Produce</th>
                  <th className="py-3 px-4">Buyer</th>
                  <th className="py-3 px-4">Payout Amount</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Settlement Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settledOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{o.orderNumber}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{o.produceId?.cropName}</td>
                    <td className="py-3 px-4 text-slate-600">{o.buyerId?.name}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700">₹{o.totalAmount?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                        Razorpay Payout (Demo)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{new Date(o.updatedAt).toLocaleDateString()}</td>
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

export default FarmerEarnings;
