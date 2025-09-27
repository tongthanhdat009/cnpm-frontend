import { FaTimes } from 'react-icons/fa';
// --- COMPONENT MODAL ĐỂ THÊM/SỬA TÀI XẾ ---
const DriverModal = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newDriverData = {
      ho_ten: formData.get('ho_ten'),
      email: formData.get('email'),
      so_dien_thoai: formData.get('so_dien_thoai'),
      mat_khau_bam: formData.get('mat_khau'), 
      vai_tro: 'tai_xe',
      // Các trường khác như trang_thai, xe_phu_trach sẽ được quản lý ở logic khác
    };
    onSave(newDriverData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Thêm tài xế mới</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="ho_ten" className="block text-sm font-medium text-gray-700">Họ và Tên</label>
              <input type="text" name="ho_ten" id="ho_ten" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" id="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="so_dien_thoai" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input type="tel" name="so_dien_thoai" id="so_dien_thoai" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="mat_khau" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
              <input type="password" name="mat_khau" id="mat_khau" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
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