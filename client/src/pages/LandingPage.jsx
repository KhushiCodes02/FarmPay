import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { produceService } from '../services/produceService';
import { Sprout, ShieldCheck, KeyRound, TrendingUp, Zap, ArrowRight, Star, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';

const LandingPage = () => {
  const { quickLoginAs } = useAuth();
  const navigate = useNavigate();
  const [featuredProduce, setFeaturedProduce] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await produceService.getProduce({ limit: 6 });
        setFeaturedProduce((data.produce || []).slice(0, 6));
      } catch (err) {
        console.warn('Failed to load featured produce:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleRoleSelect = async (role) => {
    await quickLoginAs(role);
    if (role === 'FARMER') navigate('/farmer/dashboard');
    else if (role === 'BUYER') navigate('/marketplace');
    else navigate('/admin');
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 22. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-emerald-300 text-xs font-semibold tracking-wide uppercase shadow-inner">
            <ShieldCheck className="w-4 h-4" />
            <span>Direct Farmer-to-Buyer Escrow Marketplace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Direct from Farm. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
              Secure by Design.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            Connect farmers directly with trusted buyers, secure payments until delivery, and guarantee faster, transparent payouts with automated OTP delivery verification.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => handleRoleSelect('FARMER')}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 text-base"
            >
              <span>🌾 I'm a Farmer</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleRoleSelect('BUYER')}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 backdrop-blur transition-all flex items-center justify-center space-x-2 text-base"
            >
              <span>🛒 I'm a Buyer</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-emerald-300/80 font-medium">
            ⚡ One-click demo login configured with pre-seeded test data and mock accounts.
          </p>
        </div>
      </section>

      {/* 22. FEATURE CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Sprout className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Direct Transactions</h3>
            <p className="text-xs text-slate-500 mt-1">
              Zero middlemen commission. Buy wholesale straight from verified cultivators.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Escrow Protection</h3>
            <p className="text-xs text-slate-500 mt-1">
              Buyer funds remain secured via Razorpay until physical goods are inspected.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">OTP Confirmation</h3>
            <p className="text-xs text-slate-500 mt-1">
              One-time SHA-256 code confirms arrival and unlocks payment release safely.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Transparent Pricing</h3>
            <p className="text-xs text-slate-500 mt-1">
              Compare farmer offer prices with live regional mandi benchmark rates.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Faster Payouts</h3>
            <p className="text-xs text-slate-500 mt-1">
              Farmers receive automated payouts upon confirmation or 24-hour window expiry.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            How Controlled Escrow Works
          </h2>
          <p className="text-sm text-slate-500">
            A deterministic financial protocol ensuring trust for both grower and commercial buyer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
            <span className="text-3xl font-extrabold text-emerald-100 absolute top-4 right-4">01</span>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Step 1</div>
            <h4 className="font-bold text-slate-900 text-base mb-2">Farmer Lists Harvest</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Farmer details crop, available quantity, fair price per kg/quintal, and harvest date.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
            <span className="text-3xl font-extrabold text-emerald-100 absolute top-4 right-4">02</span>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Step 2</div>
            <h4 className="font-bold text-slate-900 text-base mb-2">Payment Secured</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Buyer places order. Funds are captured through Razorpay and secured in controlled escrow state.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
            <span className="text-3xl font-extrabold text-emerald-100 absolute top-4 right-4">03</span>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Step 3</div>
            <h4 className="font-bold text-slate-900 text-base mb-2">Delivery & Inspection</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Farmer ships harvest. Buyer verifies weight and quality, then shares the secure 6-digit delivery OTP.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
            <span className="text-3xl font-extrabold text-emerald-100 absolute top-4 right-4">04</span>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Step 4</div>
            <h4 className="font-bold text-slate-900 text-base mb-2">Direct Farmer Payout</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              System validates OTP, confirms delivery, and releases funds straight into farmer's bank account.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCE MARKETPLACE PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Featured Fresh Produce</h2>
            <p className="text-xs text-slate-500">Live listings directly from verified growers</p>
          </div>
          <Link
            to="/marketplace"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>View All Produce</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProduce.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="h-44 bg-slate-100 relative overflow-hidden">
                <img
                  src={p.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'}
                  alt={p.cropName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                  {p.category}
                </span>
                <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  ₹{p.pricePerUnit}/{p.unit}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{p.cropName}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-medium text-slate-900">{p.farmerId?.name || 'Verified Farmer'}</span>
                    <span className="text-amber-500 flex items-center font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                      {p.farmerId?.rating || 4.8}
                    </span>
                  </div>
                  <div className="flex items-center text-slate-500">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span>{p.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-medium text-slate-500">
                    <strong>{p.quantityAvailable} {p.unit}</strong> available
                  </span>
                  <Link
                    to={`/produce/${p._id}`}
                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
