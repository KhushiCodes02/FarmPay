import React from 'react';

const STATUS_CONFIGS = {
  PENDING_PAYMENT: { label: 'Payment Pending', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  PAYMENT_SECURED: { label: 'Payment Secured', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  PROCESSING: { label: 'Farmer Processing', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  OUT_FOR_DELIVERY: { label: 'Out For Delivery', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  DELIVERED_PENDING_CONFIRMATION: { label: 'Delivered (Pending OTP)', bg: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold animate-pulse' },
  COMPLETED: { label: 'Completed & Released', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold' },
  DISPUTED: { label: 'Disputed (Locked)', bg: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold' },
  REFUNDED: { label: 'Refunded', bg: 'bg-slate-100 text-slate-700 border-slate-300' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIGS[status] || { label: status, bg: 'bg-gray-100 text-gray-700 border-gray-200' };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg}`}>
      {config.label}
    </span>
  );
};

export const PaymentBadge = ({ status }) => {
  const map = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    SECURED: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    RELEASED: 'bg-teal-50 text-teal-800 border-teal-300 font-medium',
    REFUNDED: 'bg-slate-100 text-slate-700 border-slate-300',
    PARTIALLY_REFUNDED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${map[status] || 'bg-gray-100'}`}>
      💳 {status}
    </span>
  );
};

export default StatusBadge;
