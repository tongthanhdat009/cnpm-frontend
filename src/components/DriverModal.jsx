import { FaTimes, FaUser, FaUserTag, FaPhone, FaLock, FaSave } from 'react-icons/fa';
import { useState, useEffect } from 'react';

// --- COMPONENT MODAL ĐỂ THÊM/SỬA TÀI XẾ ---
const DriverModal = ({ isOpen, onClose, onSave, editingDriver = null }) => {
  const [formData, setFormData] = useState({
    ho_ten: '',
    ten_tai_khoan: '', // Backend field name
    so_dien_thoai: '',
    mat_khau: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingDriver) {
      setFormData({
        ho_ten: editingDriver.ho_ten || '',
        ten_tai_khoan: editingDriver.ten_tai_khoan || '', // backend field
        so_dien_thoai: editingDriver.so_dien_thoai || '',
        mat_khau: '', // Don't populate password for editing
      });
    } else {
      setFormData({
        ho_ten: '',
        ten_tai_khoan: '',
        so_dien_thoai: '',
        mat_khau: '',
      });
    }
    setErrors({});
  }, [editingDriver, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ho_ten.trim()) {
      newErrors.ho_ten = 'Họ và tên là bắt buộc';
    }

    // Username must follow backend rules: letters, numbers, underscores, 3-50 chars
    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
    if (!formData.ten_tai_khoan.trim()) {
      newErrors.ten_tai_khoan = 'Tên tài khoản là bắt buộc';
    } else if (!usernameRegex.test(formData.ten_tai_khoan)) {
      newErrors.ten_tai_khoan = 'Tên tài khoản không hợp lệ (3-50 chữ cái, số hoặc dấu gạch dưới)';
    }

    if (!editingDriver && !formData.mat_khau) {
      newErrors.mat_khau = 'Mật khẩu là bắt buộc';
    } else if (!editingDriver && formData.mat_khau.length < 6) {
      newErrors.mat_khau = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (formData.so_dien_thoai && !/^(\+84|0)[3|5|7|8|9][0-9]{8}$/.test(formData.so_dien_thoai)) {
      newErrors.so_dien_thoai = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ho_ten: formData.ho_ten.trim(),
      ten_tai_khoan: formData.ten_tai_khoan.trim(),
      so_dien_thoai: formData.so_dien_thoai.trim() || null,
      ...(editingDriver ? {} : { mat_khau: formData.mat_khau }), // Only include password for new drivers
    };

    // include id when editing to help caller decide update vs create
    if (editingDriver && editingDriver.id_nguoi_dung) {
      submitData.id_nguoi_dung = editingDriver.id_nguoi_dung;
    }

    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {editingDriver ? <FaUserTag /> : <FaUser />}
            {editingDriver ? 'Cập nhật thông tin tài xế' : 'Thêm tài xế mới'}
          </h2>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Họ tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaUser />
              </div>
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

          {/* Tên tài khoản */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên tài khoản</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaUserTag />
              </div>
              <input
                type="text"
                name="ten_tai_khoan"
                value={formData.ten_tai_khoan}
                onChange={handleInputChange}
                disabled={!!editingDriver}
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${errors.ten_tai_khoan ? 'border-red-300 bg-red-50' : 'border-gray-200'} ${editingDriver ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                placeholder="Nhập tên tài khoản..."
              />
            </div>
            {errors.ten_tai_khoan && <p className="mt-1 text-xs text-red-500 font-medium">{errors.ten_tai_khoan}</p>}
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaPhone />
              </div>
              <input
                type="text"
                name="so_dien_thoai"
                value={formData.so_dien_thoai}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${errors.so_dien_thoai ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                placeholder="Nhập số điện thoại..."
              />
            </div>
            {errors.so_dien_thoai && <p className="mt-1 text-xs text-red-500 font-medium">{errors.so_dien_thoai}</p>}
          </div>

          {/* Mật khẩu (chỉ hiện khi tạo mới) */}
          {!editingDriver && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaLock />
                </div>
                <input
                  type="password"
                  name="mat_khau"
                  value={formData.mat_khau}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${errors.mat_khau ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  placeholder="Nhập mật khẩu..."
                />
              </div>
              {errors.mat_khau && <p className="mt-1 text-xs text-red-500 font-medium">{errors.mat_khau}</p>}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <FaSave />
              {editingDriver ? 'Lưu thay đổi' : 'Tạo tài xế'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverModal;

