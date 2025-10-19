// Giả lập cơ sở dữ liệu người dùng dựa trên schema của bạn
const mockUsers = [
    { id_nguoi_dung: 1, ho_ten: "Admin", ten_tai_khoan: "admin", mat_khau: "123", vai_tro: "quan_ly" },
    { id_nguoi_dung: 2, ho_ten: "Phụ Huynh A", ten_tai_khoan: "phuhuynh1", mat_khau: "123", vai_tro: "phu_huynh" },
    { id_nguoi_dung: 3, ho_ten: "Tài Xế B", ten_tai_khoan: "taixe1", mat_khau: "123", vai_tro: "tai_xe" },
  ];
  
  /**
   * Hàm giả lập gọi API đăng nhập.
   * Trong thực tế, bạn sẽ dùng fetch hoặc axios để gọi đến backend.
   */
  export const login = (ten_tai_khoan, mat_khau) => {
    return new Promise((resolve, reject) => {
      // Giả lập độ trễ mạng
      setTimeout(() => {
        const user = mockUsers.find(
          (u) => u.ten_tai_khoan === ten_tai_khoan && u.mat_khau === mat_khau
        );
  
        if (user) {
          // Trả về dữ liệu người dùng, bỏ qua mật khẩu
          const { mat_khau, ...userData } = user;
          resolve(userData);
        } else {
          reject(new Error("Tên tài khoản hoặc mật khẩu không đúng."));
        }
      }, 1000); // 1 giây trễ
    });
  };