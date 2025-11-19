import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaPlus, FaEye, FaTrash, FaSearch, FaEdit, FaRoute, FaMapMarkerAlt, FaUserGraduate, FaRoad, FaClock } from 'react-icons/fa';
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

  const [query, setQuery] = useState('');

  const filteredRoutes = useMemo(() => {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return routes || [];
    return (routes || []).filter(r => {
      const name = (r.ten_tuyen_duong || r.name || '').toString().toLowerCase();
      const id = (r.id_tuyen_duong || r.id || '').toString().toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }, [routes, query]);

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

  // Calculate stats
  const totalRoutes = routes.length;
  const totalStops = routes.reduce((acc, r) => acc + (r.tuyen_duong_diem_dung?.length || 0), 0);
  const totalStudents = routes.reduce((acc, r) => acc + (r.phan_cong_hoc_sinh?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
      {/* Modals */}
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

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý tuyến đường</h1>
          <p className="text-gray-500 mt-1">Quản lý thông tin, lịch trình và phân công học sinh</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
        >
          <FaPlus className="text-sm" />
          <span>Tạo tuyến mới</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FaRoute size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng số tuyến</p>
            <p className="text-2xl font-bold text-gray-900">{totalRoutes}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FaMapMarkerAlt size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng điểm dừng</p>
            <p className="text-2xl font-bold text-gray-900">{totalStops}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <FaUserGraduate size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Học sinh được phân công</p>
            <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên hoặc ID tuyến..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Hiển thị {filteredRoutes.length} kết quả</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thông tin tuyến</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thống kê</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lộ trình</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredRoutes.map((route) => (
                <tr key={route.id_tuyen_duong} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg mt-1">
                        <FaRoute />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{route.ten_tuyen_duong}</div>
                        <div className="text-xs text-gray-500 mt-0.5">ID: {route.id_tuyen_duong}</div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-1 max-w-xs" title={route.mo_ta}>
                          {route.mo_ta || 'Chưa có mô tả'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaMapMarkerAlt className="text-emerald-500" size={14} />
                        <span className="font-medium">{route.tuyen_duong_diem_dung?.length || 0}</span>
                        <span className="text-gray-400">điểm dừng</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaUserGraduate className="text-purple-500" size={14} />
                        <span className="font-medium">{route.phan_cong_hoc_sinh?.length || 0}</span>
                        <span className="text-gray-400">học sinh</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaRoad className="text-gray-400" size={14} />
                        <span>{route.quang_duong ? `${route.quang_duong} m` : '---'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaClock className="text-gray-400" size={14} />
                        <span>{route.thoi_gian_du_kien ? `${route.thoi_gian_du_kien} phút` : '---'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleViewAssigned(route)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Xem danh sách học sinh"
                      >
                        <FaEye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(route)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa thông tin"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(route)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa tuyến đường"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRoutes.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="p-4 bg-gray-50 rounded-full mb-3">
                        <FaSearch size={24} />
                      </div>
                      <p className="text-lg font-medium text-gray-900">Không tìm thấy tuyến đường</p>
                      <p className="text-sm mt-1">Thử thay đổi từ khóa tìm kiếm hoặc tạo tuyến mới</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Pagination (Placeholder) */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Đang hiển thị tất cả {filteredRoutes.length} tuyến đường
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuanLyTuyenDuong;
