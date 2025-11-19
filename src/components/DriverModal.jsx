import { FaTimes } from 'react-icons/fa';
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
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingDriver ? 'Chỉnh sửa tài xế' : 'Thêm tài xế mới'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="ho_ten" className="block text-sm font-medium text-gray-700">Họ và Tên</label>
              <input
                type="text"
                name="ho_ten"
                id="ho_ten"
                value={formData.ho_ten}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.ho_ten ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.ho_ten && <p className="mt-1 text-sm text-red-600">{errors.ho_ten}</p>}
            </div>
            <div>
              <label htmlFor="ten_tai_khoan" className="block text-sm font-medium text-gray-700">Tên tài khoản</label>
              <input
                type="text"
                name="ten_tai_khoan"
                id="ten_tai_khoan"
                value={formData.ten_tai_khoan}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.ten_tai_khoan ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.ten_tai_khoan && <p className="mt-1 text-sm text-red-600">{errors.ten_tai_khoan}</p>}
            </div>
            <div>
              <label htmlFor="so_dien_thoai" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input
                type="tel"
                name="so_dien_thoai"
                id="so_dien_thoai"
                value={formData.so_dien_thoai}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.so_dien_thoai ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.so_dien_thoai && <p className="mt-1 text-sm text-red-600">{errors.so_dien_thoai}</p>}
            </div>
            {!editingDriver && (
              <div className="md:col-span-2">
                <label htmlFor="mat_khau" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                <input
                  type="password"
                  name="mat_khau"
                  id="mat_khau"
                  value={formData.mat_khau}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.mat_khau ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.mat_khau && <p className="mt-1 text-sm text-red-600">{errors.mat_khau}</p>}
              </div>
            )}
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Lưu lại</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default DriverModal;