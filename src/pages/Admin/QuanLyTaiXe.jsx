import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaCalendarAlt, FaUserTie, FaIdCard, FaPhone, FaUserCheck, FaUserTimes, FaSpinner } from 'react-icons/fa';
import DriverModal from '../../components/DriverModal';
import ReplaceDriverModal from '../../components/ReplaceDriverModal';
import DriverScheduleModal from '../../components/DriverScheduleModal';
import taiXeService from '../../services/taiXeService';

// Component huy hiệu trạng thái
const StatusBadge = ({ status }) => {
  const isActive = status === 'Đang hoạt động';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
      isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
      {status}
    </span>
  );
};

function QuanLyTaiXe() {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [replaceTrips, setReplaceTrips] = useState([]);
  const [pendingDeleteDriver, setPendingDeleteDriver] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDriverForSchedule, setSelectedDriverForSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await taiXeService.getAll();
      if (res && res.success) {
        setDrivers(res.data || []);
      } else {
        setError(res?.message || 'Không thể lấy danh sách tài xế');
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải danh sách tài xế');
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = useMemo(() => 
    drivers.filter(driver => 
      (driver.ho_ten || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [drivers, searchTerm]);

  const handleOpenCreate = () => {
    setEditingDriver(null);
    setIsModalOpen(true);
  };

  const handleSaveDriver = async (payload) => {
    try {
      if (payload.id_nguoi_dung) {
        const res = await taiXeService.update(payload.id_nguoi_dung, payload);
        if (res && res.success) {
          setDrivers(prev => prev.map(d => d.id_nguoi_dung === payload.id_nguoi_dung ? res.data : d));
          setIsModalOpen(false);
          setEditingDriver(null);
        } else {
          alert(res?.message || res?.error || 'Cập nhật thất bại');
        }
      } else {
        const res = await taiXeService.create(payload);
        if (res && res.success) {
          setDrivers(prev => [res.data, ...prev]);
          setIsModalOpen(false);
        } else {
          alert(res?.message || res?.error || 'Tạo tài xế thất bại');
        }
      }
    } catch (err) {
      console.error('Error saving driver:', err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Lỗi khi lưu tài xế';
      alert(msg);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setIsModalOpen(true);
  };

  const handleDelete = async (driver) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài xế này không?')) return;
    try {
      const res = await taiXeService.delete(driver.id_nguoi_dung);
      if (res && res.success) {
        setDrivers(prev => prev.filter(d => d.id_nguoi_dung !== driver.id_nguoi_dung));
      } else if (res && res.code === 'HAS_TRIPS') {
        // Open modal to choose replacement
        setReplaceTrips(res.data || []);
        setPendingDeleteDriver(driver);
        setIsReplaceModalOpen(true);
      } else {
        alert(res?.message || 'Xóa thất bại');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa tài xế');
    }
  };

  const handleConfirmReplaceAndDelete = async (replacementId) => {
    if (!pendingDeleteDriver) return;
    try {
      const res = await taiXeService.delete(pendingDeleteDriver.id_nguoi_dung, replacementId);
      if (res && res.success) {
        // remove deleted driver from list
        setDrivers(prev => prev.filter(d => d.id_nguoi_dung !== pendingDeleteDriver.id_nguoi_dung));
        setIsReplaceModalOpen(false);
        setPendingDeleteDriver(null);
        setReplaceTrips([]);
      } else {
        alert(res?.message || 'Xóa thất bại');
      }
    } catch (err) {
      console.error('Error confirming replace and delete', err);
      alert('Lỗi khi chuyển và xóa tài xế');
    }
  };

  const handleViewSchedule = (driver) => {
    setSelectedDriverForSchedule(driver);
    setIsScheduleModalOpen(true);
  };

  // Calculate stats
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter(d => d.trang_thai === 'Đang hoạt động').length;
  const inactiveDrivers = totalDrivers - activeDrivers;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
      <DriverModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingDriver(null); }} 
        onSave={handleSaveDriver}
        editingDriver={editingDriver}
      />

      <ReplaceDriverModal
        isOpen={isReplaceModalOpen}
        onClose={() => { setIsReplaceModalOpen(false); setPendingDeleteDriver(null); setReplaceTrips([]); }}
        trips={replaceTrips}
        candidates={drivers.filter(d => pendingDeleteDriver ? d.id_nguoi_dung !== pendingDeleteDriver.id_nguoi_dung : true)}
        onConfirm={handleConfirmReplaceAndDelete}
        deletingDriver={pendingDeleteDriver}
      />

      <DriverScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => { setIsScheduleModalOpen(false); setSelectedDriverForSchedule(null); }}
        driver={selectedDriverForSchedule}
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý tài xế</h1>
          <p className="text-gray-500 mt-1">Quản lý thông tin, trạng thái và lịch trình tài xế</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
        >
          <FaPlus className="text-sm" />
          <span>Thêm tài xế</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FaUserTie size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng số tài xế</p>
            <p className="text-2xl font-bold text-gray-900">{totalDrivers}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FaUserCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Đang hoạt động</p>
            <p className="text-2xl font-bold text-gray-900">{activeDrivers}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <FaUserTimes size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tạm ngưng/Khác</p>
            <p className="text-2xl font-bold text-gray-900">{inactiveDrivers}</p>
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
              type="text"
              placeholder="Tìm kiếm theo tên tài xế..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Hiển thị {filteredDrivers.length} kết quả</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FaSpinner className="animate-spin text-indigo-600 text-3xl mb-3" />
            <p className="text-gray-500 font-medium">Đang tải danh sách tài xế...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 bg-red-50 text-red-500 rounded-full mb-3">
              <FaUserTimes size={24} />
            </div>
            <p className="text-red-600 font-medium mb-2">{error}</p>
            <button
              onClick={fetchDrivers}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thông tin tài xế</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Liên hệ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <div className="p-4 bg-gray-50 rounded-full mb-3">
                          <FaSearch size={24} />
                        </div>
                        <p className="text-lg font-medium text-gray-900">Không tìm thấy tài xế</p>
                        <p className="text-sm mt-1">Thử thay đổi từ khóa tìm kiếm hoặc thêm tài xế mới</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => (
                    <tr key={driver.id_nguoi_dung} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg mt-1">
                            <FaUserTie />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{driver.ho_ten}</div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                              <FaIdCard size={10} />
                              <span>ID: {driver.id_nguoi_dung}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              @{driver.ten_tai_khoan}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaPhone className="text-gray-400" size={14} />
                          <span className="font-medium">{driver.so_dien_thoai}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={driver.trang_thai || 'Đang hoạt động'} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleViewSchedule(driver)}
                            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" 
                            title="Xem lịch trình"
                          >
                            <FaCalendarAlt size={18} />
                          </button>
                          <button 
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Sửa thông tin" 
                            onClick={() => handleEdit(driver)}
                          >
                            <FaEdit size={18} />
                          </button>
                          <button 
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Xóa tài xế" 
                            onClick={() => handleDelete(driver)}
                          >
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuanLyTaiXe;