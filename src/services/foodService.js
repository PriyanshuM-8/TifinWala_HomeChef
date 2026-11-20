import api from './api';

export const foodService = {
  /**
   * Get all foods for the logged-in chef
   * @param {Object} params - { page, limit, category, foodType, availability, search }
   */
  getFoods: async (params = {}) => {
    const response = await api.get('/api/chef/foods', { params });
    return response.data;
  },

  /**
   * Add new food item
   * @param {FormData|Object} data
   */
  createFood: async (data) => {
    const isFormData = data instanceof FormData;
    const response = await api.post('/api/chef/foods', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  /**
   * Update existing food item
   * @param {string} id
   * @param {FormData|Object} data
   */
  updateFood: async (id, data) => {
    const isFormData = data instanceof FormData;
    const response = await api.put(`/api/chef/foods/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  /**
   * Toggle food availability
   * @param {string} id
   * @param {boolean} isAvailable
   */
  toggleAvailability: async (id, isAvailable) => {
    const response = await api.patch(`/api/chef/foods/${id}/availability`, { isAvailable });
    return response.data;
  },

  /**
   * Delete food item
   * @param {string} id
   */
  deleteFood: async (id) => {
    const response = await api.delete(`/api/chef/foods/${id}`);
    return response.data;
  },

  /**
   * Get active food categories for dropdowns
   */
  getCategories: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },
};

export default foodService;
