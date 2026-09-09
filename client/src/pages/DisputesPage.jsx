import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { disputeService } from '../services/disputeService';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, ShieldCheck, CheckCircle2, RefreshCcw, Loader2, ArrowRight, DollarSign } from 'lucide-react';

const DisputesPage = () => {
  const { user, isAdmin } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolveForm, setResolveForm] = useState({
    action: 'FULL_REFUND',
    refundAmount: '',
    notes: '',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchDisputes = async () => {
    try {
      const res = await disputeService.getDisputes();
      setDisputes(res.disputes || []);
    } catch (err) {
      console.error('Failed to load disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleOpenResolveModal = (dispute) => {
    setSelectedDispute(dispute);
    setResolveForm({
      action: 'FULL_REFUND',
      refundAmount: dispute.refundAmount || dispute.orderId?.totalAmount || 0,
      notes: '',
    });
    setError('');
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await disputeService.resolveDispute(selectedDispute._id, resolveForm);
      setMessage(res.message || 'Dispute successfully resolved.');
      setSelectedDispute(null);
      await fetchDisputes();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resolve dispute');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
          Escrow Governance & Protection
        </span>
        <h1 className="text-2xl font-bold text-slate-900">
          Dispute Resolution Center
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {isAdmin
            ? 'Administrative arbitrator dashboard: evaluate claims, execute partial or full refunds, or release farmer payout.'
            : 'Track the status and resolution of your disputed agricultural shipments.'}
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')}>✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {disputes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No active disputes</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All current orders are proceeding smoothly through standard OTP confirmation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disputes.map((d) => {
            const isResolved = d.status.startsWith('RESOLVED');
            return (
              <div
                key={d._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500 font-bold">
                      Case #{d._id.slice(-6)}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      isResolved ? 'bg-slate-100 text-slate-700' : 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                    }`}>
                      {d.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{d.reason}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{d.description}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-100">
                    <div className="flex justify-between text-slate-600">
                      <span>Produce Item:</span>
                      <span className="font-semibold text-slate-900">{d.orderId?.produceId?.cropName || 'Produce'}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Order Value:</span>
                      <span className="font-bold text-slate-900">₹{d.orderId?.totalAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-rose-700 font-bold">
                      <span>Claimed Refund:</span>
                      <span>₹{d.refundAmount?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-1 flex justify-between border-t border-slate-100">
                    <span>Buyer: <strong>{d.buyerId?.name}</strong></span>
                    <span>Farmer: <strong>{d.farmerId?.name}</strong></span>
                  </div>

                  {isResolved && d.resolution && (
                    <div className="p-2.5 bg-emerald-50 rounded-lg text-[11px] text-emerald-900 border border-emerald-200 space-y-1">
                      <div className="font-bold">Resolution Recorded:</div>
                      <div>{d.resolution.notes}</div>
                      <div className="text-[10px] text-emerald-700">
                        Refunded: ₹{d.resolution.refundAmount || 0} • Farmer Payout: ₹{d.resolution.farmerPayoutAmount || 0}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <Link
                    to={`/orders/${d.orderId?._id || d.orderId}`}
                    className="flex-1 py-2 text-center text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors"
                  >
                    View Order
                  </Link>

                  {isAdmin && !isResolved && (
                    <button
                      onClick={() => handleOpenResolveModal(d)}
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow transition-colors"
                    >
                      Arbitrate Case
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADMIN ARBITRATION / RESOLUTION MODAL */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Admin Arbitration Engine</span>
              <h3 className="text-base font-bold text-slate-900">Resolve Dispute #{selectedDispute._id.slice(-6)}</h3>
              <p className="text-xs text-slate-500">
                Order Total: ₹{selectedDispute.orderId?.totalAmount} • Reason: {selectedDispute.reason}
              </p>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Arbitration Action</label>
                <select
                  value={resolveForm.action}
                  onChange={(e) => setResolveForm({ ...resolveForm, action: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs"
                >
                  <option value="FULL_REFUND">Full Refund to Buyer (₹{selectedDispute.orderId?.totalAmount})</option>
                  <option value="PARTIAL_REFUND">Partial Refund (Split between Buyer & Farmer)</option>
                  <option value="APPROVE_PAYOUT">Reject Dispute & Release Payout to Farmer</option>
                </select>
              </div>

              {resolveForm.action === 'PARTIAL_REFUND' && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                  <label className="block font-semibold text-purple-900">
                    Buyer Refund Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedDispute.orderId?.totalAmount - 1}
                    value={resolveForm.refundAmount}
                    onChange={(e) => setResolveForm({ ...resolveForm, refundAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-sm font-bold text-purple-900"
                  />
                  <div className="text-[11px] text-purple-800">
                    Remaining to Farmer Payout: <strong>₹{(selectedDispute.orderId?.totalAmount - Number(resolveForm.refundAmount || 0)).toLocaleString()}</strong>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Arbitration Notes & Rationale</label>
                <textarea
                  required
                  rows={3}
                  value={resolveForm.notes}
                  onChange={(e) => setResolveForm({ ...resolveForm, notes: e.target.value })}
                  placeholder="Explain verified weights, photographs reviewed, and settlement agreement..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition-colors"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Execute Settlement'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDispute(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputesPage;
