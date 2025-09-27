import React, { useState, useMemo } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import DriverModal from '../components/DriverModal';
// --- DỮ LIỆU MẪU (Mô phỏng bảng nguoi_dung với vai_tro = 'tai_xe') ---
const sampleDrivers = [
  { id_nguoi_dung: 201, ho_ten: "Trần Văn Sáu", email: "sau.tv@email.com", so_dien_thoai: "0901112223", trang_thai: "Đang hoạt động", xe_phu_trach: "51B-123.45" },
  { id_nguoi_dung: 202, ho_ten: "Lý Thị Bảy", email: "bay.lt@email.com", so_dien_thoai: "0912223334", trang_thai: "Đang hoạt động", xe_phu_trach: "51C-678.90" },
  { id_nguoi_dung: 203, ho_ten: "Hoàng Văn Tám", email: "tam.hv@email.com", so_dien_thoai: "0983334445", trang_thai: "Tạm nghỉ", xe_phu_trach: "N/A" },
  { id_nguoi_dung: 204, ho_ten: "Phan Thị Chín", email: "chin.pt@email.com", so_dien_thoai: "0974445556", trang_thai: "Đang hoạt động", xe_phu_trach: "51D-112.23" },
];

// Component huy hiệu trạng thái
const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
    let specificClasses = status === 'Đang hoạt động' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
    return <span className={`${baseClasses} ${specificClasses}`}>{status}</span>;
  };

// --- COMPONENT CHÍNH QUẢN LÝ TÀI XẾ ---
function QuanLyTaiXe() {
  const [drivers, setDrivers] = useState(sampleDrivers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredDrivers = useMemo(() => 
    drivers.filter(driver => 
      driver.ho_ten.toLowerCase().includes(searchTerm.toLowerCase())
    ), [drivers, searchTerm]);
  
  const handleSaveDriver = (newDriverData) => {
    const newDriverWithId = { 
      ...newDriverData, 
      id_nguoi_dung: Math.max(...drivers.map(d => d.id_nguoi_dung)) + 1,
      trang_thai: 'Đang hoạt động', // Mặc định
      xe_phu_trach: 'N/A'
    };
    setDrivers([...drivers, newDriverWithId]);
    setIsModalOpen(false);
  };

  return (
    <>
      <DriverModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveDriver}
      />

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý tài xế</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          >
            <FaPlus />
            Thêm tài xế
          </button>
        </div>

        <div className="relative mb-4">
          <input 
            type="text"
            placeholder="Tìm kiếm theo tên tài xế..."
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Họ và Tên</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Số điện thoại</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Xe phụ trách</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((driver) => (
                <tr key={driver.id_nguoi_dung} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">{driver.id_nguoi_dung}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{driver.ho_ten}</td>
                  <td className="py-3 px-4 text-gray-700">{driver.email}</td>
                  <td className="py-3 px-4 text-gray-700">{driver.so_dien_thoai}</td>
                  <td className="py-3 px-4 text-gray-700 font-mono">{driver.xe_phu_trach}</td>
                  <td className="py-3 px-4"><StatusBadge status={driver.trang_thai} /></td>
                  <td className="py-3 px-4 flex gap-3">
                    <button className="text-purple-500 hover:text-purple-700" title="Xem lịch trình">
                      <FaCalendarAlt size={18} />
                    </button>
                    <button className="text-blue-500 hover:text-blue-700" title="Sửa">
                      <FaEdit size={18} />
                    </button>
                    <button className="text-red-500 hover:text-red-700" title="Xóa">
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default QuanLyTaiXe;