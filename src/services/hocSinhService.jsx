import apiClient from './apiClient';

const hocSinhService = {
  // Lấy tất cả học sinh
  getAll: async () => {
    try {
      const response = await apiClient.get('/api/v1/hoc-sinh');
      return response.data; // { success, data, message }
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  // Lấy học sinh theo ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/api/v1/hoc-sinh/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
  },

  // Tạo học sinh mới
  create: async (studentData) => {
    try {
      const response = await apiClient.post('/api/v1/hoc-sinh', studentData);
      return response.data;
    } catch (error) {
      console.error('Error creating student:', error);
      if (error.response && error.response.data) return error.response.data;
      throw error;
    }
  },

  // Cập nhật học sinh theo ID
  update: async (id, studentData) => {
    try {
      const response = await apiClient.put(`/api/v1/hoc-sinh/${id}`, studentData);
      return response.data;
    } catch (error) {
      console.error('Error updating student:', error);
      if (error.response && error.response.data) return error.response.data;
      throw error;
    }
  },

  // Xóa học sinh theo ID
  delete: async (id, replaceWith) => {
    try {
      const config = {};
      if (replaceWith !== undefined) config.params = { replace_with: replaceWith };
      const response = await apiClient.delete(`/api/v1/hoc-sinh/${id}`, config);
      return response.data;
    } catch (error) {
      console.error('Error deleting student:', error);
      if (error.response && error.response.data) return error.response.data;
      throw error;
    }
  },

  // Lấy danh sách phụ huynh
  getPhuHuynh: async () => {
    try {
      const response = await apiClient.get('/api/v1/nguoi-dung'); // Lấy tất cả người dùng
      if (response.data.success) {
        // Lọc ra chỉ phụ huynh
        const phuHuynhOnly = response.data.data.filter(u => u.vai_tro === 'phu_huynh');
        return { success: true, data: phuHuynhOnly };
      } else {
        return { success: false, data: [], message: response.data.message || 'Lấy phụ huynh thất bại' };
      }
    } catch (error) {
      console.error('Error fetching phu huynh:', error);
      return { success: false, data: [], message: 'Lỗi khi lấy phụ huynh' };
    }
  },
};

export default hocSinhService;
