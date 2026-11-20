import api from './api';

export const chefService = {
  /**
   * Get current chef approval status
   */
  getApprovalStatus: async () => {
    const response = await api.get('/api/chef/approval-status');
    return response.data;
  },

  /**
   * Get chef profile details
   */
  getProfile: async () => {
    const response = await api.get('/api/chef/profile');
    return response.data;
  },

  /**
   * Update chef profile details
   * Note: Updating critical fields (kitchenName, kitchenAddress, city, foodSafetyDetails)
   * triggers approvalStatus: 'pending'.
   */
  updateProfile: async (data) => {
    const response = await api.put('/api/chef/profile', data);
    return response.data;
  },

  /**
   * Get public reviews for a chef
   */
  getReviews: async (chefId, params = {}) => {
    const response = await api.get(`/api/chefs/${chefId}/reviews`, { params });
    return response.data;
  },
};

export default chefService;
