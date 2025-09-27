import React, { useState, useMemo } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUserFriends } from 'react-icons/fa';
import ParentModal from '../components/ParentModal';
// --- DỮ LIỆU MẪU (Mô phỏng bảng nguoi_dung với vai_tro = 'phu_huynh') ---
const sampleParents = [
  { id_nguoi_dung: 101, ho_ten: "Nguyễn Văn B", email: "van.b@email.com", so_dien_thoai: "0901234567" },
  { id_nguoi_dung: 102, ho_ten: "Trần Thị C", email: "thi.c@email.com", so_dien_thoai: "0912345678" },
  { id_nguoi_dung: 103, ho_ten: "Lê Thị D", email: "thi.d@email.com", so_dien_thoai: "0987654321" },
  { id_nguoi_dung: 104, ho_ten: "Phạm Văn E", email: "van.e@email.com", so_dien_thoai: "0977123890" },
];

// --- COMPONENT CHÍNH THÔNG TIN PHỤ HUYNH ---
function QuanLyPhuHuynh() {
  const [parents, setParents] = useState(sampleParents);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredParents = useMemo(() => 
    parents.filter(parent => 
      parent.ho_ten.toLowerCase().includes(searchTerm.toLowerCase())
    ), [parents, searchTerm]);
  
  const handleSaveParent = (newParentData) => {
    const newParentWithId = { 
      ...newParentData, 
      id_nguoi_dung: Math.max(...parents.map(p => p.id_nguoi_dung)) + 1 
    };
    setParents([...parents, newParentWithId]);
    setIsModalOpen(false);
  };

  return (
    <>
      <ParentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveParent}
      />

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý phụ huynh</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          >
            <FaPlus />
            Thêm phụ huynh
          </button>
        </div>

        <div className="relative mb-4">
          <input 
            type="text"
            placeholder="Tìm kiếm theo tên phụ huynh..."
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
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredParents.map((parent) => (
                <tr key={parent.id_nguoi_dung} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">{parent.id_nguoi_dung}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{parent.ho_ten}</td>
                  <td className="py-3 px-4 text-gray-700">{parent.email}</td>
                  <td className="py-3 px-4 text-gray-700">{parent.so_dien_thoai}</td>
                  <td className="py-3 px-4 flex gap-3">
                    <button className="text-green-500 hover:text-green-700" title="Xem danh sách con">
                      <FaUserFriends size={18} />
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

export default QuanLyPhuHuynh;