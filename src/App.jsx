import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';

import Layout from "./components/Layout";
import LoginPage from "./pages/Common/DangNhap";
import Dashboard from "./pages/Admin/Dashboard";
import QuanLyHocSinh from "./pages/Admin/QuanLyHocSinh";
import QuanLyPhuHuynh from "./pages/Admin/QuanLyPhuHuynh";
import QuanLyTaiXe from "./pages/Admin/QuanLyTaiXe";
import QuanLyXeBus from "./pages/Admin/QuanLyXeBus";
import TheoDoiXeBuyt from "./pages/Parent/TheoDoiXeBuyt";
import ThongBao from "./pages/Common/ThongBao";
import QuanLyLichTrinh from "./pages/Admin/QuanLyLichTrinh";
import XemLichTrinh from "./pages/Driver/XemLichTrinh";
import QuanLyTram from "./pages/Admin/QuanLyTram"; 
import QuanLyTuyenDuong from "./pages/Admin/QuanLyTuyenDuong";
import ThongTinPhuHuynh from "./pages/Parent/ThongTinPhuHuynh";
import GuiThongBao from "./pages/Admin/GuiThongBao";
import DiemDanhHocSinh from "./pages/Driver/DiemDanhHocSinh";
import QuanLyTaiKhoan from "./pages/Admin/QuanLyTaiKhoan";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

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

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentUser(userData);
  };

  const handleLogout = () => {
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
              <Layout user={currentUser} onLogout={handleLogout} />
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
          <Route path="quanlyphuhuynh" element={
            <ProtectedRoute allowedRoles={['quan_ly']}>
              <QuanLyPhuHuynh />
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
          <Route path="taikhoan" element={
            <ProtectedRoute allowedRoles={['quan_ly']}>
              <QuanLyTaiKhoan />
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
          
          {/* Routes chung cho nhiều vai trò */}
          <Route path="theodoixe" element={
            <ProtectedRoute allowedRoles={['quan_ly', 'tai_xe', 'phu_huynh']}>
              <TheoDoiXeBuyt />
            </ProtectedRoute>
          } />
          <Route path="thongbao" element={
            <ProtectedRoute allowedRoles={['tai_xe', 'phu_huynh']}>
              <ThongBao />
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
      return <Navigate to="/login" replace />;
  }
};

export default App;