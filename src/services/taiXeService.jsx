import apiClient from './apiClient';

const taiXeService = {
  // Get all drivers
  getAll: async () => {
    try {
      const response = await apiClient.get('/api/v1/tai-xe');
      return response.data; // expected { success, message, data, total }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }
  },

  // Get driver by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/api/v1/tai-xe/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver:', error);
      throw error;
    }
  },

  // Create new driver
  create: async (driverData) => {
    try {
      const response = await apiClient.post('/api/v1/tai-xe', driverData);
      return response.data;
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  },

  // Update driver
  update: async (id, driverData) => {
    try {
      const response = await apiClient.put(`/api/v1/tai-xe/${id}`, driverData);
      return response.data;
    } catch (error) {
      console.error('Error updating driver:', error);
      throw error;
    }
  },

  // Delete driver
  delete: async (id, replaceWith) => {
    try {
      const config = {};
      if (replaceWith !== undefined) config.params = { replace_with: replaceWith };
      const response = await apiClient.delete(`/api/v1/tai-xe/${id}`, config);
      return response.data;
    } catch (error) {
      console.error('Error deleting driver:', error);
      // If server returned a structured error body, forward it so UI can react (e.g., HAS_TRIPS)
      if (error.response && error.response.data) {
        return error.response.data;
      }
      throw error;
    }
  },
};

export default taiXeService;
