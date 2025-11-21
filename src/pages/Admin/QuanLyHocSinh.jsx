import React, { useState, useEffect, useMemo } from "react";
import { FaPlus, FaSearch, FaSpinner, FaEdit, FaTrash } from "react-icons/fa";
import hocSinhService from "../../services/hocSinhService";
import StudentModal from "../../components/StudentModal";

function QuanLyHocSinh() {
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await hocSinhService.getAll();
      if (res?.success) setStudents(res.data || []);
      else setError(res?.message || "Không thể lấy danh sách học sinh");
    } catch (err) {
      console.error(err);
      setError("Lỗi khi tải danh sách học sinh");
    } finally {
      setLoading(false);
    }
  };

  // Fetch parents
  const fetchParents = async () => {
    try {
      const res = await hocSinhService.getPhuHuynh();
      if (res?.success) setParents(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchParents();
  }, []);

  const filteredStudents = useMemo(
    () =>
      students.filter((s) =>
        (s.ho_ten || "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [students, searchTerm]
  );

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingStudent) {
        // Update
        const res = await hocSinhService.update(editingStudent.id_hoc_sinh, formData);
        if (res?.success) {
          setStudents((prev) =>
            prev.map((s) => (s.id_hoc_sinh === editingStudent.id_hoc_sinh ? res.data : s))
          );
          setIsModalOpen(false);
        } else {
          alert(res?.message || "Cập nhật thất bại");
        }
      } else {
        // Create
        const res = await hocSinhService.create(formData);
        if (res?.success) {
          setStudents((prev) => [res.data, ...prev]);
          setIsModalOpen(false);
        } else {
          alert(res?.message || "Thêm học sinh thất bại");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu học sinh");
    }
  };

  const handleDelete = async (student) => {
    if (!window.confirm("Bạn có chắc muốn xóa học sinh này?")) return;
    try {
      const res = await hocSinhService.delete(student.id_hoc_sinh);
      if (res?.success) {
        setStudents((prev) => prev.filter((s) => s.id_hoc_sinh !== student.id_hoc_sinh));
      } else {
        alert(res?.message || "Xóa thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa học sinh");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
      {/* Modal */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editingStudent={editingStudent}
        parents={parents}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý học sinh</h1>
          <p className="text-gray-500 mt-1">Quản lý thông tin học sinh</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
        >
          <FaPlus className="text-sm" />
          <span>Thêm học sinh</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên học sinh..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Hiển thị {filteredStudents.length} kết quả</span>
        </div>
      </div>

      {/* Danh sách học sinh */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FaSpinner className="animate-spin text-indigo-600 text-3xl mb-3" />
          <p className="text-gray-500 font-medium">Đang tải danh sách học sinh...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <button
            onClick={fetchStudents}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thông tin học sinh
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Phụ huynh
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ghi chú
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    Không tìm thấy học sinh
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id_hoc_sinh}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{student.ho_ten}</div>
                      <div className="text-sm text-gray-500 mt-1">Lớp: {student.lop}</div>
                    </td>
                    <td className="px-6 py-4">
                      {parents.find((p) => p.id_nguoi_dung === student.id_phu_huynh)?.ho_ten || "-"}
                    </td>
                    <td className="px-6 py-4">{student.ghi_chu || "-"}</td>
                    <td className="px-6 py-4 text-right flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(student)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(student)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default QuanLyHocSinh;
