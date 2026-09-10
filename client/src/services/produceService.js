import api from './api';

export const produceService = {
  getProduce: async (params = {}) => {
    const res = await api.get('/produce', { params });
    return res.data;
  },

  getProduceById: async (id) => {
    const res = await api.get(`/produce/${id}`);
    return res.data;
  },

  createProduce: async (produceData) => {
    const res = await api.post('/produce', produceData);
    return res.data;
  },

  updateProduce: async (id, produceData) => {
    const res = await api.put(`/produce/${id}`, produceData);
    return res.data;
  },

  deleteProduce: async (id) => {
    const res = await api.delete(`/produce/${id}`);
    return res.data;
  },

  clearAllProduce: async () => {
    const res = await api.delete('/produce/clear-all');
    return res.data;
  },

  getReferencePrices: async () => {
    const res = await api.get('/produce/reference-prices');
    return res.data.marketPrices;
  },
};
