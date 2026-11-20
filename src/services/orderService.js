import api from './api';

export const orderService = {
  /**
   * Get orders assigned to the logged-in chef
   * @param {Object} params - { status, page, limit }
   */
  getOrders: async (params = {}) => {
    const response = await api.get('/api/chef/orders', { params });
    return response.data;
  },

  /**
   * Get detailed order by orderId
   * @param {string} orderId
   */
  getOrderDetails: async (orderId) => {
    const response = await api.get(`/api/chef/orders/${orderId}`);
    return response.data;
  },

  /**
   * Accept an incoming order
   * Backend checks COD commission wallet reservation / first-order benefit.
   * @param {string} orderId
   */
  acceptOrder: async (orderId) => {
    const response = await api.patch(`/api/chef/orders/${orderId}/accept`);
    return response.data;
  },

  /**
   * Reject an incoming order
   * @param {string} orderId
   * @param {string} rejectionReason
   */
  rejectOrder: async (orderId, rejectionReason) => {
    const response = await api.patch(`/api/chef/orders/${orderId}/reject`, { rejectionReason });
    return response.data;
  },

  /**
   * Advance order status (preparing, out_for_delivery, ready_for_pickup, delivered)
   * @param {string} orderId
   * @param {string} status
   */
  updateOrderStatus: async (orderId, status) => {
    const response = await api.patch(`/api/chef/orders/${orderId}/status`, { status });
    return response.data;
  },
};

export default orderService;
