import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

// --- COMPONENT MODAL ĐỂ THÊM/SỬA XE BUÝT ---

const BusModal = ({ isOpen, onClose, onSave, initialData, currentTitle }) => {
    
    // 1. Quản lý form bằng state để hỗ trợ điền dữ liệu cũ
    const [formData, setFormData] = useState({
        bien_so_xe: '',
        so_ghe: '',
        mau_xe: '',
    });

    // 2. useEffect để điền dữ liệu khi ở chế độ Sửa
    useEffect(() => {
        if (initialData) {
            // Chế độ Sửa: Điền dữ liệu cũ
            setFormData({
                bien_so_xe: initialData.bien_so_xe || '',
                so_ghe: initialData.so_ghe || '', // Giữ nguyên type là number
                mau_xe: initialData.mau_xe || '',
            });
        } else {
            
            setFormData({
                bien_so_xe: '',
                so_ghe: '',
                mau_xe: '',
            });
        }
    }, [initialData, isOpen]); // Kích hoạt khi dữ liệu hoặc trạng thái mở thay đổi

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Xử lý giá trị số (số ghế) để đảm bảo đúng format
        const finalValue = name === 'so_ghe' ? parseInt(value) || 0 : value; 
        
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        // Thêm ID vào dữ liệu nếu đang ở chế độ Sửa
        const finalData = initialData 
            ? { ...formData, id_xe_buyt: initialData.id_xe_buyt } 
            : formData;
            
        onSave(finalData);
       
    };
    
    
    const title = currentTitle || "Thêm xe buýt mới";

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 pointer-events-none">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg pointer-events-auto">
                <div className="flex justify-between items-center mb-6">
                    {/* */}
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FaTimes size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="bien_so_xe" className="block text-sm font-medium text-gray-700">Biển số xe</label>
                            <input 
                                type="text" 
                                name="bien_so_xe" 
                                id="bien_so_xe" 
                                required 
                                value={formData.bien_so_xe} // Đã gán giá trị từ state
                                onChange={handleChange}     // Đã gán hàm xử lý thay đổi
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="so_ghe" className="block text-sm font-medium text-gray-700">Số ghế</label>
                            <input 
                                type="number" 
                                name="so_ghe" 
                                id="so_ghe" 
                                required 
                                value={formData.so_ghe} // Đã gán giá trị từ state
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="mau_xe" className="block text-sm font-medium text-gray-700">Mẫu xe</label>
                            <input 
                                type="text" 
                                name="mau_xe" 
                                id="mau_xe" 
                                value={formData.mau_xe} // Đã gán giá trị từ state
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
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
export default BusModal;