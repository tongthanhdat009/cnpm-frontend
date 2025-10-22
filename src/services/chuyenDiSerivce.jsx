import apiClient from "./apiClient";

export const getAllChuyenDi = async () => {
    try {
        const response = await apiClient.get('/api/v1/chuyen-di');
        if (response.data.success) {
            return response.data.data;
        }
    } catch (error) {
        console.error("Error fetching all chuyến đi:", error);
        throw error;
    }
};