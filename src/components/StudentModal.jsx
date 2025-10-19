import { FaTimes } from 'react-icons/fa';

// --- COMPONENT MODAL ĐỂ THÊM/SỬA HỌC SINH ---
const StudentModal = ({ isOpen, onClose, onSave, parents }) => {
  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newStudentData = {
      // id_hoc_sinh sẽ được tạo tự động ở backend
      ho_ten: formData.get('ho_ten'),
      lop: formData.get('lop'),
      id_phu_huynh: parseInt(formData.get('id_phu_huynh')),
      ghi_chu: formData.get('ghi_chu'),
    };
    onSave(newStudentData);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Thêm học sinh mới</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="ho_ten" className="block text-sm font-medium text-gray-700">Họ và Tên</label>
              <input type="text" name="ho_ten" id="ho_ten" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="lop" className="block text-sm font-medium text-gray-700">Lớp</label>
              <input type="text" name="lop" id="lop" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="id_phu_huynh" className="block text-sm font-medium text-gray-700">Phụ huynh</label>
              <select name="id_phu_huynh" id="id_phu_huynh" required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Chọn phụ huynh</option>
                {parents.map(p => (
                  <option key={p.id_nguoi_dung} value={p.id_nguoi_dung}>{p.ho_ten}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ghi_chu" className="block text-sm font-medium text-gray-700">Ghi chú</label>
              <textarea name="ghi_chu" id="ghi_chu" rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
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
export default StudentModal;