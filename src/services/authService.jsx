import apiClient from './apiClient';

/**
 * Hàm đăng nhập gọi API từ backend.
 */
export const login = async (ten_tai_khoan, mat_khau) => {
  try {
    const response = await apiClient.post('/api/v1/auth/login', {
      ten_tai_khoan,
      mat_khau
    });

    if (response.data.success) {
      // Trả về dữ liệu người dùng
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Đăng nhập thất bại");
    }
  } catch (error) {
    // Xử lý lỗi từ server
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Tên tài khoản hoặc mật khẩu không đúng.");
    }
    throw new Error("Lỗi kết nối đến server. Vui lòng thử lại sau.");
  }
};

/**
 * Hàm đăng ký tài khoản mới gọi API từ backend.
 */
export const register = async (ho_ten, ten_tai_khoan, mat_khau, so_dien_thoai, vai_tro) => {
  try {
    const response = await apiClient.post('/api/v1/auth/register', {
      ho_ten,
      ten_tai_khoan,
      mat_khau,
      so_dien_thoai,
      vai_tro
    });

    if (response.data.success) {
      // Trả về dữ liệu người dùng vừa tạo
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Đăng ký tài khoản thất bại");
    }
  } catch (error) {
    // Xử lý lỗi từ server
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Không thể tạo tài khoản.");
    }
    throw new Error("Lỗi kết nối đến server. Vui lòng thử lại sau.");
  }
};