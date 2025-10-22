import apiClient from "./apiClient";
const NguoiDungService = {
    async getNguoiDungByVaiTro(vaiTro) {
        try {
            const response = await apiClient.get(`/api/v1/nguoi-dung/vai-tro/${vaiTro}`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error fetching nguoi dung by vai tro:', error);
            return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy danh sách người dùng' };
        }
    }
};
export default NguoiDungService;