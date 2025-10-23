import apiClient from './apiClient';

const TuyenDuongService = {
    // Lấy tất cả tuyến đường
    getAllTuyenDuong: async () => {
        try {
            const response = await apiClient.get('/api/v1/tuyen-duong');
            console.log('🔍 TuyenDuong Raw Response:', response);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error fetching tuyen duong:', error);
            return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy danh sách tuyến đường' };
        }
    },

    // Lấy chi tiết tuyến đường theo ID
    getTuyenDuongById: async (id) => {
        try {
            const response = await apiClient.get(`/api/v1/tuyen-duong/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error fetching tuyen duong by id:', error);
            return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy thông tin tuyến đường' };
        }
    },

    // Tạo tuyến đường mới
    createTuyenDuong: async (payload) => {
        try {
            console.log('Creating tuyen duong with payload:', payload);
            const response = await apiClient.post('/api/v1/tuyen-duong', payload);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error creating tuyen duong:', error);
            return { success: false, error: error.response?.data?.message || 'Lỗi khi tạo tuyến đường' };
        }
    },
};

export default TuyenDuongService;
