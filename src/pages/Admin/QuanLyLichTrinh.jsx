import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaEdit, FaTrash, FaBus, FaUserTie, FaChevronLeft, FaChevronRight, FaUsers, FaInfoCircle, FaRoute, FaSpinner } from 'react-icons/fa';
import ReactMapGL, { Marker, Source, Layer } from '@goongmaps/goong-map-react';
import ScheduleModal from '../../components/ScheduleModal';
import ScheduleDetailModal from '../../components/ScheduleDetailModal';
import ChuyenDiService from '../../services/chuyenDiService';

// --- COMPONENT CHÍNH QUẢN LÝ LỊCH TRÌNH ---
function QuanLyLichTrinh() {
const [schedules, setSchedules] = useState([]);
const [isModalOpen, setIsModalOpen] = useState(false);
const [viewingSchedule, setViewingSchedule] = useState(null);
const [editingSchedule, setEditingSchedule] = useState(null);
const [currentDate, setCurrentDate] = useState(new Date());
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// Fetch dữ liệu chuyến đi từ API
useEffect(() => {
    fetchChuyenDi();
}, []);

const fetchChuyenDi = async () => {
    try {
        setLoading(true);
        setError(null);
        const response = await ChuyenDiService.getAllChuyenDi();
        
        if (response.success) {
            // Chuyển đổi dữ liệu từ API sang format của component
            const formattedSchedules = response.data.map(item => {
                // Parse giờ khởi hành từ ISO string
                // Lấy UTC time để tránh lệch múi giờ
                const gioKhoiHanhDate = new Date(item.gio_khoi_hanh);
                const gio = String(gioKhoiHanhDate.getUTCHours()).padStart(2, '0');
                const phut = String(gioKhoiHanhDate.getUTCMinutes()).padStart(2, '0');
                
                return {
                    id_lich_trinh: item.id_chuyen_di,
                    id_tuyen_duong: item.id_tuyen_duong,
                    id_xe_buyt: item.id_xe_buyt,
                    id_tai_xe: item.id_tai_xe,
                    ngay_chay: new Date(item.ngay).toISOString().split('T')[0],
                    gio_khoi_hanh: `${gio}:${phut}`,
                    loai_chuyen_di: item.loai_chuyen_di,
                    trang_thai: item.trang_thai,
                    // Đếm số học sinh từ diem_danh_chuyen_di
                    so_hoc_sinh: item.diem_danh_chuyen_di?.length || 0,
                    hoc_sinh_ids: item.diem_danh_chuyen_di?.map(dd => dd.id_hoc_sinh) || [],
                    // Lưu thêm thông tin chi tiết
                    ten_tuyen_duong: item.tuyen_duong?.ten_tuyen_duong || 'Chưa có tuyến',
                    bien_so_xe: item.xe_buyt?.bien_so_xe || 'Chưa có xe',
                    ten_tai_xe: item.nguoi_dung?.ho_ten || 'Chưa có tài xế',
                    diem_danh_chuyen_di: item.diem_danh_chuyen_di
                };
            });
            
            setSchedules(formattedSchedules);
        }
    } catch (err) {
        console.error('Error fetching chuyen di:', err);
        setError('Không thể tải dữ liệu chuyến đi. Vui lòng thử lại.');
    } finally {
        setLoading(false);
    }
};

// Logic lịch tuần
const startOfWeek = new Date(currentDate);
startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1));
const weekDays = Array.from({ length: 7 }).map((_, i) => { const day = new Date(startOfWeek); day.setDate(day.getDate() + i); return day; });
const changeWeek = (direction) => { const newDate = new Date(currentDate); newDate.setDate(newDate.getDate() + (7 * direction)); setCurrentDate(newDate); };

const handleOpenAddModal = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
};

const handleOpenEditModal = (schedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
};

const handleSaveSchedule = (data) => {
  if (Array.isArray(data)) {
      setSchedules(prev => [...prev, ...data]);
  } else {
      setSchedules(prev => prev.map(s => s.id_lich_trinh === data.id_lich_trinh ? data : s));
  }
  setIsModalOpen(false);
  // Refresh data từ API
  fetchChuyenDi();
};

