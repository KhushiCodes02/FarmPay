import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, RefreshCcw, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

const STEPS = [
  { key: 'PENDING_PAYMENT', label: 'Order Placed' },
  { key: 'PAYMENT_SECURED', label: 'Payment Secured' },
  { key: 'PROCESSING', label: 'Farmer Processing' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out For Delivery' },
  { key: 'DELIVERED_PENDING_CONFIRMATION', label: 'Delivery OTP Verification' },
  { key: 'COMPLETED', label: 'Payment Released to Farmer' },
];

const OrderTimeline = ({ order, auditLogs = [] }) => {
  const [showLogs, setShowLogs] = useState(false);

  const getStepIndex = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT': return 0;
      case 'PAYMENT_SECURED': return 1;
      case 'PROCESSING': return 2;
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED_PENDING_CONFIRMATION': return 4;
      case 'COMPLETED': return 5;
      case 'DISPUTED': return 4; // Locked at delivery stage
      case 'REFUNDED': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(order.status);
  const isDisputed = order.status === 'DISPUTED';
  const isRefunded = order.status === 'REFUNDED';

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2 text-emerald-600" />
            Escrow Delivery & Payment Timeline
          </h3>
          <span className="text-xs text-slate-500 font-mono">Order #{order.orderNumber}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Payment enters secured escrow immediately upon checkout and is only released upon verified OTP delivery confirmation.
        </p>
      </div>

      {/* Visual Step Tracker */}
      <div className="relative">
        <div className="overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            {STEPS.map((step, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isFuture = idx > currentIndex;

              let circleColor = 'bg-slate-100 text-slate-400 border-slate-300';
              if (isPast || (isCurrent && step.key === 'COMPLETED')) {
                circleColor = 'bg-emerald-600 text-white border-emerald-600';
              } else if (isCurrent) {
                if (isDisputed) {
                  circleColor = 'bg-rose-500 text-white border-rose-500 animate-pulse';
                } else {
                  circleColor = 'bg-emerald-500 text-white border-emerald-500 ring-4 ring-emerald-100';
                }
              }

              return (
                <div key={step.key} className="flex flex-col items-center flex-1 text-center px-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${circleColor}`}>
                    {isPast || (isCurrent && step.key === 'COMPLETED') ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isCurrent ? (
                      isDisputed ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4 animate-spin-slow" />
                    ) : (
                      <span className="text-xs font-semibold">{idx + 1}</span>
                    )}
                  </div>
                  <span className={`mt-2 text-[11px] leading-tight font-medium ${isCurrent ? 'text-emerald-700 font-bold' : isPast ? 'text-slate-800' : 'text-slate-400'}`}>
                    {isCurrent && isDisputed ? 'Dispute Active (Escrow Frozen)' : isCurrent && isRefunded ? 'Refunded' : step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Disputed Alert Callout */}
      {isDisputed && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-800 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 mt-0.5 text-rose-600 shrink-0" />
          <div>
            <strong className="font-semibold">Payment Locked in Escrow:</strong> A buyer dispute has been registered. The 24-hour automatic release countdown is blocked pending administrative review.
          </div>
        </div>
      )}

      {/* 17. Interactive Audit Trail */}
      <div className="border-t border-slate-100 pt-4">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="flex items-center justify-between w-full text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
        >
          <span className="flex items-center space-x-1.5">
            <span>Immutable Audit Trail</span>
            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
              {auditLogs.length} events
            </span>
          </span>
          {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showLogs && (
          <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No audit events recorded yet.</p>
            ) : (
              auditLogs.map((log, i) => (
                <div key={log._id || i} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{log.action}</span>
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-[10px] text-slate-400 shrink-0 ml-2">
                    <div>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                    <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTimeline;
