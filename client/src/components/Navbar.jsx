import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, ShoppingCart, ShieldCheck, User, LogOut, Package, PlusCircle, LayoutDashboard, AlertTriangle, FileText, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isFarmer, isBuyer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center">
                Farm<span className="text-emerald-600">Pay</span>
              </span>
              <span className="block text-[10px] text-slate-500 font-medium tracking-wider uppercase -mt-1">
                Direct • Escrow • Payouts
              </span>
            </div>
          </Link>

          {/* Nav Links based on Role */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/marketplace"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/marketplace') ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Marketplace
            </Link>

            {isAuthenticated && isFarmer && (
              <>
                <Link
                  to="/farmer/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/farmer/dashboard') ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/farmer/listings"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/farmer/listings') ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  My Listings
                </Link>
                <Link
                  to="/farmer/orders"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/farmer/orders') ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Orders
                </Link>
                <Link
                  to="/farmer/create-listing"
                  className="ml-2 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1" />
                  List Produce
                </Link>
              </>
            )}

            {isAuthenticated && isBuyer && (
              <>
                <Link
                  to="/buyer/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/buyer/dashboard') ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/buyer/orders"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/buyer/orders') ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  My Orders
                </Link>
                <Link
                  to="/disputes"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/disputes') ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Disputes
                </Link>
              </>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin') ? 'text-purple-700 bg-purple-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Admin Portal
                </Link>
                <Link
                  to="/disputes"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/disputes') ? 'text-purple-700 bg-purple-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dispute Center
                </Link>
              </>
            )}
          </nav>

          {/* User profile / Auth buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-800 leading-none">{user.name}</div>
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded ${
                    isFarmer ? 'bg-emerald-100 text-emerald-800' : isBuyer ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Marketplace
          </Link>

          {isAuthenticated ? (
            <>
              {isFarmer && (
                <>
                  <Link to="/farmer/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700">Farmer Dashboard</Link>
                  <Link to="/farmer/listings" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700">My Listings</Link>
                  <Link to="/farmer/orders" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700">Orders</Link>
                  <Link to="/farmer/create-listing" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-emerald-700 font-semibold">+ List Produce</Link>
                </>
              )}
              {isBuyer && (
                <>
                  <Link to="/buyer/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700">Buyer Dashboard</Link>
                  <Link to="/buyer/orders" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700">My Orders</Link>
                  <Link to="/disputes" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700">Disputes</Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-purple-700 font-semibold">Admin Dashboard</Link>
                  <Link to="/disputes" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700">Dispute Center</Link>
                </>
              )}
              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-rose-600 font-semibold flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out ({user.name})</span>
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 flex flex-col space-y-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-2 text-center text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg">Log In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full py-2 text-center text-sm font-semibold bg-emerald-600 text-white rounded-lg">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
