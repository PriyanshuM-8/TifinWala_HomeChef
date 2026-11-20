import api from './api';

export const payoutService = {
  /**
   * Get configured payout details (bank account or UPI)
   */
  getPayoutDetails: async () => {
    const response = await api.get('/api/chef/payouts/details');
    return response.data;
  },

  /**
   * Save or update payout details
   * @param {Object} data - { payoutMethod: 'bank_transfer' | 'upi', accountHolderName, accountNumber, ifscCode, bankName, upiId }
   */
  savePayoutDetails: async (data) => {
    const response = await api.post('/api/chef/payouts/details', data);
    return response.data;
  },

  /**
   * Request withdrawal from available earnings balance
   * @param {number} amount - Amount in rupees
   */
  requestWithdrawal: async (amount) => {
    const response = await api.post('/api/chef/payouts/withdraw', { amount });
    return response.data;
  },

  /**
   * List chef withdrawal requests
   * @param {Object} params - { page, limit, status }
   */
  getWithdrawals: async (params = {}) => {
    const response = await api.get('/api/chef/payouts/withdrawals', { params });
    return response.data;
  },
};

export default payoutService;
