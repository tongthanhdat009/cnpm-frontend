import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from 'react';

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

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const ws = useRef(null);

  useEffect(() => {
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

  useEffect(() => {
    if (currentUser && (!ws.current || ws.current.readyState === WebSocket.CLOSED)) {
      const websocketUrl = 'ws://localhost:3000';
      console.log(`🔌 Attempting to connect WebSocket to ${websocketUrl}`);
      const newWs = new WebSocket(websocketUrl);

      newWs.onopen = () => {
        console.log('✅ WebSocket Connected');
        newWs.send(JSON.stringify({ 
          type: 'authenticate', 
          userId: currentUser.id_nguoi_dung 
        }));
      };

      newWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 Message from server:', message);

          if (message.type === 'authenticated') {
            console.log(`✅ Authenticated as user ID: ${message.userId}`);
          }

          if (message.type === 'NEW_NOTIFICATION') {
            const newNotification = message.payload;
            alert(`Thông báo mới: ${newNotification.tieu_de}\n${newNotification.noi_dung}`);
            setNotifications(prev => [newNotification, ...prev]);
          }
        } catch (error) {
          console.error('Failed to parse message or handle incoming message:', error);
        }
      };

      newWs.onclose = (event) => {
        console.log(`❌ WebSocket Disconnected: ${event.code} ${event.reason}`);
        if (ws.current === newWs) {
             ws.current = null;
        }
      };

      newWs.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      ws.current = newWs;

    } else if (!currentUser && ws.current && ws.current.readyState === WebSocket.OPEN) {
        console.log('🔌 Closing WebSocket connection due to logout');
        ws.current.close();
    }

    return () => {
      const currentWs = ws.current;
      if (currentWs && currentWs.readyState === WebSocket.OPEN) {
        console.log('🔌 Closing WebSocket connection on component unmount');
        currentWs.close();
      }
    };
  }, [currentUser]);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log('🔌 Closing WebSocket connection on logout');
      ws.current.close();
    }
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.vai_tro)) {
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

        <Route
          element={
            <ProtectedRoute>
              <Layout user={currentUser} onLogout={handleLogout} notifications={notifications} />
            </ProtectedRoute>
          }
        >
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
                <ThongBao initialNotifications={notifications} />
             </ProtectedRoute>
           } />

          {/* Routes cho PHỤ HUYNH */}
          <Route path="thongtinphuhuynh" element={
            <ProtectedRoute allowedRoles={['phu_huynh']}>
              <ThongTinPhuHuynh />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

const DefaultPageBasedOnRole = ({ role }) => {
  switch (role) {
    case 'quan_ly':
      return <Navigate to="/dashboard" replace />;
    case 'tai_xe':
      return <Navigate to="/lichtrinh" replace />;
    case 'phu_huynh':
      return <Navigate to="/theodoixe" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default App;

