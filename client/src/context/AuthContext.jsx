import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = {
  FARMER: {
    email: 'ram.farmer@farmpay.demo',
    password: 'FarmPay@123',
    name: 'Ram Kumar',
    role: 'FARMER',
    description: 'Farmer (Grains & Oilseeds, Punjab)',
  },
  BUYER: {
    email: 'rohit.buyer@farmpay.demo',
    password: 'FarmPay@123',
    name: 'Rohit Mehta',
    role: 'BUYER',
    description: 'Buyer (Kisan Mandi Traders)',
  },
  ADMIN: {
    email: 'admin@farmpay.demo',
    password: 'FarmPay@123',
    name: 'Platform Admin',
    role: 'ADMIN',
    description: 'Platform Escrow Administrator',
  },
};

const normalizeUser = (u) => {
  if (!u) return null;
  return {
    ...u,
    id: u.id || u._id,
    _id: u._id || u.id,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(normalizeUser(authService.getCurrentUser()));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('farmpay_token');
      if (token) {
        try {
          const currentUser = await authService.getMe();
          setUser(normalizeUser(currentUser));
        } catch (err) {
          console.warn('Session expired or invalid:', err);
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(normalizeUser(data.user));
    return data.user;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(normalizeUser(data.user));
    return data.user;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const quickLoginAs = async (role) => {
    const demo = DEMO_ACCOUNTS[role];
    if (demo) {
      return await login(demo.email, demo.password);
    }
  };

  const updateProfile = async (updates) => {
    const data = await authService.updateProfile(updates);
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        quickLoginAs,
        updateProfile,
        isAuthenticated: !!user,
        isFarmer: user?.role === 'FARMER',
        isBuyer: user?.role === 'BUYER',
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
