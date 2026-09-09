import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2 text-white">
              <Sprout className="w-6 h-6 text-emerald-500" />
              <span className="text-xl font-extrabold tracking-tight">FarmPay</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              FarmPay is the trust-first direct agricultural marketplace connecting Indian farmers with commercial buyers. Combining automated Razorpay escrow release, OTP delivery confirmation, and transparent pricing.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 pt-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Controlled Payment Release Architecture • Zero Middleman Margin</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Marketplace</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/marketplace" className="hover:text-white transition-colors">Browse Produce</Link></li>
              <li><Link to="/marketplace?category=Grains" className="hover:text-white transition-colors">Grains & Cereals</Link></li>
              <li><Link to="/marketplace?category=Vegetables" className="hover:text-white transition-colors">Fresh Vegetables</Link></li>
              <li><Link to="/marketplace?category=Oilseeds" className="hover:text-white transition-colors">Oilseeds & Pulses</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Platform Governance</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/disputes" className="hover:text-white transition-colors">Dispute Resolution</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
              <li><span className="text-slate-500">Razorpay Route Payouts</span></li>
              <li><span className="text-slate-500">24h Auto-Release Engine</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 FarmPay Inc. Built for agricultural trust and empowerment.</p>
          <p className="mt-2 sm:mt-0 flex items-center">
            Secured by Razorpay • SHA-256 OTP Confirmation
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
