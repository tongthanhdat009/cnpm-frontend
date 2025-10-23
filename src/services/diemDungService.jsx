import apiClient from './apiClient';

/**
 * Service for interacting with điểm dừng (stops) endpoints
 * Endpoints used:
 *  - GET /api/v1/diem-dung          -> list of stops (supports query params)
 *  - GET /api/v1/diem-dung/:id      -> stop details by id
 */
const DiemDungService = {
    // Lấy tất cả điểm dừng. `params` là object query parameters tuỳ chọn.
    getAllDiemDung: async (params = {}) => {
        try {
            const response = await apiClient.get('/api/v1/diem-dung', { params });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error fetching diem dung list:', error);
            return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy danh sách điểm dừng' };
        }
    },

    // Lấy số lượng học sinh chưa phân công theo từng điểm dừng
    getUnassignedCounts: async () => {
        try {
            const response = await apiClient.get('/api/v1/diem-dung/unassigned-counts');
            const data = Array.isArray(response.data) ? response.data : [];
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching unassigned counts:', error);
            return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy số lượng học sinh chưa phân công' };
        }
    },

    // Lấy chi tiết điểm dừng theo ID
    getDiemDungById: async (id) => {
        if (!id) return { success: false, error: 'Missing id parameter' };
        try {
            const response = await apiClient.get(`/api/v1/diem-dung/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error fetching diem dung by id:', error);
            return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy thông tin điểm dừng' };
        }
    },
};

export default DiemDungService;
