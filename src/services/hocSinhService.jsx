import apiClient from './apiClient';

const HocSinhService = {
    // Lấy tất cả học sinh
    getAllHocSinh: async () => {
        try {
            const response = await apiClient.get('/api/v1/hoc-sinh');
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error fetching hoc sinh:', error);
            return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy danh sách học sinh' };
        }
    },

    // Lấy chi tiết học sinh theo ID
    getHocSinhById: async (id) => {
        try {
            const response = await apiClient.get(`/api/v1/hoc-sinh/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error fetching hoc sinh by id:', error);
            return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy thông tin hoc sinh' };
        }
    },

    // Lấy danh sách học sinh theo phụ huynh
    getHocSinhByPhuHuynh: async (idPhuHuynh) => {
        try {
            const response = await apiClient.get(`/api/v1/hoc-sinh/phu-huynh/${idPhuHuynh}`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error fetching hoc sinh by phu huynh:', error);
            return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy danh sách học sinh theo phụ huynh' };
        }
    },
};

export default HocSinhService;
