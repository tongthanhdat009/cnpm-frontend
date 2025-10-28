import apiClient from "./apiClient"

export const getAllNotifications = async () => {
    try {
        const response = await apiClient.get('/api/v1/thong-bao');
        if (response.data.success) {
            return response.data.data; // Trả về mảng thông báo
        }
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
}  

export const getNotificationsByUserId = async (id_nguoi_nhan) => {
    try {
        const response = await apiClient.get(`/api/v1/thong-bao/nguoi-nhan/${id_nguoi_nhan}`);
        if (response.data.success) {
            return response.data.data; // Trả về mảng thông báo
        }
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
}

export const sendNotification = async (notification) => {
    try {
        const response = await apiClient.post('/api/v1/thong-bao', notification);
        if (response.data.success) {
            return response.data; // Trả về toàn bộ response data
        } else {
            throw new Error(response.data.message || 'Gửi thông báo thất bại');
        }
    } catch (error) {
        console.error("Error sending notification:", error);
        throw error;
    }
}