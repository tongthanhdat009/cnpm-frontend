import apiClient from './apiClient';

const xeBuytService = {
  // Lấy tất cả xe buýt
  getAll: async () => {
    try {
      const response = await apiClient.get('/api/v1/xe-buyt');
      return response.data; // { success, data, message }
    } catch (error) {
      console.error('Error fetching buses:', error);
      throw error;
    }
  },

  // Lấy xe buýt theo ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/api/v1/xe-buyt/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bus:', error);
      throw error;
    }
  },

  // Tạo xe buýt mới
  create: async (busData) => {
    try {
      const response = await apiClient.post('/api/v1/xe-buyt', busData);
      return response.data;
    } catch (error) {
      console.error('Error creating bus:', error);
      if (error.response && error.response.data) return error.response.data;
      throw error;
    }
  },

  // Cập nhật xe buýt theo ID
  update: async (id, busData) => {
    try {
      const response = await apiClient.put(`/api/v1/xe-buyt/${id}`, busData);
      return response.data;
    } catch (error) {
      console.error('Error updating bus:', error);
      if (error.response && error.response.data) return error.response.data;
      throw error;
    }
  },

  // Xóa xe buýt theo ID
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/api/v1/xe-buyt/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting bus:', error);
      if (error.response && error.response.data) return error.response.data;
      throw error;
    }
  },

  // Lấy danh sách tài xế (nếu cần)
  getTaiXe: async () => {
    try {
      const response = await apiClient.get('/api/v1/nguoi-dung'); // Lấy tất cả người dùng
      if (response.data.success) {
        // Lọc ra chỉ tài xế
        const taiXeOnly = response.data.data.filter(u => u.vai_tro === 'tai_xe');
        return { success: true, data: taiXeOnly };
      } else {
        return { success: false, data: [], message: response.data.message || 'Lấy tài xế thất bại' };
      }
    } catch (error) {
      console.error('Error fetching tai xe:', error);
      return { success: false, data: [], message: 'Lỗi khi lấy tài xế' };
    }
  }
};

export default xeBuytService;
