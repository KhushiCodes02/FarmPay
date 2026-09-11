import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { produceService } from '../services/produceService';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Star, MapPin, Calendar, CheckCircle2, ArrowRight, Loader2, Info, TrendingDown } from 'lucide-react';
import MarketPriceCompare from '../components/MarketPriceCompare';

const ProduceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isBuyer, isAdmin, quickLoginAs } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(50);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await produceService.getProduceById(id);
        setData(res);
        if (res.produce?.quantityAvailable < 50) {
          setQuantity(res.produce.quantityAvailable);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Produce not found');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-800">Produce Listing Unavailable</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <Link to="/marketplace" className="inline-block px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const { produce, marketReference } = data;
  const totalEstimated = quantity * produce.pricePerUnit;

  const handleProceedToCheckout = async () => {
    if (!isAuthenticated) {
      // Auto-switch to Buyer demo if in demo environment for frictionless testing
      await quickLoginAs('BUYER');
    }
    navigate('/checkout', {
      state: {
        produce,
        selectedQuantity: quantity,
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-500 flex items-center space-x-1.5">
        <Link to="/marketplace" className="hover:text-emerald-700">Marketplace</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">{produce.cropName}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Col: Imagery and Crop Details */}
        <div className="md:col-span-7 space-y-6">
          <div className="h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative">
            <img
              src={produce.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'}
              alt={produce.cropName}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 bg-white/95 backdrop-blur text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow">
              {produce.category}
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Crop Specification & Harvest Notes</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{produce.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block">Harvest Date</span>
                <span className="font-semibold text-slate-800">
                  {new Date(produce.harvestDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Location</span>
                <span className="font-semibold text-slate-800">{produce.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Available Stock</span>
                <span className="font-semibold text-emerald-700">{produce.quantityAvailable} {produce.unit}</span>
              </div>
            </div>
          </div>

          {/* Farmer Verification Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Cultivator Profile</span>
              <h4 className="font-bold text-slate-900 text-base">{produce.farmerId?.name}</h4>
              <p className="text-xs text-slate-500">{produce.farmerId?.businessName || 'Verified Agricultural Producer'}</p>
              <div className="flex items-center space-x-3 text-xs text-slate-600 pt-1">
                <span className="flex items-center text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                  {produce.farmerId?.rating || 4.8} / 5.0
                </span>
                <span className="text-slate-400">•</span>
                <span className="flex items-center text-slate-500">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  {produce.farmerId?.location}
                </span>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Verified Farmer
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Pricing & Order Configuration Card */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl space-y-6 sticky top-24">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">₹{produce.pricePerUnit}</span>
                <span className="text-sm font-semibold text-slate-500">per {produce.unit}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Wholesale price direct from grower. Includes sorting and grading.</p>
            </div>

            {/* Price Transparency */}
            <MarketPriceCompare
              cropName={produce.cropName}
              farmerPrice={produce.pricePerUnit}
              marketRefPrice={marketReference?.referencePrice}
              unit={produce.unit}
            />

            {/* Quantity Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <label>Order Quantity ({produce.unit})</label>
                <span className="text-slate-400">Max: {produce.quantityAvailable} {produce.unit}</span>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="1"
                  max={produce.quantityAvailable}
                  value={quantity}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(produce.quantityAvailable, Number(e.target.value)));
                    setQuantity(val);
                  }}
                  className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="range"
                  min="1"
                  max={produce.quantityAvailable}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="flex-1 accent-emerald-600"
                />
              </div>
            </div>

            {/* Calculation Breakdown */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({quantity} {produce.unit} × ₹{produce.pricePerUnit}):</span>
                <span className="font-semibold text-slate-800">₹{totalEstimated.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Escrow Fee:</span>
                <span className="font-medium text-emerald-700">₹0 (Waived for Buildathon)</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Escrow Amount:</span>
                <span className="text-emerald-700">₹{totalEstimated.toLocaleString()}</span>
              </div>
            </div>

            {/* Escrow Guarantee Callout */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
              <div>
                <strong>Zero Financial Risk:</strong> Payment is retained in Razorpay escrow. The farmer receives payout only when you enter the delivery confirmation OTP.
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              disabled={produce.quantityAvailable === 0}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg hover:shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-sm"
            >
              <span>Proceed to Escrow Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {(isAdmin || (user && produce.farmerId && (
              (user.id || user._id)?.toString() === (produce.farmerId._id || produce.farmerId)?.toString()
            ))) && (
              <button
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to delete "${produce.cropName}"?`)) {
                    try {
                      await produceService.deleteProduce(produce._id);
                      alert('Produce listing deleted successfully.');
                      navigate('/marketplace');
                    } catch (err) {
                      alert(err.response?.data?.error || 'Failed to delete produce listing');
                    }
                  }
                }}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>🗑️ Delete Listing</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProduceDetails;
