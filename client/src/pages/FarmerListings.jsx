import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { produceService } from '../services/produceService';
import { PlusCircle, Edit3, Trash2, MapPin, Star, Loader2, AlertCircle, TrendingDown } from 'lucide-react';
import MarketPriceCompare from '../components/MarketPriceCompare';

const FarmerListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyListings = async () => {
    try {
      const data = await produceService.getProduce({ farmerId: user?.id });
      setListings(data.produce || []);
    } catch (err) {
      setError('Failed to fetch your produce listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this listing?')) return;
    try {
      await produceService.deleteProduce(id);
      await fetchMyListings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete produce');
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Produce Listings</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage live stock, pricing, and harvest details</p>
        </div>
        <Link
          to="/farmer/create-listing"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center space-x-1.5 self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Harvest</span>
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-xl">
            🌾
          </div>
          <h3 className="font-bold text-slate-800 text-base">No active listings yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            List your grains, vegetables, or fruits to receive direct orders from commercial buyers.
          </p>
          <Link
            to="/farmer/create-listing"
            className="inline-block px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
          >
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img
                  src={p.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'}
                  alt={p.cropName}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded-full shadow">
                  {p.category}
                </span>
                <span className={`absolute top-3 right-3 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow ${
                  p.status === 'AVAILABLE' ? 'bg-emerald-600' : p.status === 'LOW_STOCK' ? 'bg-amber-600' : 'bg-rose-600'
                }`}>
                  {p.status}
                </span>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{p.cropName}</h3>
                  <div className="text-sm font-extrabold text-emerald-700 mt-0.5">
                    ₹{p.pricePerUnit} / {p.unit}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                </div>

                <MarketPriceCompare
                  cropName={p.cropName}
                  farmerPrice={p.pricePerUnit}
                  marketRefPrice={p.marketReferencePrice}
                  unit={p.unit}
                />

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium">
                    Stock: <strong>{p.quantityAvailable} {p.unit}</strong>
                  </span>
                  <span className="text-slate-400">
                    Harvest: {new Date(p.harvestDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Link
                    to={`/produce/${p._id}`}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg text-center transition-colors"
                  >
                    View Public Card
                  </Link>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Deactivate Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerListings;
