import React, { useState, useMemo } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaRoute } from 'react-icons/fa';
// Đảm bảo đường dẫn này trỏ đúng đến file BusModal.jsx
import BusModal from '../../components/BusModal'; 

// --- DỮ LIỆU MẪU (Mô phỏng bảng xe_buyt) ---
const sampleBuses = [
  { id_xe_buyt: 1, bien_so_xe: "51B-123.45", so_ghe: 29, mau_xe: "Mercedes Sprinter", tai_xe_hien_tai: "Trần Văn Sáu" },
  { id_xe_buyt: 2, bien_so_xe: "51C-678.90", so_ghe: 16, mau_xe: "Ford Transit", tai_xe_hien_tai: "Lý Thị Bảy" },
  { id_xe_buyt: 3, bien_so_xe: "51D-112.23", so_ghe: 45, mau_xe: "Hyundai Universe", tai_xe_hien_tai: "Phan Thị Chín" },
  { id_xe_buyt: 4, bien_so_xe: "51F-456.78", so_ghe: 29, mau_xe: "Thaco Town", tai_xe_hien_tai: "Chưa phân công" },
];

// --- COMPONENT CHÍNH QUẢN LÝ XE BUÝT ---
function QuanLyXeBus() {
  const [buses, setBuses] = useState(sampleBuses);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null); 
  
  // Dùng để xác định tiêu đề Modal: ĐÃ KHẮC PHỤC LỖI TIÊU ĐỀ
  const [modalTitle, setModalTitle] = useState("Thêm xe buýt mới"); 

  const filteredBuses = useMemo(() => 
    buses.filter(bus => 
      bus.bien_so_xe.toLowerCase().includes(searchTerm.toLowerCase())
    ), [buses, searchTerm]);
  
  // Hàm đóng Modal và reset các state liên quan đến Sửa/Tiêu đề
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBus(null);
    setModalTitle("Thêm xe buýt mới"); // Reset tiêu đề về mặc định
  };

  // Logic chung cho việc LƯU (Thêm Mới hoặc Cập Nhật)
  const handleSaveBus = (busData) => {
    if (editingBus) {
      // 1. CHẾ ĐỘ CẬP NHẬT (Update)
      const updatedBuses = buses.map(bus => 
        bus.id_xe_buyt === editingBus.id_xe_buyt 
          ? { ...bus, ...busData } // Ghi đè dữ liệu mới
          : bus
      );
      setBuses(updatedBuses);
    } else {
      // 2. CHẾ ĐỘ THÊM MỚI (Create)
      const newId = Math.max(...buses.map(b => b.id_xe_buyt), 0) + 1;
      const newBusWithId = { 
        ...busData, 
        id_xe_buyt: newId,
        tai_xe_hien_tai: "Chưa phân công" 
      };
      setBuses([...buses, newBusWithId]);
    }

    handleCloseModal();
  };
  
  // Hàm xử lý MỞ chế độ SỬA
  const handleEditBus = (bus) => {
    setEditingBus(bus); // Gán dữ liệu xe đang sửa
    setModalTitle("Sửa thông tin xe buýt"); // Đặt tiêu đề Sửa
    setIsModalOpen(true); 
  };
  
  // Hàm xử lý XÓA
  const handleDeleteBus = (id) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa xe buýt ID ${id} không?`)) {
        const updatedBuses = buses.filter(bus => bus.id_xe_buyt !== id);
        setBuses(updatedBuses);
    }
  };

  return (
    <>
      {/* TRUYỀN PROP currentTitle VÀ initialData CHO MODAL */}
      <BusModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleSaveBus}
        initialData={editingBus} 
        currentTitle={modalTitle} // Tiêu đề động
      />

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý xe buýt</h1>
          <button 
            // Cập nhật: Thiết lập Tiêu đề khi Thêm mới
            onClick={() => { setEditingBus(null); setModalTitle("Thêm xe buýt mới"); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          >
            <FaPlus />
            Thêm xe buýt
          </button>
        </div>

        <div className="relative mb-4">
          <input 
            type="text"
            placeholder="Tìm kiếm theo biển số xe..."
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
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">ID Xe</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Biển số xe</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Mẫu xe</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Số ghế</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Tài xế phụ trách</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuses.map((bus) => (
                <tr key={bus.id_xe_buyt} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">{bus.id_xe_buyt}</td>
                  <td className="py-3 px-4 font-medium text-gray-900 font-mono tracking-wider">{bus.bien_so_xe}</td>
                  <td className="py-3 px-4 text-gray-700">{bus.mau_xe}</td>
                  <td className="py-3 px-4 text-gray-700">{bus.so_ghe}</td>
                  <td className="py-3 px-4 text-gray-700">{bus.tai_xe_hien_tai}</td>
                  <td className="py-3 px-4 flex gap-3">
                    <button className="text-teal-500 hover:text-teal-700" title="Xem tuyến đường">
                      <FaRoute size={18} />
                    </button>
                    {/* Nút SỬA: Gọi hàm handleEditBus */}
                    <button 
                      onClick={() => handleEditBus(bus)}
                      className="text-blue-500 hover:text-blue-700" 
                      title="Sửa"
                    >
                      <FaEdit size={18} />
                    </button>
                    {/* Nút XÓA: Gọi hàm handleDeleteBus */}
                    <button 
                      onClick={() => handleDeleteBus(bus.id_xe_buyt)} 
                      className="text-red-500 hover:text-red-700" 
                      title="Xóa"
                    >
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

export default QuanLyXeBus;