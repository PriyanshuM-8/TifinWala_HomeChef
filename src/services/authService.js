import api from './api';

export const authService = {
  /**
   * HomeChef Login
   * @param {string} email
   * @param {string} password
   */
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  /**
   * Step 1: Send registration OTP for HomeChef
   * @param {Object} data
   */
  registerSendOtp: async (data) => {
    const response = await api.post('/api/auth/chef/register/send-otp', data);
    return response.data;
  },

  /**
   * Step 2: Verify registration OTP for HomeChef
   * @param {Object} data - { email, otp }
   */
  registerVerifyOtp: async (data) => {
    const response = await api.post('/api/auth/chef/register/verify-otp', data);
    return response.data;
  },

  /**
   * Fetch current authenticated chef details
   */
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  /**
   * Local logout
   */
  logout: () => {
    localStorage.removeItem('gharkaswad_chef_token');
    localStorage.removeItem('gharkaswad_chef_user');
    localStorage.removeItem('gharkaswad_chef_profile');
  },
};

export default authService;
