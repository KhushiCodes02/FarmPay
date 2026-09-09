import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Marketplace from './pages/Marketplace';
import ProduceDetails from './pages/ProduceDetails';

// Authenticated Common Pages
import Checkout from './pages/Checkout';
import OrderDetails from './pages/OrderDetails';
import DisputesPage from './pages/DisputesPage';

// Farmer Pages
import FarmerDashboard from './pages/FarmerDashboard';
import FarmerListings from './pages/FarmerListings';
import CreateListing from './pages/CreateListing';
import FarmerOrders from './pages/FarmerOrders';
import FarmerEarnings from './pages/FarmerEarnings';
import FarmerProfile from './pages/FarmerProfile';

// Buyer Pages
import BuyerDashboard from './pages/BuyerDashboard';
import BuyerOrders from './pages/BuyerOrders';
import BuyerProfile from './pages/BuyerProfile';

// Admin Page
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/produce/:id" element={<ProduceDetails />} />

            {/* Authenticated Order Routes */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/disputes"
              element={
                <ProtectedRoute>
                  <DisputesPage />
                </ProtectedRoute>
              }
            />

            {/* Farmer Routes */}
            <Route
              path="/farmer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/listings"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                  <FarmerListings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/create-listing"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                  <CreateListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/orders"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                  <FarmerOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/earnings"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                  <FarmerEarnings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/profile"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                  <FarmerProfile />
                </ProtectedRoute>
              }
            />

            {/* Buyer Routes */}
            <Route
              path="/buyer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                  <BuyerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/orders"
              element={
                <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                  <BuyerOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/profile"
              element={
                <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                  <BuyerProfile />
                </ProtectedRoute>
              }
            />

            {/* Admin Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
