import api from './api';

export const notificationService = {
  /**
   * Get paginated notifications for the authenticated chef
   * @param {Object} params - { page, limit, unreadOnly }
   */
  getNotifications: async (params = {}) => {
    const response = await api.get('/api/notifications', { params });
    return response.data;
  },

  /**
   * Mark a single notification as read
   * @param {string} id - Notification ObjectId
   */
  markAsRead: async (id) => {
    const response = await api.patch(`/api/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read for current chef
   */
  markAllAsRead: async () => {
    const response = await api.patch('/api/notifications/read-all');
    return response.data;
  },
};

export default notificationService;
