import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

// --- COMPONENT MODAL ĐỂ THÊM/SỬA/XÓA HỌC SINH ---
const StudentModal = ({ isOpen, onClose, onSave, onDelete, parents, initialData }) => {
// Đã loại bỏ 'currentTitle' khỏi danh sách props

  const [formData, setFormData] = useState({
    ho_ten: '',
    lop: '',
    id_phu_huynh: '',
    ghi_chu: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ho_ten: initialData.ho_ten || '',
        lop: initialData.lop || '',
        id_phu_huynh: initialData.id_phu_huynh ? String(initialData.id_phu_huynh) : '',
        ghi_chu: initialData.ghi_chu || '',
      });
    } else {
      setFormData({
        ho_ten: '',
        lop: '',
        id_phu_huynh: '',
        ghi_chu: '',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const dataToSave = {
      ...formData,
      id_phu_huynh: formData.id_phu_huynh ? parseInt(formData.id_phu_huynh) : null,
    };

    const finalData = initialData
      ? { ...dataToSave, id_hoc_sinh: initialData.id_hoc_sinh }
      : dataToSave;

    onSave(finalData);
  };

  const handleDelete = () => {
    if (initialData && onDelete) {
      if (window.confirm(`Bạn có chắc chắn muốn xóa học sinh ${initialData.ho_ten} không?`)) {
        onDelete(initialData.id_hoc_sinh);
      }
    }
  };

  // Vẫn giữ logic tính toán tiêu đề dựa trên initialData
  const title = initialData ? "Sửa thông tin học sinh" : "Thêm học sinh mới";
  const isEditMode = !!initialData;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 pointer-events-none">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg pointer-events-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="ho_ten" className="block text-sm font-medium text-gray-700">Họ và Tên</label>
              <input type="text" name="ho_ten" id="ho_ten" required
                value={formData.ho_ten}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="lop" className="block text-sm font-medium text-gray-700">Lớp</label>
              <input type="text" name="lop" id="lop"
                value={formData.lop}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="id_phu_huynh" className="block text-sm font-medium text-gray-700">Phụ huynh</label>
              <select name="id_phu_huynh" id="id_phu_huynh" required
                value={formData.id_phu_huynh}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Chọn phụ huynh</option>
                {parents.map(p => (
                  <option key={p.id_nguoi_dung} value={p.id_nguoi_dung}>{p.ho_ten}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ghi_chu" className="block text-sm font-medium text-gray-700">Ghi chú</label>
              <textarea name="ghi_chu" id="ghi_chu" rows="3"
                value={formData.ghi_chu}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <div>
              {isEditMode && (
                <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  Xóa Học Sinh
                </button>
              )}
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Hủy</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Lưu lại</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;