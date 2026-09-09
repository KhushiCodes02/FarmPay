import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Building, CreditCard, CheckCircle2, Loader2 } from 'lucide-react';

const FarmerProfile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    businessName: user?.businessName || '',
    businessType: user?.businessType || '',
    bankAccount: {
      accountHolderName: user?.bankAccount?.accountHolderName || user?.name || '',
      accountNumber: user?.bankAccount?.accountNumber || 'XXXX-XXXX-4819',
      ifscCode: user?.bankAccount?.ifscCode || 'PUNB0123400',
    },
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Farmer Business Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage bank account for Razorpay payouts and farm location</p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Location / Mandi Hub</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Farm / Enterprise Name</label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Bank Account for Payout Settlement</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.bankAccount.accountNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  bankAccount: { ...formData.bankAccount, accountNumber: e.target.value }
                })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.bankAccount.ifscCode}
                onChange={(e) => setFormData({
                  ...formData,
                  bankAccount: { ...formData.bankAccount, ifscCode: e.target.value }
                })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow transition-colors text-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default FarmerProfile;
