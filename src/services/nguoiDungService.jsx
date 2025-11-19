import apiClient from "./apiClient";
const NguoiDungService = {
    async getAllNguoiDung() {
        try {
            const response = await apiClient.get('/api/v1/nguoi-dung');
            console.log('🔍 All NguoiDung Raw Response:', response);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Error fetching all nguoi dung:', error);
            return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy danh sách người dùng' };
        }
    },
    
    async getNguoiDungByVaiTro(vaiTro) {
        try {
            const response = await apiClient.get(`/api/v1/nguoi-dung/vai-tro/${vaiTro}`);
            console.log('🔍 NguoiDung Raw Response:', response);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Error fetching nguoi dung by vai tro:', error);
            return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy danh sách người dùng' };
        }
    }
};

export default NguoiDungService;