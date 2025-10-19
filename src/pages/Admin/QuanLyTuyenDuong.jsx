import React, { useState} from 'react';
import { FaPlus, FaEye, FaTrash} from 'react-icons/fa';
import RouteModal from '../../components/RouteModal';

// --- DỮ LIỆU MẪU (Mô phỏng CSDL) ---
const sampleStops = [
  { id_diem_dung: 1, ten_diem_dung: 'Trường THCS A', vi_do: 10.7769, kinh_do: 106.7008 },
  { id_diem_dung: 2, ten_diem_dung: 'Nhà văn hóa Thanh Niên', vi_do: 10.7820, kinh_do: 106.6950 },
  { id_diem_dung: 3, ten_diem_dung: 'Ngã tư Hàng Xanh', vi_do: 10.8010, kinh_do: 106.7090 },
  { id_diem_dung: 4, ten_diem_dung: 'Công viên Gia Định', vi_do: 10.8150, kinh_do: 106.6780 },
  { id_diem_dung: 5, ten_diem_dung: 'Chợ Bến Thành', vi_do: 10.7725, kinh_do: 106.6980 },
];

const sampleRoutes = [
  { id_tuyen_duong: 1, ten_tuyen_duong: 'Tuyến số 1', mo_ta: 'Đón học sinh khu vực Quận 1 và Bình Thạnh.', diem_dung_ids: [1, 2, 3] },
  { id_tuyen_duong: 2, ten_tuyen_duong: 'Tuyến số 2', mo_ta: 'Đón học sinh khu vực Phú Nhuận.', diem_dung_ids: [1, 4] },
];

// --- COMPONENT CHÍNH QUẢN LÝ TUYẾN ĐƯỜNG ---
function QuanLyTuyenDuong() {
  const [routes, setRoutes] = useState(sampleRoutes);
  const [allStops, setAllStops] = useState(sampleStops);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routeToEdit, setRouteToEdit] = useState(null);

  const handleAddNew = () => {
    setRouteToEdit(null);
    setIsModalOpen(true);
  }

  const handleEdit = (route) => {
    setRouteToEdit(route);
    setIsModalOpen(true);
  }

  const handleSaveRoute = (newRouteData) => {
    // Logic thêm mới hoặc cập nhật
    const newRoutes = [...routes];
    newRoutes.push({ id_tuyen_duong: Math.floor(Math.random() * 1000), ...newRouteData });
    setRoutes(newRoutes);
    setIsModalOpen(false);
  };
  
  return (
    <>
      <RouteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveRoute}
        allStops={allStops}
        routeToEdit={routeToEdit}
      />
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý tuyến đường</h1>
          <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors">
            <FaPlus />
            Tạo tuyến đường
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Tên tuyến đường</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Mô tả</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Số trạm</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {routes.map((route) => (
                <tr key={route.id_tuyen_duong} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-sm text-gray-500">{route.id_tuyen_duong}</td>
                  <td className="py-4 px-4 text-sm text-gray-900 font-medium">{route.ten_tuyen_duong}</td>
                  <td className="py-4 px-4 text-sm text-gray-500 max-w-sm truncate">{route.mo_ta}</td>
                  <td className="py-4 px-4 text-sm text-gray-500">{route.diem_dung_ids.length}</td>
                  <td className="py-4 px-4 text-sm flex gap-4">
                    <button onClick={() => handleEdit(route)} className="text-indigo-600 hover:text-indigo-900" title="Xem chi tiết/Sửa">
                      <FaEye size={18} />
                    </button>
                    <button className="text-red-600 hover:text-red-900" title="Xóa">
                      <FaTrash size={18} />
                    </button>
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

export default QuanLyTuyenDuong;