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

    // Xóa tuyến đường theo ID
    deleteTuyenDuong: async (id) => {
        if (id == null) return { success: false, error: 'Missing id parameter' };
        try {
            const response = await apiClient.delete(`/api/v1/tuyen-duong/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error deleting tuyen duong:', error);
            return { success: false, error: error.response?.data?.message || 'Lỗi khi xóa tuyến đường' };
        }
    },

    // Phân công (gán) danh sách học sinh cho một tuyến đường
    // NOTE: Endpoint/payload có thể cần điều chỉnh theo backend thực tế.
    // Mặc định gửi: POST /api/v1/tuyen-duong/:id/phan-cong-hoc-sinh { hoc_sinh_ids: number[] }
    assignStudentsToRoute: async (routeId, studentIds = []) => {
        if (routeId == null) return { success: false, error: 'Missing routeId' };
        try {
            const response = await apiClient.post(`/api/v1/tuyen-duong/${routeId}/phan-cong-hoc-sinh`, {
                hoc_sinh_ids: Array.isArray(studentIds) ? studentIds : [],
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error assigning students to route:', error);
            return { success: false, error: error.response?.data?.message || 'Lỗi khi phân công học sinh cho tuyến đường' };
        }
    },
    // Assign a single student to a route (endpoint: POST /api/v1/tuyen-duong/:id/phan-cong-hoc-sinh/:hocSinhId)
    assignStudentToRoute: async (routeId, hocSinhId) => {
        if (routeId == null || hocSinhId == null) return { success: false, error: 'Missing parameters' };
        try {
            const response = await apiClient.post(`/api/v1/tuyen-duong/${routeId}/phan-cong-hoc-sinh/${hocSinhId}`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error assigning single student to route:', error);
            return { success: false, error: error.response?.data?.message || 'Lỗi khi phân công học sinh' };
        }
    },

    // Unassign a single student from a route (endpoint: DELETE /api/v1/tuyen-duong/:id/phan-cong-hoc-sinh/:hocSinhId)
    unassignStudentFromRoute: async (routeId, hocSinhId) => {
        if (routeId == null || hocSinhId == null) return { success: false, error: 'Missing parameters' };
        try {
            const response = await apiClient.delete(`/api/v1/tuyen-duong/${routeId}/phan-cong-hoc-sinh/${hocSinhId}`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error unassigning single student from route:', error);
            return { success: false, error: error.response?.data?.message || 'Lỗi khi huỷ phân công học sinh' };
        }
    },
};

export default TuyenDuongService;
