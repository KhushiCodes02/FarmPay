import api from './api';

export const paymentService = {
  createPaymentSession: async (orderId, preferDemo = false) => {
    const res = await api.post('/payments/create', { orderId, preferDemo });
    return res.data;
  },

  verifyPayment: async (payload) => {
    const res = await api.post('/payments/verify', payload);
    return res.data;
  },

  getPaymentStatus: async (orderId) => {
    const res = await api.get(`/payments/${orderId}`);
    return res.data;
  },
};
