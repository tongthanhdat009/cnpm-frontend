import React, { useState, useEffect } from 'react';
import { FaPlus, FaEye, FaTrash } from 'react-icons/fa';
import CreateRouteModal from '../../components/CreateRouteModal';
import UpdateRouteModal from '../../components/UpdateRouteModal';
import TuyenDuongService from '../../services/tuyenDuongService';
import DiemDungService from '../../services/diemDuongService';

function QuanLyTuyenDuong() {
  const [routes, setRoutes] = useState([]);
  const [allStops, setAllStops] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routeToEdit, setRouteToEdit] = useState(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await TuyenDuongService.getAllTuyenDuong();
        console.log("📡 Dữ liệu tuyến đường từ API:", response.data);
        setRoutes(response.data);
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách tuyến đường:", error);
      }
    };
    fetchRoutes();
    // Lấy tất cả điểm dừng để truyền vào modal
    const fetchStops = async () => {
      try {
        const res = await DiemDungService.getAllDiemDung();
        if (res && res.success) {
          setAllStops(res.data || []);
        } else {
          console.warn('Không lấy được danh sách điểm dừng:', res?.error);
        }
      } catch (err) {
        console.error('Lỗi khi lấy điểm dừng:', err);
      }
      console.log('Danh sách điểm dừng:', allStops);
    };
    fetchStops();
  }, []);

  const handleAddNew = () => {
    setRouteToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (route) => {
    setRouteToEdit(route);
    setIsModalOpen(true);
  };

  const handleSaveRoute = (newRouteData) => {
    // If editing existing route (id provided), update it in state
    if (newRouteData.id_tuyen_duong) {
      setRoutes(prev => prev.map(r => r.id_tuyen_duong === newRouteData.id_tuyen_duong ? { ...r, ...newRouteData } : r));
    } else {
      const newRoutes = [...routes];
      newRoutes.push({ id_tuyen_duong: Math.floor(Math.random() * 1000), ...newRouteData });
      setRoutes(newRoutes);
    }
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRouteToEdit(null);
  };

  return (
    <>
      {isModalOpen && (routeToEdit ? (
        <UpdateRouteModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveRoute}
          allStops={allStops}
          routeToEdit={routeToEdit}
          readOnly={Boolean(routeToEdit?.is_use)}
        />
      ) : (
        <CreateRouteModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveRoute}
          allStops={allStops}
        />
      ))}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý tuyến đường</h1>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          >
            <FaPlus />
            Tạo tuyến đường
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Tên tuyến đường</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Mô tả</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Số điểm dừng</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Số học sinh</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Quãng đường (m)</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Thời gian dự kiến (phút)</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {routes.map((route) => (
                <tr key={route.id_tuyen_duong} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-sm text-gray-500">{route.id_tuyen_duong}</td>
                  <td className="py-4 px-4 text-sm text-gray-900 font-medium">{route.ten_tuyen_duong}</td>
                  <td className="py-4 px-4 text-sm text-gray-500 max-w-sm truncate">{route.mo_ta}</td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {route.tuyen_duong_diem_dung?.length || 0}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {route.phan_cong_hoc_sinh?.length || 0}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">{route.quang_duong ?? '-'}</td>
                  <td className="py-4 px-4 text-sm text-gray-500">{route.thoi_gian_du_kien ?? '-'}</td>
                  <td className="py-4 px-4 text-sm flex gap-4">
                    <button
                      onClick={() => handleEdit(route)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Xem chi tiết / Sửa"
                    >
                      <FaEye size={18} />
                    </button>
                    <button className="text-red-600 hover:text-red-900" title="Xóa">
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {routes.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500 italic">
                    Không có dữ liệu tuyến đường
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default QuanLyTuyenDuong;
