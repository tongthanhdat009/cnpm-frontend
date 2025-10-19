import { useState, useMemo } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
    FaUserGraduate, FaUsers, FaUserTie, FaBus, FaCalendarAlt, 
    FaMapMarkedAlt, FaBell, FaRoute, FaMapPin, FaBars, FaUserCircle,
    FaSignOutAlt, FaTachometerAlt, FaCheckSquare, FaHistory, FaBullhorn
} from "react-icons/fa";

// Menu cho Quản lý
const adminMenu = [
  { path: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt size={20} /> },
  { path: "/hocsinh", label: "Quản lý học sinh", icon: <FaUserGraduate size={20} /> },
  { path: "/quanlyphuhuynh", label: "Quản lý phụ huynh", icon: <FaUsers size={20} /> },
  { path: "/taixe", label: "Quản lý tài xế", icon: <FaUserTie size={20} /> },
  { path: "/xebuyt", label: "Quản lý xe buýt", icon: <FaBus size={20} /> },
  { path: "/tuyenduong", label: "Quản lý tuyến đường", icon: <FaRoute size={20} /> },
  { path: "/tram", label: "Quản lý trạm", icon: <FaMapPin size={20} /> },
  { path: "/lichtrinh", label: "Quản lý lịch trình", icon: <FaCalendarAlt size={20} /> },
  { path: "/theodoixe", label: "Theo dõi xe buýt", icon: <FaMapMarkedAlt size={20} /> },
  { path: "/guithongbaoph", label: "Gửi thông báo", icon: <FaBullhorn size={20} />},
  { path: "/taikhoan", label: "Quản lý tài khoản", icon: <FaUserCircle size={20} /> }
];

// Menu cho Tài xế
const driverMenu = [
  { path: "/diemdanh", label: "Điểm danh học sinh", icon: <FaCheckSquare size={20} /> },
  { path: "/lichtrinh", label: "Xem lịch trình", icon: <FaCalendarAlt size={20} /> },
  { path: "/theodoixe", label: "Bản đồ tuyến", icon: <FaMapMarkedAlt size={20} /> },
  { path: "/thongbao", label: "Thông báo & Cảnh báo", icon: <FaBell size={20} /> },
];

// Menu cho Phụ huynh
const parentMenu = [
  { path: "/theodoixe", label: "Theo dõi xe của con", icon: <FaMapMarkedAlt size={20} /> },
  { path: "/thongbao", label: "Hộp thư thông báo", icon: <FaBell size={20} /> },
  { path: "/thongtinphuhuynh", label: "Thông tin cá nhân", icon: <FaUserCircle size={20} />},
];

function Layout({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // LOGIC LỌC MENU: Dựa vào vai trò của user để chọn đúng menu
  const menuItems = useMemo(() => {
    if (!user) return [];
    switch (user.vai_tro) {
      case 'quan_ly':
        return adminMenu;
      case 'tai_xe':
        return driverMenu;
      case 'phu_huynh':
        return parentMenu;
      default:
        return [];
    }
  }, [user]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const currentPageLabel = menuItems.find(item => location.pathname === item.path)?.label || "Dashboard";

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`bg-slate-900 text-slate-200 flex flex-col transition-all duration-300 ease-in-out shadow-lg ${
          isSidebarOpen ? "w-72" : "w-20"
        }`}
      >
        {/* Header Sidebar */}
        <div className={`flex items-center p-4 border-b border-slate-700 h-16 ${isSidebarOpen ? "justify-between" : "justify-center"}`}>
          {isSidebarOpen && <span className="font-bold text-xl whitespace-nowrap">Smart School Bus</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-slate-700 transition-colors">
            <FaBars />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-grow pt-4">
          <ul className="flex flex-col gap-2 px-4">
            {menuItems.map((item) => {
              const isActive = location.pathname.endsWith(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors duration-200 group ${
                      isActive ? "bg-indigo-600 text-white font-semibold shadow-md" : "text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}>{item.icon}</span>
                    {isSidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Sidebar (User Info & Logout) */}
        <div className="p-4 border-t border-slate-700">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <FaUserCircle size={32} className="text-white flex-shrink-0" />
                {isSidebarOpen && (
                  <div className="whitespace-nowrap">
                      <p className="font-semibold text-sm truncate">{user?.ho_ten}</p>
                      <p className="text-xs text-slate-400 capitalize">{user?.vai_tro.replace('_', ' ')}</p>
                  </div>
                )}
              </div>
               {isSidebarOpen && (
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Đăng xuất">
                    <FaSignOutAlt />
                </button>
              )}
           </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm h-16">
          <h1 className="text-2xl font-bold text-gray-800">{currentPageLabel}</h1>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;