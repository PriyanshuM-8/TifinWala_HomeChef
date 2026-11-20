import api from './api';

export const walletService = {
  // ==========================================
  // CHEF EARNINGS WALLET (Orders & Subscriptions)
  // ==========================================
  
  /**
   * Get earnings wallet overview (available, pending, settled, total earned)
   */
  getEarningsOverview: async () => {
    const response = await api.get('/api/chef/wallet');
    return response.data;
  },

  /**
   * Get historical earnings transactions
   * @param {Object} params - { page, limit, status }
   */
  getEarningsTransactions: async (params = {}) => {
    const response = await api.get('/api/chef/wallet/earnings', { params });
    return response.data;
  },

  // ==========================================
  // CHEF COMMISSION WALLET (Platform fee & COD reserve)
  // ==========================================

  /**
   * Get commission wallet overview:
   * Returns balance, availableBalance, reservedBalance, totalCommissionPaid,
   * hasUsedFirstOrderFreeBenefit, acceptedOrderCount, isMinimumBalanceSatisfied
   */
  getCommissionOverview: async () => {
    const response = await api.get('/api/chef/commission-wallet');
    return response.data;
  },

  /**
   * Get commission transactions (recharges, reservations, captures, refunds)
   * @param {Object} params - { page, limit }
   */
  getCommissionTransactions: async (params = {}) => {
    const response = await api.get('/api/chef/commission-wallet/transactions', { params });
    return response.data;
  },

  /**
   * Create Razorpay recharge order for commission wallet
   * @param {number} amount - Recharge amount in rupees (e.g. 100, 200, 500)
   */
  createCommissionRecharge: async (amount) => {
    const response = await api.post('/api/chef/commission-wallet/recharge', { amount });
    return response.data;
  },

  /**
   * Verify Razorpay payment and credit commission wallet
   * @param {Object} paymentData - { razorpay_payment_id, razorpay_order_id, razorpay_signature }
   */
  verifyCommissionRecharge: async (paymentData) => {
    const response = await api.post('/api/chef/commission-wallet/recharge/verify', paymentData);
    return response.data;
  },
};

export default walletService;
