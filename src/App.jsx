import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layout và các trang
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import QuanLyHocSinh from "./pages/QuanLyHocSinh";
import QuanLyPhuHuynh from "./pages/QuanLyPhuHuynh";
import QuanLyTaiXe from "./pages/QuanLyTaiXe";
import QuanLyXeBus from "./pages/QuanLyXeBus";
import TheoDoiXeBuyt from "./pages/TheoDoiXeBuyt";
import ThongBao from "./pages/ThongBao";
import LichTrinh from "./pages/QuanLyLichTrinh"
import QuanLyTram from "./pages/QuanLyTram"; 
import QuanLyTuyenDuong from "./pages/QuanLyTuyenDuong";
import ThongTinPhuHuynh from "./pages/ThongTinPhuHuynh";
import GuiThongBao from "./pages/GuiThongBao";
import DiemDanhHocSinh from "./pages/DiemDanhHocSinh";
function App() {
  return (
    <Router>
      <Routes>
        {/* Route cho layout chung của Admin */}
        <Route path="/dashboard" element={<Layout />}>
          {/* Trang con mặc định (index) */}
          <Route index element={<Dashboard />} />
          
          {/* Các trang con khác */}
          <Route path="hocsinh" element={<QuanLyHocSinh />} />
          <Route path="quanlyphuhuynh" element={<QuanLyPhuHuynh />} />
          <Route path="thongtinphuhuynh" element={<ThongTinPhuHuynh />} />
          <Route path="taixe" element={<QuanLyTaiXe />} />
          <Route path="xebuyt" element={<QuanLyXeBus />} />
          <Route path="theodoixe" element={<TheoDoiXeBuyt />} />
          <Route path="thongbao" element={<ThongBao />} />
          <Route path="lichtrinh" element={<LichTrinh />} />
          <Route path="tram" element={<QuanLyTram />} />
          <Route path="tuyenduong" element={<QuanLyTuyenDuong />} />
          <Route path="guithongbaoph" element={<GuiThongBao />} />
          <Route path="diemdanh" element={<DiemDanhHocSinh />} />
        </Route>

        {/* Redirect từ trang gốc đến dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        {/* Bạn có thể thêm các route khác ở đây, ví dụ trang Login */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;