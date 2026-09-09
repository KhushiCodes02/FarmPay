import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { produceService } from '../services/produceService';
import { useAuth } from '../context/AuthContext';
import { Sprout, PlusCircle, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

const CATEGORIES = ['Vegetables', 'Grains', 'Fruits', 'Pulses', 'Spices', 'Oilseeds', 'Other'];
const UNITS = ['kg', 'quintal', 'ton', 'crate', 'bag'];

const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    cropName: '',
    category: 'Vegetables',
    description: '',
    quantityAvailable: '',
    unit: 'kg',
    pricePerUnit: '',
    location: user?.location || 'Ludhiana, Punjab',
    image: '',
    harvestDate: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Demo shortcut button for the buildathon demo flow:
  // "Tomatoes, 500 kg, ₹30/kg"
  const handlePreFillDemo = () => {
    setFormData({
      cropName: 'Hybrid Table Tomatoes',
      category: 'Vegetables',
      description: 'Grade-A fresh red vine tomatoes. Cleaned, sorted, firm and high shelf life.',
      quantityAvailable: '500',
      unit: 'kg',
      pricePerUnit: '30',
      location: user?.location || 'Nashik, Maharashtra',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      harvestDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await produceService.createProduce(formData);
      navigate('/farmer/listings');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handlePreFillDemo}
          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
          title="Fulfill Buildathon Demo Flow"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Pre-fill Demo Produce (Tomatoes 500kg @ ₹30)</span>
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">List New Harvest</h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish produce directly to wholesale mandis and commercial buyers with protected escrow payouts.
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Crop / Produce Name</label>
            <input
              type="text"
              required
              name="cropName"
              value={formData.cropName}
              onChange={handleChange}
              placeholder="e.g. Sharbati Wheat, Hybrid Tomatoes, Basmati Rice"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Harvest Date</label>
              <input
                type="date"
                required
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
              </input>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity Available</label>
              <input
                type="number"
                required
                min="1"
                name="quantityAvailable"
                value={formData.quantityAvailable}
                onChange={handleChange}
                placeholder="e.g. 500"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit of Measure</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Price Per Unit (₹)</label>
              <input
                type="number"
                required
                min="1"
                step="0.5"
                name="pricePerUnit"
                value={formData.pricePerUnit}
                onChange={handleChange}
                placeholder="e.g. 30"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-emerald-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Farm / Mandi Location</label>
            <input
              type="text"
              required
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Nashik, Maharashtra"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Produce Image URL (Optional)</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Harvest Description & Quality Grade</label>
            <textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Specify grain moisture, seed grading, packaging type (bags/crates)..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Publish Produce Listing</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
