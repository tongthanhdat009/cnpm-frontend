import apiClient from './apiClient';

/**
 * Service để giao tiếp với API Chuyến đi
 */
const ChuyenDiService = {
    /**
     * Lấy tất cả chuyến đi
     * @returns {Promise} Danh sách chuyến đi
     */
    getAllChuyenDi: async () => {
        try {
            const response = await apiClient.get('/api/v1/chuyen-di');
            return response.data;
        } catch (error) {
            console.error('Error fetching all chuyen di:', error);
            throw error;
        }
    },

    /**
     * Lấy chuyến đi theo ID
     * @param {number} id - ID chuyến đi
     * @returns {Promise} Chi tiết chuyến đi
     */
    getChuyenDiById: async (id) => {
        try {
            const response = await apiClient.get(`/api/v1/chuyen-di/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching chuyen di ${id}:`, error);
            throw error;
        }
    },

    /**
     * Lấy chuyến đi theo tài xế
     * @param {number} idTaiXe - ID tài xế
     * @returns {Promise} Danh sách chuyến đi
     */
    getChuyenDiByTaiXe: async (idTaiXe) => {
        try {
            const response = await apiClient.get(`/api/v1/chuyen-di?tai_xe=${idTaiXe}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching chuyen di by tai xe:', error);
            throw error;
        }
    },

    /**
     * Lấy chuyến đi theo tuyến đường
     * @param {number} idTuyenDuong - ID tuyến đường
     * @returns {Promise} Danh sách chuyến đi
     */
    getChuyenDiByTuyenDuong: async (idTuyenDuong) => {
        try {
            const response = await apiClient.get(`/api/v1/chuyen-di?tuyen_duong=${idTuyenDuong}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching chuyen di by tuyen duong:', error);
            throw error;
        }
    },

    /**
     * Lấy chuyến đi theo ngày
     * @param {string} ngay - Ngày (YYYY-MM-DD)
     * @returns {Promise} Danh sách chuyến đi
     */
    getChuyenDiByNgay: async (ngay) => {
        try {
            const response = await apiClient.get(`/api/v1/chuyen-di?ngay=${ngay}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching chuyen di by ngay:', error);
            throw error;
        }
    },

    /**
     * Lấy chuyến đi theo trạng thái
     * @param {string} trangThai - Trạng thái (cho_khoi_hanh | dang_di | hoan_thanh | da_huy | bi_tre)
     * @returns {Promise} Danh sách chuyến đi
     */
    getChuyenDiByTrangThai: async (trangThai) => {
        try {
            const response = await apiClient.get(`/api/v1/chuyen-di?trang_thai=${trangThai}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching chuyen di by trang thai:', error);
            throw error;
        }
    },

    /**
     * Tạo chuyến đi mới
     * @param {Object} chuyenDiData - Dữ liệu chuyến đi
     * @returns {Promise} Chuyến đi đã tạo
     */
    createChuyenDi: async (chuyenDiData) => {
        try {
            const response = await apiClient.post('/api/v1/chuyen-di', chuyenDiData);
            return response.data;
        } catch (error) {
            console.error('Error creating chuyen di:', error);
            throw error;
        }
    },

    /**
     * Cập nhật chuyến đi
     * @param {number} id - ID chuyến đi
     * @param {Object} chuyenDiData - Dữ liệu cập nhật
     * @returns {Promise} Chuyến đi đã cập nhật
     */
    updateChuyenDi: async (id, chuyenDiData) => {
        try {
            const response = await apiClient.put(`/api/v1/chuyen-di/${id}`, chuyenDiData);
            return response.data;
        } catch (error) {
            console.error(`Error updating chuyen di ${id}:`, error);
            throw error;
        }
    },

    /**
     * Xóa chuyến đi
     * @param {number} id - ID chuyến đi
     * @returns {Promise} Kết quả xóa
     */
    deleteChuyenDi: async (id) => {
        try {
            const response = await apiClient.delete(`/api/v1/chuyen-di/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting chuyen di ${id}:`, error);
            throw error;
        }
    },

    /**
     * Tạo chuyến đi lặp lại
     * @param {Object} recurringData - Dữ liệu chuyến đi lặp lại
     * @returns {Promise} Kết quả tạo chuyến đi
     */
    createRecurringChuyenDi: async (recurringData) => {
        try {
            const response = await apiClient.post('/api/v1/chuyen-di', recurringData);
            return response.data;
        } catch (error) {
            console.error('Error creating recurring chuyen di:', error);
            throw error;
        }
    },
    
};

export default ChuyenDiService;
