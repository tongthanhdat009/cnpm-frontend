import React, { useState, useMemo } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import StudentModal from '../components/StudentModal';
// --- DỮ LIỆU MẪU (Mô phỏng dữ liệu từ CSDL của bạn) ---
const sampleParents = [
  { id_nguoi_dung: 101, ho_ten: "Nguyễn Văn B" },
  { id_nguoi_dung: 102, ho_ten: "Trần Thị C" },
  { id_nguoi_dung: 103, ho_ten: "Lê Thị D" },
  { id_nguoi_dung: 104, ho_ten: "Phạm Thị E" },
];

const initialStudents = [
  { id_hoc_sinh: 1, ho_ten: 'Nguyễn Văn An', lop: 'Lớp 6A', id_phu_huynh: 101, ghi_chu: 'Cần về sớm thứ 6' },
  { id_hoc_sinh: 2, ho_ten: 'Trần Thị Bích', lop: 'Lớp 7B', id_phu_huynh: 102, ghi_chu: '' },
  { id_hoc_sinh: 3, ho_ten: 'Lê Văn Cường', lop: 'Lớp 8A', id_phu_huynh: 103, ghi_chu: 'Dị ứng hải sản' },
];

// --- COMPONENT CHÍNH QUẢN LÝ HỌC SINH ---
function QuanLyHocSinh() {
  const [students, setStudents] = useState(initialStudents);
  const [parents, setParents] = useState(sampleParents);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lấy tên phụ huynh từ id_phu_huynh
  const getParentName = (parentId) => {
    return parents.find(p => p.id_nguoi_dung === parentId)?.ho_ten || 'N/A';
  };

  const filteredStudents = useMemo(() => 
    students.filter(student => 
      student.ho_ten.toLowerCase().includes(searchTerm.toLowerCase())
    ), [students, searchTerm]);
  
  const handleSaveStudent = (newStudentData) => {
    // Trong thực tế, bạn sẽ gọi API để lưu vào CSDL và lấy về id mới
    const newStudentWithId = { 
      ...newStudentData, 
      id_hoc_sinh: Math.max(...students.map(s => s.id_hoc_sinh)) + 1 // Giả lập id mới
    };
    setStudents([...students, newStudentWithId]);
    setIsModalOpen(false); // Đóng modal sau khi lưu
  };

  return (
    <>
      <StudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveStudent}
        parents={parents}
      />

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý học sinh</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          >
            <FaPlus />
            Thêm học sinh
          </button>
        </div>

        <div className="relative mb-4">
          <input 
            type="text"
            placeholder="Tìm kiếm theo tên học sinh..."
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
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Mã HS</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Họ và Tên</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Lớp</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Tên Phụ Huynh</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Ghi chú</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id_hoc_sinh} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">{`HS${String(student.id_hoc_sinh).padStart(3, '0')}`}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{student.ho_ten}</td>
                  <td className="py-3 px-4 text-gray-700">{student.lop}</td>
                  <td className="py-3 px-4 text-gray-700">{getParentName(student.id_phu_huynh)}</td>
                  <td className="py-3 px-4 text-gray-700 truncate max-w-xs">{student.ghi_chu}</td>
                  <td className="py-3 px-4 flex gap-3">
                    <button className="text-blue-500 hover:text-blue-700"><FaEdit size={18} /></button>
                    <button className="text-red-500 hover:text-red-700"><FaTrash size={18} /></button>
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

export default QuanLyHocSinh;