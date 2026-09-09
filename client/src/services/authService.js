import api from './api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('farmpay_token', res.data.token);
      localStorage.setItem('farmpay_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.token) {
      localStorage.setItem('farmpay_token', res.data.token);
      localStorage.setItem('farmpay_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data.user;
  },

  updateProfile: async (updates) => {
    const res = await api.put('/auth/profile', updates);
    if (res.data.user) {
      localStorage.setItem('farmpay_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('farmpay_token');
    localStorage.removeItem('farmpay_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('farmpay_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
};
