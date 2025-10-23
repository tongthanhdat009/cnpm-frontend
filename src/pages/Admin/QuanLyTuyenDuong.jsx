import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEye, FaTrash } from 'react-icons/fa';
import CreateRouteModal from '../../components/CreateRouteModal';
import UpdateRouteModal from '../../components/UpdateRouteModal';
import AssignedStudentsModal from '../../components/AssignedStudentsModal';
import TuyenDuongService from '../../services/tuyenDuongService';
import DiemDungService from '../../services/diemDungService';
import HocSinhService from '../../services/hocSinhService';

function QuanLyTuyenDuong() {
  const [routes, setRoutes] = useState([]);
  const [allStops, setAllStops] = useState([]);
  const [stopCounts, setStopCounts] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routeToEdit, setRouteToEdit] = useState(null);
  const [isAssignedModalOpen, setIsAssignedModalOpen] = useState(false);
  const [assignedStudents, setAssignedStudents] = useState([]);

  // No hard reloads; we'll refetch data on demand after actions.

  const refreshRoutes = useCallback(async () => {
    try {
      const response = await TuyenDuongService.getAllTuyenDuong();
      console.log("📡 Dữ liệu tuyến đường từ API:", response.data);
      setRoutes(response.data);
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách tuyến đường:", error);
    }
  }, []);

  const refreshStopsAndCounts = useCallback(async () => {
    try {
      const [stopsRes, countsRes] = await Promise.all([
        DiemDungService.getAllDiemDung(),
        DiemDungService.getUnassignedCounts(),
      ]);

      if (countsRes && countsRes.success) {
        const map = (countsRes.data || []).reduce((acc, item) => {
          if (item && item.id_diem_dung != null) {
            const parsed = Number(item.so_luong_hoc_sinh_con);
            acc[item.id_diem_dung] = Number.isFinite(parsed) ? parsed : 0;
          }
          return acc;
        }, {});
        setStopCounts(map);
      } else {
        setStopCounts({});
      }

      if (stopsRes && stopsRes.success) {
        setAllStops(stopsRes.data || []);
      } else {
        console.warn('Không lấy được danh sách điểm dừng:', stopsRes?.error);
        setAllStops([]);
      }
    } catch (err) {
      console.error('Lỗi khi lấy điểm dừng hoặc số lượng chưa phân công:', err);
      setAllStops([]);
      setStopCounts({});
    }
  }, []);

  const refreshAllStudents = useCallback(async () => {
    try {
      const res = await HocSinhService.getAllHocSinh();
      const all = (res && res.success && Array.isArray(res.data)) ? res.data : [];
      setAssignedStudents(all);
    } catch (e) {
      console.error('Lỗi khi lấy danh sách học sinh:', e);
    }
  }, []);

  useEffect(() => {
    refreshRoutes();
    refreshStopsAndCounts();
  }, [refreshRoutes, refreshStopsAndCounts]);

  const handleAddNew = () => {
    setRouteToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (route) => {
    setRouteToEdit(route);
    setIsModalOpen(true);
  };

  const handleViewAssigned = (route) => {
    // fetch full student list then open modal and mark assigned ones
    (async () => {
      try {
        await refreshAllStudents();
        setRouteToEdit(route);
        setIsAssignedModalOpen(true);
      } catch (e) {
        console.error('Lỗi khi lấy danh sách học sinh:', e);
        setAssignedStudents(route.phan_cong_hoc_sinh || []);
        setRouteToEdit(route);
        setIsAssignedModalOpen(true);
      }
    })();
  };

  const handleSaveAssigned = async (selectedIds = [], route = {}) => {
    const rid = route?.id_tuyen_duong || route?.id;
    if (!rid) {
      alert('Thiếu ID tuyến đường');
      return;
    }
    try {
      const res = await TuyenDuongService.assignStudentsToRoute(rid, selectedIds);
      if (!res || !res.success) {
        alert(res?.error || 'Lỗi khi lưu phân công học sinh');
      } else {
        // Optional: alert('Lưu phân công thành công');
      }
    } catch (e) {
      console.error('Lỗi lưu phân công:', e);
      alert(e?.message || 'Lỗi mạng khi lưu phân công');
    } finally {
      // Đóng form và lấy lại toàn bộ dữ liệu (không reload)
      setIsAssignedModalOpen(false);
      setRouteToEdit(null);
      await Promise.all([
        refreshRoutes(),
        refreshStopsAndCounts(),
        refreshAllStudents(),
      ]);
    }
  };

  const handleDelete = async (route) => {
    if (!route || !route.id_tuyen_duong) return;
    const ok = window.confirm(`Bạn có chắc muốn xóa tuyến "${route.ten_tuyen_duong || route.id_tuyen_duong}" không?`);
    if (!ok) return;
    try {
      const res = await TuyenDuongService.deleteTuyenDuong(route.id_tuyen_duong);
      if (res && res.success) {
        // Sau khi xóa thành công, lấy lại dữ liệu (không reload)
        await Promise.all([
          refreshRoutes(),
          refreshStopsAndCounts(),
          refreshAllStudents(),
        ]);
      } else {
        alert(res?.error || 'Xóa tuyến đường thất bại');
      }
    } catch (e) {
      console.error('Lỗi khi xóa tuyến:', e);
      alert(e?.message || 'Lỗi mạng khi xóa tuyến');
    }
  };

  const handleSaveRoute = async (newRouteData) => {
    // Đóng form và lấy lại dữ liệu (không reload)
    setIsModalOpen(false);
    await Promise.all([
      refreshRoutes(),
      refreshStopsAndCounts(),
      refreshAllStudents(),
    ]);
  };

  const handleCloseModal = async () => {
    setIsModalOpen(false);
    setRouteToEdit(null);
    // Sau khi đóng form, lấy lại dữ liệu (không reload)
    await Promise.all([
      refreshRoutes(),
      refreshStopsAndCounts(),
      refreshAllStudents(),
    ]);
  };

  const handleCloseAssignedModal = async () => {
    setIsAssignedModalOpen(false);
    setRouteToEdit(null);
    // Sau khi đóng form, lấy lại dữ liệu (không reload)
    await Promise.all([
      refreshRoutes(),
      refreshStopsAndCounts(),
      refreshAllStudents(),
    ]);
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
          stopCounts={stopCounts}
          readOnly={Boolean(routeToEdit?.is_use)}
        />
      ) : (
        <CreateRouteModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveRoute}
          allStops={allStops}
          stopCounts={stopCounts}
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
                    <button
                      onClick={() => handleViewAssigned(route)}
                      className="text-green-600 hover:text-green-900"
                      title="Xem học sinh đã phân"
                    >
                      {/* reuse eye icon for view assigned */}
                      <FaEye size={18} />
                    </button>
                    <button onClick={() => handleDelete(route)} className="text-red-600 hover:text-red-900" title="Xóa">
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
      {isAssignedModalOpen && (
        <AssignedStudentsModal
          isOpen={isAssignedModalOpen}
          onClose={handleCloseAssignedModal}
          route={routeToEdit || {}}
          students={assignedStudents}
          stops={allStops}
          onSave={handleSaveAssigned}
        />
      )}
    </>
  );
}

export default QuanLyTuyenDuong;
