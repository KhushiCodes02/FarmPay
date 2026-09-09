import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { produceService } from '../services/produceService';
import { Search, Filter, Star, MapPin, ArrowUpDown, Loader2, Sparkles, SlidersHorizontal, TrendingDown } from 'lucide-react';
import MarketPriceCompare from '../components/MarketPriceCompare';

const CATEGORIES = ['All', 'Grains', 'Vegetables', 'Fruits', 'Pulses', 'Spices', 'Oilseeds'];

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [produceList, setProduceList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [priceMax, setPriceMax] = useState('');

  const fetchProduce = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (locationFilter) params.location = locationFilter;
      if (priceMax) params.maxPrice = priceMax;

      if (sortOption === 'price_asc') params.sort = 'price_asc';
      if (sortOption === 'price_desc') params.sort = 'price_desc';

      const data = await produceService.getProduce(params);
      setProduceList(data.produce || []);
    } catch (err) {
      console.error('Failed to load marketplace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduce();
  }, [selectedCategory, sortOption]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProduce();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Direct Produce Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Order directly from verified Indian growers with guaranteed escrow protection.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search wheat, tomatoes, basmati, spices..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-slate-600 font-semibold">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>Filters:</span>
          </div>

          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            onBlur={fetchProduce}
            placeholder="Location (e.g. Punjab)"
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />

          <input
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            onBlur={fetchProduce}
            placeholder="Max Price (₹)"
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-28"
          />

          {(locationFilter || priceMax || search) && (
            <button
              onClick={() => {
                setLocationFilter('');
                setPriceMax('');
                setSearch('');
                setSelectedCategory('All');
                setTimeout(fetchProduce, 10);
              }}
              className="text-emerald-600 hover:underline font-semibold text-xs"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-medium">Sort by:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="newest">Newest Listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Produce Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="text-xs text-slate-400">Loading verified produce listings...</span>
        </div>
      ) : produceList.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 text-xl">
            🌾
          </div>
          <h3 className="font-bold text-slate-800 text-base">No produce matched your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms, changing the category filter, or resetting max price constraints.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {produceList.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img
                  src={p.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'}
                  alt={p.cropName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                  {p.category}
                </span>
                <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-md">
                  ₹{p.pricePerUnit}/{p.unit}
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition-colors">
                    {p.cropName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {p.description || 'Farm-fresh quality produce harvested direct from grower.'}
                  </p>
                </div>

                {/* 24. Market Reference Price Comparison */}
                <MarketPriceCompare
                  cropName={p.cropName}
                  farmerPrice={p.pricePerUnit}
                  marketRefPrice={p.marketReferencePrice}
                  unit={p.unit}
                />

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Farmer</span>
                    <span className="font-semibold text-slate-800">{p.farmerId?.name || 'Verified Farmer'}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Rating</span>
                    <span className="text-amber-500 font-bold flex items-center justify-end">
                      <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                      {p.farmerId?.rating || 4.8}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[120px]">{p.location}</span>
                  </span>
                  <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {p.quantityAvailable} {p.unit} left
                  </span>
                </div>

                <Link
                  to={`/produce/${p._id}`}
                  className="w-full mt-2 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold text-center transition-colors shadow-sm block"
                >
                  View Details & Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
