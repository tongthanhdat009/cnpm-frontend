import { FaTimes, FaUser, FaSchool, FaStickyNote, FaSave } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const StudentModal = ({ isOpen, onClose, onSave, editingStudent = null, parents = [] }) => {
  const [formData, setFormData] = useState({
    ho_ten: '',
    lop: '',
    ghi_chu: '',
    id_phu_huynh: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        ho_ten: editingStudent.ho_ten || '',
        lop: editingStudent.lop || '',
        ghi_chu: editingStudent.ghi_chu || '',
        id_phu_huynh: editingStudent.id_phu_huynh || '',
      });
    } else {
      setFormData({ ho_ten: '', lop: '', ghi_chu: '', id_phu_huynh: '' });
    }
    setErrors({});
  }, [editingStudent, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.ho_ten.trim()) newErrors.ho_ten = 'Họ và tên là bắt buộc';
    if (!formData.lop.trim()) newErrors.lop = 'Lớp là bắt buộc';
    if (!formData.id_phu_huynh) newErrors.id_phu_huynh = 'Phải chọn phụ huynh';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaUser /> {editingStudent ? 'Cập nhật học sinh' : 'Thêm học sinh mới'}
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Họ tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaUser /></div>
              <input
                type="text"
                name="ho_ten"
                value={formData.ho_ten}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${errors.ho_ten ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                placeholder="Nhập họ và tên..."
              />
            </div>
            {errors.ho_ten && <p className="mt-1 text-xs text-red-500 font-medium">{errors.ho_ten}</p>}
          </div>

          {/* Lớp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Lớp</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaSchool /></div>
              <input
                type="text"
                name="lop"
                value={formData.lop}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${errors.lop ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                placeholder="Nhập lớp..."
              />
            </div>
            {errors.lop && <p className="mt-1 text-xs text-red-500 font-medium">{errors.lop}</p>}
          </div>

          {/* Phụ huynh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phụ huynh</label>
            <select
              name="id_phu_huynh"
              value={formData.id_phu_huynh}
              onChange={handleInputChange}
              className={`block w-full pl-3 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${errors.id_phu_huynh ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            >
              <option value="">-- Chọn phụ huynh --</option>
              {parents.map(p => (
                <option key={p.id_nguoi_dung} value={p.id_nguoi_dung}>{p.ho_ten}</option>
              ))}
            </select>
            {errors.id_phu_huynh && <p className="mt-1 text-xs text-red-500 font-medium">{errors.id_phu_huynh}</p>}
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaStickyNote /></div>
              <textarea
                name="ghi_chu"
                value={formData.ghi_chu}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all border-gray-200"
                placeholder="Nhập ghi chú..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              Hủy bỏ
            </button>
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95">
              <FaSave /> {editingStudent ? 'Lưu thay đổi' : 'Tạo học sinh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
