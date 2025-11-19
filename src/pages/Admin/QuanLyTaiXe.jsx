import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import DriverModal from '../../components/DriverModal';
import ReplaceDriverModal from '../../components/ReplaceDriverModal';
import taiXeService from '../../services/taiXeService';

// Component huy hiệu trạng thái
const StatusBadge = ({ status }) => {
  const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
  let specificClasses = status === 'Đang hoạt động' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
  return <span className={`${baseClasses} ${specificClasses}`}>{status}</span>;
};

function QuanLyTaiXe() {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [replaceTrips, setReplaceTrips] = useState([]);
  const [pendingDeleteDriver, setPendingDeleteDriver] = useState(null);
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

  return (
    <>
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

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý tài xế</h1>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          >
            <FaPlus />
            Thêm tài xế
          </button>
        </div>

        <div className="relative mb-4">
          <input 
            type="text"
            placeholder="Tìm kiếm theo tên tài xế..."
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Đang tải danh sách tài xế...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchDrivers}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Họ và Tên</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Tên tài khoản</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Số điện thoại</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      {searchTerm ? 'Không tìm thấy tài xế nào phù hợp' : 'Chưa có tài xế nào'}
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => (
                    <tr key={driver.id_nguoi_dung} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">{driver.id_nguoi_dung}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{driver.ho_ten}</td>
                      <td className="py-3 px-4 text-gray-700">{driver.ten_tai_khoan}</td>
                      <td className="py-3 px-4 text-gray-700">{driver.so_dien_thoai}</td>
                      <td className="py-3 px-4"><StatusBadge status={driver.trang_thai || 'Đang hoạt động'} /></td>
                      <td className="py-3 px-4 flex gap-3">
                        <button className="text-purple-500 hover:text-purple-700" title="Xem lịch trình">
                          <FaCalendarAlt size={18} />
                        </button>
                        <button className="text-blue-500 hover:text-blue-700" title="Sửa" onClick={() => handleEdit(driver)}>
                          <FaEdit size={18} />
                        </button>
                        <button className="text-red-500 hover:text-red-700" title="Xóa" onClick={() => handleDelete(driver)}>
                          <FaTrash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default QuanLyTaiXe;