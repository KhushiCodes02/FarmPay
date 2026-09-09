import React from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { Sparkles, UserCheck, ShieldCheck } from 'lucide-react';

const DemoBanner = () => {
  const { user, quickLoginAs } = useAuth();

  return (
    <div className="bg-slate-900 text-slate-200 text-xs border-b border-slate-800 py-1.5 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3 mr-1" />
            DEMO MODE
          </span>
          <span className="text-slate-400 hidden sm:inline">
            Escrow-style controlled payment release workflow active.
          </span>
        </div>

        <div className="flex items-center space-x-2 flex-wrap">
          <span className="text-slate-400 hidden md:inline">Quick Switch Demo:</span>
          
          <button
            onClick={() => quickLoginAs('FARMER')}
            className={`px-2 py-1 rounded transition-colors flex items-center space-x-1 ${
              user?.role === 'FARMER'
                ? 'bg-emerald-600 text-white font-medium'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Switch to Demo Farmer (Ram Kumar)"
          >
            <span>🌾 Farmer</span>
          </button>

          <button
            onClick={() => quickLoginAs('BUYER')}
            className={`px-2 py-1 rounded transition-colors flex items-center space-x-1 ${
              user?.role === 'BUYER'
                ? 'bg-emerald-600 text-white font-medium'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Switch to Demo Buyer (Rohit Mehta)"
          >
            <span>🛒 Buyer</span>
          </button>

          <button
            onClick={() => quickLoginAs('ADMIN')}
            className={`px-2 py-1 rounded transition-colors flex items-center space-x-1 ${
              user?.role === 'ADMIN'
                ? 'bg-purple-600 text-white font-medium'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Switch to Demo Admin"
          >
            <span>🛡️ Admin</span>
          </button>

          {user && (
            <span className="text-slate-400 ml-2 pl-2 border-l border-slate-700 hidden lg:inline">
              Logged in as: <strong className="text-white">{user.name}</strong> ({user.role})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;
