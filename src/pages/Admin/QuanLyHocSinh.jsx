import React, { useState, useMemo, useEffect } from 'react'; // Giữ lại import useEffect
import { FaPlus, FaSearch, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import StudentModal from '../../components/StudentModal';
// --- DỮ LIỆU MẪU (Mô phỏng dữ liệu từ CSDL của bạn) ---
const sampleParents = [
  { id_nguoi_dung: 101, ho_ten: "Nguyễn Văn B" },
  { id_nguoi_dung: 102, ho_ten: "Trần Thị C" },
  { id_nguoi_dung: 103, ho_ten: "Lê Thị D" },
  { id_nguoi_dung: 104, ho_ten: "Phạm Thị E" },
];

const initialStudents = [
  { id_hoc_sinh: 1, ho_ten: 'Nguyễn Văn An', lop: 'Lớp 6A', id_phu_huynh: 101, id_diem_dung: 201, ghi_chu: 'Cần về sớm thứ 6' },
  { id_hoc_sinh: 2, ho_ten: 'Trần Thị Bích', lop: 'Lớp 7B', id_phu_huynh: 102, id_diem_dung: 202, ghi_chu: '' },
  { id_hoc_sinh: 3, ho_ten: 'Lê Văn Cường', lop: 'Lớp 8A', id_phu_huynh: 103, id_diem_dung: 201, ghi_chu: 'Dị ứng hải sản' },
];

const sampleStops = [
  { id_diem_dung: 201, ten_diem_dung: "Điểm A" },
  { id_diem_dung: 202, ten_diem_dung: "Điểm B" },
];
// --- COMPONENT CHÍNH QUẢN LÝ HỌC SINH ---
function QuanLyHocSinh() {
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); // State cho học sinh đang sửa

  const [stops, setStops] = useState([]);

  // useEffect để fetch dữ liệu khi component được mount
  useEffect(() => {
    // --- MÔ PHỎNG GỌI API ---
    // Trong ứng dụng thực tế, bạn sẽ gọi các service để lấy dữ liệu từ server ở đây.
    // Ví dụ:
    // const studentData = await studentService.getAll();
    // const parentData = await parentService.getAll();
    // const stopData = await stopService.getAll();
    setStudents(initialStudents);
    setParents(sampleParents);
    setStops(sampleStops);
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

  const getParentName = (parentId) => {
    return parents.find(p => p.id_nguoi_dung === parentId)?.ho_ten || 'N/A';
  };

  // Lấy tên điểm dừng từ id_diem_dung
  const getStopName = (stopId) => {
    return stops.find(s => s.id_diem_dung === stopId)?.ten_diem_dung || 'N/A';
  };

  const filteredStudents = useMemo(() => 
    students.filter(student => 
      student.ho_ten.toLowerCase().includes(searchTerm.toLowerCase())
    ), [students, searchTerm]);
  
  // --- CÁC HÀM XỬ LÝ LOGIC ---

  // Mở modal để thêm mới
  const handleAddNew = () => {
    setEditingStudent(null); // Đảm bảo không có dữ liệu cũ
    setIsModalOpen(true);
  };

  // Mở modal để chỉnh sửa
  const handleEdit = (student) => {
    setEditingStudent(student); // Gán dữ liệu học sinh cần sửa
    setIsModalOpen(true);
  };

  // Xử lý lưu (Thêm mới hoặc Cập nhật)
  const handleSaveStudent = (studentData) => {
    // TODO: Thay thế bằng logic gọi API thực tế (ví dụ: StudentService.update hoặc StudentService.create)
    if (studentData.id_hoc_sinh) {
      // --- Logic SỬA ---
      setStudents(students.map(s => 
        s.id_hoc_sinh === studentData.id_hoc_sinh ? studentData : s
      ));
      // Gợi ý: Sử dụng thư viện toast để hiển thị thông báo đẹp hơn
      alert('Cập nhật thông tin học sinh thành công!');
    } else {
      // --- Logic THÊM MỚI ---
      const newStudentWithId = { 
        ...studentData, 
        id_hoc_sinh: Math.max(0, ...students.map(s => s.id_hoc_sinh)) + 1 // Giả lập id mới, API sẽ trả về id thật
      };
      setStudents([...students, newStudentWithId]);
      alert('Thêm học sinh mới thành công!');
    }
    setIsModalOpen(false);
    setEditingStudent(null); // Reset state sau khi lưu
  };

  // Xử lý xóa
  const handleDeleteStudent = (studentId) => {
    // Logic xác nhận chỉ nên ở một nơi
    if (window.confirm('Bạn có chắc chắn muốn xóa học sinh này không?')) {
      // TODO: Thay thế bằng logic gọi API thực tế (ví dụ: StudentService.delete(studentId))
      setStudents(students.filter(s => s.id_hoc_sinh !== studentId));
      alert('Xóa học sinh thành công!');
    }
    // Đóng modal nếu nó đang mở cho học sinh vừa bị xóa
    if (editingStudent && editingStudent.id_hoc_sinh === studentId) {
        setIsModalOpen(false);
        setEditingStudent(null);
    }
  };

  return (
    <>
      <StudentModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingStudent(null); }} 
        onSave={handleSaveStudent}
        onDelete={handleDeleteStudent} // Prop để xóa từ modal
        initialData={editingStudent} // Prop chứa dữ liệu để sửa
        parents={parents}
        stops = {stops}
      />

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý học sinh</h1>
          <button 
            onClick={handleAddNew} // Sử dụng hàm mới để thêm
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
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Điểm đón/trả</th>
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
                  <td className="py-3 px-4 text-gray-700">{getStopName(student.id_diem_dung)}</td>
                  <td className="py-3 px-4 text-gray-700 truncate max-w-xs">{student.ghi_chu}</td>
                  <td className="py-3 px-4 flex gap-3">
                    <button 
                      onClick={() => handleEdit(student)} 
                      className="text-blue-500 hover:text-blue-700" 
                      title="Sửa"
                    ><FaEdit size={18} /></button>
                    <button 
                      onClick={() => handleDeleteStudent(student.id_hoc_sinh)} 
                      className="text-red-500 hover:text-red-700" 
                      title="Xóa"
                    ><FaTrash size={18} /></button>
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