import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from 'react';

// Sửa lỗi: Loại bỏ đuôi .jsx khỏi các import cục bộ
import Layout from "./components/Layout";
import LoginPage from "./pages/Common/DangNhap";
import Dashboard from "./pages/Admin/Dashboard";
import QuanLyHocSinh from "./pages/Admin/QuanLyHocSinh";
import QuanLyTaiXe from "./pages/Admin/QuanLyTaiXe";
import QuanLyXeBus from "./pages/Admin/QuanLyXeBus";
import TheoDoiXeBuyt from "./pages/Parent/TheoDoiXeBuyt";
import ThongBao from "./pages/Common/ThongBao";
import QuanLyLichTrinh from "./pages/Admin/QuanLyLichTrinh";
import ChiTietChuyenDi from "./pages/Admin/ChiTietChuyenDi";
import XemLichTrinh from "./pages/Driver/XemLichTrinh";
import QuanLyTram from "./pages/Admin/QuanLyTram";
import QuanLyTuyenDuong from "./pages/Admin/QuanLyTuyenDuong";
import ThongTinPhuHuynh from "./pages/Parent/ThongTinPhuHuynh";
import GuiThongBao from "./pages/Admin/GuiThongBao";
import DiemDanhHocSinh from "./pages/Driver/DiemDanhHocSinh";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  // Sử dụng useRef để lưu trữ đối tượng WebSocket
  const ws = useRef(null);

  useEffect(() => {
    // Tự động đăng nhập nếu có thông tin trong localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    }
  }, []);

  // Thiết lập kết nối WebSocket khi user đăng nhập
  useEffect(() => {
    // Chỉ kết nối nếu có user và chưa có kết nối WebSocket nào đang mở hoặc đang kết nối
    if (currentUser && (!ws.current || ws.current.readyState === WebSocket.CLOSED)) {
      // Thay đổi địa chỉ ws://localhost:3000 nếu backend chạy ở port/host khác
      const websocketUrl = 'ws://localhost:3000';
      console.log(`🔌 Attempting to connect WebSocket to ${websocketUrl}`);
      // Tạo kết nối WebSocket mới và gán vào ws.current
      const newWs = new WebSocket(websocketUrl);

      newWs.onopen = () => {
        console.log('✅ WebSocket Connected');
        // Gửi thông tin user lên server để xác thực
        newWs.send(JSON.stringify({ 
          type: 'authenticate', 
          userId: currentUser.id_nguoi_dung 
        }));
      };

      newWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 Message from server:', message);

          // Xác nhận xác thực thành công
          if (message.type === 'authenticated') {
            console.log(`✅ Authenticated as user ID: ${message.userId}`);
          }

          // Xử lý thông báo mới
          if (message.type === 'NEW_NOTIFICATION') {
            const newNotification = message.payload;
            // Hiển thị thông báo (ví dụ dùng alert, hoặc toast library)
            alert(`Thông báo mới: ${newNotification.tieu_de}\n${newNotification.noi_dung}`);
            // Cập nhật state để hiển thị ở đâu đó nếu cần
            setNotifications(prev => [newNotification, ...prev]);
          }
          // Xử lý các loại message khác nếu có
        } catch (error) {
          console.error('Failed to parse message or handle incoming message:', error);
        }
      };

      newWs.onclose = (event) => {
        console.log(`❌ WebSocket Disconnected: ${event.code} ${event.reason}`);
        // Chỉ reset ref nếu kết nối hiện tại chính là kết nối đã đóng
        if (ws.current === newWs) {
             ws.current = null;
        }
        // Có thể thêm logic reconnect ở đây nếu muốn
      };

      newWs.onerror = (error) => {
        console.error('WebSocket Error:', error);
        // Sự kiện onclose sẽ được gọi sau lỗi, không cần đóng hoặc reset ref ở đây
      };

      // Gán kết nối mới vào ref
      ws.current = newWs;

    } else if (!currentUser && ws.current && ws.current.readyState === WebSocket.OPEN) {
       // Nếu user đã logout nhưng ws vẫn mở -> đóng nó
        console.log('🔌 Closing WebSocket connection due to logout');
        ws.current.close();
    }


    // Cleanup function: Đảm bảo đóng kết nối khi component unmount
    return () => {
      // Lấy ra websocket hiện tại từ ref trước khi cleanup
      const currentWs = ws.current;
      if (currentWs && currentWs.readyState === WebSocket.OPEN) {
        console.log('🔌 Closing WebSocket connection on component unmount');
        currentWs.close();
      }
    };
    // Chỉ chạy lại effect này khi currentUser thay đổi
  }, [currentUser]);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentUser(userData);
  };

  const handleLogout = () => {
     // Đóng WebSocket trước khi xóa user
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log('🔌 Closing WebSocket connection on logout');
      ws.current.close();
    }
    // ws.current sẽ tự reset thành null trong sự kiện onclose
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Component bảo vệ route theo vai trò
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.vai_tro)) {
      // Nếu không có quyền truy cập, chuyển về trang mặc định của vai trò
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={currentUser ? <Navigate to="/" replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />}
        />

        {/* Route được bảo vệ, dùng chung Layout */}
        <Route
          element={
            <ProtectedRoute>
               {/* Truyền notifications vào Layout nếu muốn hiển thị ở đó */}
              <Layout user={currentUser} onLogout={handleLogout} notifications={notifications} />
            </ProtectedRoute>
          }
        >
          {/* Route mặc định - điều hướng theo vai trò */}
          <Route index element={<DefaultPageBasedOnRole role={currentUser?.vai_tro} />} />

          {/* Routes cho QUẢN LÝ */}
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['quan_ly']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="hocsinh" element={
            <ProtectedRoute allowedRoles={['quan_ly']}>
              <QuanLyHocSinh />
            </ProtectedRoute>
          } />
          <Route path="taixe" element={
            <ProtectedRoute allowedRoles={['quan_ly']}>
              <QuanLyTaiXe />
            </ProtectedRoute>
          } />
          <Route path="xebuyt" element={
            <ProtectedRoute allowedRoles={['quan_ly']}>
              <QuanLyXeBus />
            </ProtectedRoute>
          } />
          <Route path="tuyenduong" element={
            <ProtectedRoute allowedRoles={['quan_ly']}>
              <QuanLyTuyenDuong />
            </ProtectedRoute>
          } />
          <Route path="tram" element={
            <ProtectedRoute allowedRoles={['quan_ly']}>
              <QuanLyTram />
            </ProtectedRoute>
          } />
          <Route path="guithongbaoph" element={
            <ProtectedRoute allowedRoles={['quan_ly']}>
              <GuiThongBao />
            </ProtectedRoute>
          } />
          {/* Routes cho TÀI XẾ */}
          <Route path="diemdanh" element={
            <ProtectedRoute allowedRoles={['tai_xe']}>
              <DiemDanhHocSinh />
            </ProtectedRoute>
          } />

          {/* Routes lịch trình - phân biệt theo vai trò */}
          <Route path="lichtrinh" element={
            <ProtectedRoute allowedRoles={['quan_ly', 'tai_xe']}>
              {currentUser?.vai_tro === 'quan_ly' ? <QuanLyLichTrinh /> : <XemLichTrinh />}
            </ProtectedRoute>
          } />
          <Route path="lichtrinh/:scheduleId" element={
            <ProtectedRoute allowedRoles={['quan_ly']}>
              <ChiTietChuyenDi />
            </ProtectedRoute>
          } />

          {/* Routes chung cho nhiều vai trò */}
          <Route path="theodoixe" element={
            <ProtectedRoute allowedRoles={['quan_ly', 'tai_xe', 'phu_huynh']}>
              <TheoDoiXeBuyt />
            </ProtectedRoute>
          } />
          <Route path="thongbao" element={
             <ProtectedRoute allowedRoles={['tai_xe', 'phu_huynh']}>
                {/* Truyền notifications hoặc dùng context/state management khác */}
                <ThongBao initialNotifications={notifications} />
             </ProtectedRoute>
           } />

          {/* Routes cho PHỤ HUYNH */}
          <Route path="thongtinphuhuynh" element={
            <ProtectedRoute allowedRoles={['phu_huynh']}>
              <ThongTinPhuHuynh />
            </ProtectedRoute>
          } />

          {/* Route 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

// Helper component để điều hướng đến trang mặc định của từng vai trò
const DefaultPageBasedOnRole = ({ role }) => {
  switch (role) {
    case 'quan_ly':
      return <Navigate to="/dashboard" replace />;
    case 'tai_xe':
      return <Navigate to="/diemdanh" replace />;
    case 'phu_huynh':
      return <Navigate to="/theodoixe" replace />;
    default:
      // Nếu không có vai trò (chưa đăng nhập xong), có thể tạm thời không render gì hoặc redirect login
       // Hoặc trả về trang login nếu chưa xác định được vai trò
      return <Navigate to="/login" replace />;
  }
};

export default App;

