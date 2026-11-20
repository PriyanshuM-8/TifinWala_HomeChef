import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to attach Chef JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gharkaswad_chef_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s and format errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthRoute = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register');

    if (status === 401 && !isAuthRoute) {
      localStorage.removeItem('gharkaswad_chef_token');
      localStorage.removeItem('gharkaswad_chef_user');
      localStorage.removeItem('gharkaswad_chef_profile');
      window.location.href = '/login?session_expired=true';
    }

    return Promise.reject(error);
  }
);

/**
 * Extract user-friendly error message from Axios error
 */
export const extractErrorMessage = (error, defaultMsg = 'Something went wrong. Please try again.') => {
  if (!error) return defaultMsg;
  if (typeof error === 'string') return error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.message) return error.message;
  return defaultMsg;
};

export default api;
