import api from './api';

export const disputeService = {
  raiseDispute: async (disputeData) => {
    const res = await api.post('/disputes', disputeData);
    return res.data;
  },

  getDisputes: async (params = {}) => {
    const res = await api.get('/disputes', { params });
    return res.data;
  },

  getDisputeById: async (id) => {
    const res = await api.get(`/disputes/${id}`);
    return res.data;
  },

  resolveDispute: async (id, resolutionData) => {
    const res = await api.post(`/disputes/${id}/resolve`, resolutionData);
    return res.data;
  },
};
