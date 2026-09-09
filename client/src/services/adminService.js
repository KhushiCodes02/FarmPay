import api from './api';

export const ratingService = {
  createRating: async (ratingData) => {
    const res = await api.post('/ratings', ratingData);
    return res.data;
  },

  getUserRatings: async (userId) => {
    const res = await api.get(`/ratings/user/${userId}`);
    return res.data;
  },
};

export const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  getAllUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },

  getAllOrders: async () => {
    const res = await api.get('/admin/orders');
    return res.data;
  },

  getRecentAuditTrail: async () => {
    const res = await api.get('/admin/audit-trail');
    return res.data;
  },
};
