import api from './api';

export const subscriptionService = {
  /**
   * Get subscription meals scheduled for this chef
   * @param {Object} params - { status, dateKey, mealType, page, limit }
   */
  getMeals: async (params = {}) => {
    const response = await api.get('/api/chef/subscription-meals', { params });
    return response.data;
  },

  /**
   * Accept scheduled meal
   * @param {string} id
   */
  acceptMeal: async (id) => {
    const response = await api.patch(`/api/chef/subscription-meals/${id}/accept`);
    return response.data;
  },

  /**
   * Reject scheduled meal
   * @param {string} id
   * @param {string} rejectionReason
   */
  rejectMeal: async (id, rejectionReason) => {
    const response = await api.patch(`/api/chef/subscription-meals/${id}/reject`, { rejectionReason });
    return response.data;
  },

  /**
   * Update meal delivery status (preparing, out_for_delivery, delivered)
   * @param {string} id
   * @param {string} status
   */
  updateMealStatus: async (id, status) => {
    const response = await api.patch(`/api/chef/subscription-meals/${id}/status`, { status });
    return response.data;
  },
};

export default subscriptionService;
