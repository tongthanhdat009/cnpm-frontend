import apiClient from "./apiClient";
const XeBuytService = {
    async getAllXeBuyt() {
        try {
            const response = await apiClient.get('/api/v1/xe-buyt');
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error fetching xe buyt:', error);
            return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy danh sách xe buýt' };
        }
    }
};
export default XeBuytService;