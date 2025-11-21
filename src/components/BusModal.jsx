import { FaTimes, FaBus, FaIdCard, FaPalette, FaSave } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const BusModal = ({ isOpen, onClose, onSave, editingBus = null }) => {
  const [formData, setFormData] = useState({
    bien_so_xe: '',
    so_ghe: '',
    hang: '',  // ← đổi từ mau_xe → hang
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingBus) {
      setFormData({
        bien_so_xe: editingBus.bien_so_xe || '',
        so_ghe: editingBus.so_ghe || '',
        hang: editingBus.hang || '',  // ← lấy đúng cột từ DB
      });
    } else {
      setFormData({ bien_so_xe: '', so_ghe: '', hang: '' });
    }
    setErrors({});
  }, [editingBus, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === 'so_ghe' ? parseInt(value) || '' : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.bien_so_xe.trim()) newErrors.bien_so_xe = 'Biển số xe là bắt buộc';
    if (!formData.so_ghe || formData.so_ghe <= 0) newErrors.so_ghe = 'Số ghế phải lớn hơn 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">

        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaBus /> {editingBus ? 'Cập nhật xe buýt' : 'Thêm xe buýt mới'}
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Biển số xe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Biển số xe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaIdCard />
              </div>
              <input
                type="text"
                name="bien_so_xe"
                value={formData.bien_so_xe}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm ${errors.bien_so_xe ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                placeholder="Nhập biển số xe..."
              />
            </div>
            {errors.bien_so_xe && <p className="mt-1 text-xs text-red-500 font-medium">{errors.bien_so_xe}</p>}
          </div>

          {/* Số ghế */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Số ghế</label>
            <input
              type="number"
              name="so_ghe"
              value={formData.so_ghe}
              onChange={handleInputChange}
              className={`block w-full pl-3 pr-3 py-2.5 border rounded-xl text-sm ${errors.so_ghe ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              placeholder="Nhập số ghế..."
            />
            {errors.so_ghe && <p className="mt-1 text-xs text-red-500 font-medium">{errors.so_ghe}</p>}
          </div>

          {/* Mẫu xe (map vào cột HANG) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mẫu xe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaPalette />
              </div>
              <input
                type="text"
                name="hang"      // ← tên field gửi lên backend
                value={formData.hang}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm border-gray-200"
                placeholder="Nhập mẫu xe..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl">
              Hủy bỏ
            </button>
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl shadow-md">
              <FaSave /> {editingBus ? 'Lưu thay đổi' : 'Thêm xe'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default BusModal;
