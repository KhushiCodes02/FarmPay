import axios from 'axios';

// Support VITE_API_URL environment variable for production (e.g. Render backend URL)
// Falls back to '/api' for local development via Vite proxy
const rawBaseURL = import.meta.env.VITE_API_URL || '/api';
const baseURL = rawBaseURL.endsWith('/api') 
  ? rawBaseURL 
  : (rawBaseURL.endsWith('/') ? `${rawBaseURL}api` : `${rawBaseURL}/api`);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('farmpay_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401
      localStorage.removeItem('farmpay_token');
      localStorage.removeItem('farmpay_user');
    }
    return Promise.reject(error);
  }
);

export default api;
