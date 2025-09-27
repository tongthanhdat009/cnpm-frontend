import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
    FaUserGraduate, FaUsers, FaUserTie, FaBus, FaCalendarAlt, 
  FaMapMarkedAlt, FaBell, FaRoute, FaMapPin, FaBars, FaUserCircle
} from "react-icons/fa";

function Layout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { path: "hocsinh",       label: "Quản lý học sinh",      icon: <FaUserGraduate size={20} /> },
    { path: "quanlyphuhuynh",      label: "Quản lý phụ huynh",   icon: <FaUsers size={20} /> },
    { path: "taixe",         label: "Quản lý tài xế",         icon: <FaUserTie size={20} /> },
    { path: "xebuyt",        label: "Quản lý xe buýt",        icon: <FaBus size={20} /> },
    { path: "lichtrinh",     label: "Quản lý lịch trình",     icon: <FaCalendarAlt size={20} /> },
    { path: "theodoixe", label: "Theo dõi xe buýt",      icon: <FaMapMarkedAlt size={20} /> },
    { path: "thongbao",      label: "Thông báo và cảnh báo",  icon: <FaBell size={20} /> },
    { path: "tuyenduong",    label: "Quản lý tuyến đường",   icon: <FaRoute size={20} /> },
    { path: "tram",          label: "Quản lý trạm",          icon: <FaMapPin size={20} /> },
    { path: "thongtinphuhuynh",      label: "Thông tin phụ huynh",   icon: <FaUsers size={20} />},
    { path: "guithongbaoph",      label: "Gửi thông báo phụ huynh",   icon: <FaBell size={20} />},
    { path: "diemdanh",      label: "Điểm danh học sinh",   icon: <FaUsers size={20} />}
    
  ];

  const currentPageLabel = menuItems.find(item => location.pathname.endsWith(item.path))?.label || "Dashboard";

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`bg-slate-900 text-slate-200 flex flex-col transition-all duration-300 ease-in-out shadow-lg ${
          isSidebarOpen ? "w-75" : "w-20"
        }`}
      >
        {/* --- Phần Header của Sidebar --- */}
        <div className={`flex items-center p-4 border-b border-slate-700 h-16 ${
            isSidebarOpen ? "justify-between" : "justify-center"
        }`}>
          {/* SỬA LỖI Ở ĐÂY: Dùng conditional rendering */}
          {isSidebarOpen && (
            <span className="font-bold text-xl whitespace-nowrap">
              Admin Panel
            </span>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-slate-700 transition-colors">
            <FaBars />
          </button>
        </div>

        {/* --- Phần Điều hướng chính --- */}
        <nav className="flex-grow pt-4">
          <ul className="flex flex-col gap-2 px-4">
            {menuItems.map((item) => {
              const isActive = location.pathname.endsWith(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-4 p-3 rounded-lg text-decoration-none transition-colors duration-200 group ${
                      isActive
                        ? "bg-indigo-600 text-white font-semibold shadow-md"
                        : "text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}>
                      {item.icon}
                    </span>
                    {/* SỬA LỖI Ở ĐÂY: Dùng conditional rendering */}
                    {isSidebarOpen && (
                      <span className="whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* --- Phần Footer của Sidebar (thông tin người dùng) --- */}
        <div className="p-4 border-t border-slate-700">
           <div className="flex items-center gap-4">
              <FaUserCircle size={32} className="text-white flex-shrink-0" />
              {/* SỬA LỖI Ở ĐÂY: Dùng conditional rendering */}
              {isSidebarOpen && (
                <div className="whitespace-nowrap">
                    <p className="font-semibold text-sm">User name</p>
                    <p className="text-xs text-slate-400">admin@example.com</p>
                </div>
              )}
           </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm h-16">
          <h1 className="text-2xl font-bold text-gray-800">{currentPageLabel}</h1>
          <input type="text" placeholder="Tìm kiếm..." className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 hidden md:block"/>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;