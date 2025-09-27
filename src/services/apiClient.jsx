import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080', // Đặt baseURL của bạn ở đây
    headers: {
        'Content-Type': 'application/json',
    }
});

// Bạn cũng có thể thêm interceptors ở đây để xử lý token, lỗi, v.v.
// Ví dụ:
// apiClient.interceptors.request.use(config => {
//     const token = localStorage.getItem('authToken');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });

export default apiClient;