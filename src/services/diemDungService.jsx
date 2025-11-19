import apiClient from './apiClient';

// Consolidated Stop (Điểm dừng) service
const diemDungService = {
  list: async (params = {}) => {
    try {
      const res = await apiClient.get('/api/v1/diem-dung', { params });
      return res.data?.data ?? res.data;
    } catch (error) {
      return Promise.reject(error.response?.data || { success: false, message: 'Lỗi khi lấy danh sách trạm' });
    }
  },
  detail: async (id) => {
    try {
      const res = await apiClient.get(`/api/v1/diem-dung/${id}`);
      return res.data?.data ?? res.data;
    } catch (error) {
      return Promise.reject(error.response?.data || { success: false, message: 'Lỗi khi lấy chi tiết trạm' });
    }
  },
  create: async (payload) => {
    try {
      const res = await apiClient.post('/api/v1/diem-dung', payload);
      return res.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Tạo trạm thất bại' };
    }
  },
  update: async (id, payload) => {
    try {
      const res = await apiClient.put(`/api/v1/diem-dung/${id}`, payload);
      return res.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Cập nhật trạm thất bại' };
    }
  },
  softDelete: async (id) => {
    try {
      const res = await apiClient.delete(`/api/v1/diem-dung/${id}`);
      return res.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Xóa trạm thất bại' };
    }
  },
  unassignedCounts: async () => {
    try {
      const res = await apiClient.get('/api/v1/diem-dung/unassigned-counts');
      return res.data?.data ?? res.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Lỗi khi lấy số lượng học sinh chưa phân công' };
    }
  },
  // Backward-compatible aliases expected by some pages
  getAllDiemDung: async (params = {}) => {
    try {
      const data = await diemDungService.list(params);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message || 'Lỗi khi lấy danh sách điểm dừng' };
    }
  },
  getUnassignedCounts: async () => {
    try {
      const data = await diemDungService.unassignedCounts();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message || 'Lỗi khi lấy số lượng học sinh chưa phân công' };
    }
  }
};

export default diemDungService;
