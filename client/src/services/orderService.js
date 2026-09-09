import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },

  getOrders: async (params = {}) => {
    const res = await api.get('/orders', { params });
    return res.data;
  },

  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  updateDeliveryStatus: async (id, status) => {
    const res = await api.put(`/orders/${id}/delivery-status`, { status });
    return res.data;
  },

  sendDeliveryOTP: async (id) => {
    const res = await api.post(`/orders/${id}/send-otp`);
    return res.data;
  },

  verifyDeliveryOTP: async (id, code) => {
    const res = await api.post(`/orders/${id}/verify-otp`, { code });
    return res.data;
  },

  releasePayment: async (id) => {
    const res = await api.post(`/orders/${id}/release`);
    return res.data;
  },
};
