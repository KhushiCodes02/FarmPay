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
    try {
      const res = await api.delete('/produce/clear-all');
      return res.data;
    } catch (err) {
      // Robust fallback: fetch all current produce listings and delete them by valid ObjectId
      const listRes = await api.get('/produce');
      const items = listRes.data?.produce || [];
      if (items.length === 0) {
        return { message: 'All produce listings are already cleared.', deletedCount: 0 };
      }
      await Promise.all(items.map((item) => api.delete(`/produce/${item._id}`)));
      return { message: `Successfully cleared ${items.length} produce listings.`, deletedCount: items.length };
    }
  },

  getReferencePrices: async () => {
    const res = await api.get('/produce/reference-prices');
    return res.data.marketPrices;
  },
};
