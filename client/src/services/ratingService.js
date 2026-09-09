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

export default ratingService;