const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chuyến đi này?')) return;
    
    try {
        await ChuyenDiService.deleteChuyenDi(id);
        // Refresh data
        fetchChuyenDi();
    } catch (err) {
        alert('Không thể xóa chuyến đi. Vui lòng thử lại.');
        console.error(err);
    }
};

return (
  <>
    <ScheduleModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
      onSave={handleSaveSchedule}
      scheduleToEdit={editingSchedule}
    />
    {viewingSchedule && ( 
      <ScheduleDetailModal 
        schedule={viewingSchedule} 
        onClose={() => setViewingSchedule(null)} 
      /> 
    )}

    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý lịch trình</h1>
        <button onClick={handleOpenAddModal} className="btn-primary flex items-center gap-2">
          <FaPlus /> Tạo lịch trình
        </button>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
          <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Week Navigation */}
      {!loading && !error && (
        <>
          <div className="flex justify-between items-center mb-4 p-2 bg-gray-50 rounded-lg">
            <button onClick={() => changeWeek(-1)} className="p-2 rounded-full hover:bg-gray-200"><FaChevronLeft/></button>
            <h2 className="text-lg font-semibold">
              Tuần {new Intl.DateTimeFormat('vi-VN', { month: '2-digit', day: '2-digit' }).format(startOfWeek)} - {new Intl.DateTimeFormat('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(weekDays[6])}
            </h2>
            <button onClick={() => changeWeek(1)} className="p-2 rounded-full hover:bg-gray-200"><FaChevronRight/></button>
          </div>

          {/* Calendar Grid */}
          <div className="flex-grow grid grid-cols-7 gap-2">
            {weekDays.map(day => {
              const daySchedules = schedules.filter(s => s.ngay_chay === day.toISOString().split('T')[0]);
              return (
                <div key={day.toISOString()} className="bg-gray-50 rounded-lg border p-2 flex flex-col">
                  <p className="font-bold text-center mb-2">
                    {day.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit' })}
                  </p>
                  <div className="space-y-2 overflow-y-auto">
                    {daySchedules.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">Không có chuyến đi</p>
                    )}
                    {daySchedules.map(schedule => {
                      // Màu theo trạng thái
                      const statusColors = {
                        cho_khoi_hanh: 'bg-yellow-100 text-yellow-800',
                        dang_di: 'bg-blue-100 text-blue-800',
                        hoan_thanh: 'bg-green-100 text-green-800',
                        da_huy: 'bg-red-100 text-red-800',
                        bi_tre: 'bg-orange-100 text-orange-800'
                      };
                      const colorClass = statusColors[schedule.trang_thai] || 'bg-indigo-100 text-indigo-800';

                      return (
                        <div key={schedule.id_lich_trinh} className={`${colorClass} p-2 rounded-md text-xs relative group`}>
                          <div className='absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <button 
                              onClick={() => handleOpenEditModal(schedule)} 
                              className='p-1 bg-white/50 rounded hover:bg-white'
                              title="Sửa"
                            >
                              <FaEdit/>
                            </button>
                            <button 
                              onClick={() => handleDeleteSchedule(schedule.id_lich_trinh)} 
                              className='p-1 bg-white/50 rounded hover:bg-white'
                              title="Xóa"
                            >
                              <FaTrash/>
                            </button>
                          </div>
                          <p className="font-bold cursor-pointer" onClick={() => setViewingSchedule(schedule)}>
                            {schedule.gio_khoi_hanh} - {schedule.ten_tuyen_duong}
                          </p>
                          <p className='flex items-center gap-1'><FaBus size={10}/> {schedule.bien_so_xe}</p>
                          <p className='flex items-center gap-1'><FaUserTie size={10}/> {schedule.ten_tai_xe}</p>
                          <p className='flex items-center gap-1 mt-1 text-gray-600'>
                            <FaUsers size={10}/> {schedule.so_hoc_sinh} học sinh
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  </>
);
}

export default QuanLyLichTrinh;