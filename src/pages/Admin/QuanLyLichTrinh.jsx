import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaBus, FaUserTie, FaChevronLeft, FaChevronRight, FaUsers, FaRoute, FaSpinner } from 'react-icons/fa';
import ScheduleModal from '../../components/ScheduleModal';
import ChuyenDiService from '../../services/chuyenDiService';
// --- COMPONENT CHÍNH QUẢN LÝ LỊCH TRÌNH ---
function QuanLyLichTrinh() {
const [schedules, setSchedules] = useState([]);
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingSchedule, setEditingSchedule] = useState(null);
const [currentDate, setCurrentDate] = useState(new Date());
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const navigate = useNavigate();

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
                    id_chuyen_di: item.id_chuyen_di,
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

// Kiểm tra ngày hiện tại
const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const handleOpenAddModal = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
};

const handleOpenEditModal = (schedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
};

const handleSaveSchedule = () => {
  setIsModalOpen(false);
  fetchChuyenDi();
};

const handleDeleteSchedule = async (id) => {
  if (!window.confirm('Bạn có chắc chắn muốn xóa chuyến đi này?')) return;
  
  try {
      const response = await ChuyenDiService.deleteChuyenDi(id);
      
      if (response.success) {
          alert('Xóa chuyến đi thành công!');
          // Refresh data
          fetchChuyenDi();
      } else {
          alert(response.message || 'Không thể xóa chuyến đi. Vui lòng thử lại.');
      }
  } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể xóa chuyến đi. Vui lòng thử lại.';
      alert(errorMessage);
      // console.error(err);
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

    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý lịch trình</h1>
          <p className="text-gray-600">Quản lý tất cả lịch trình xe buýt trong hệ thống</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn-primary flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
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
          <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
            <button 
              onClick={() => changeWeek(-1)} 
              className="p-2 rounded-full hover:bg-white/70 transition-colors"
            >
              <FaChevronLeft className="text-indigo-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              Tuần {new Intl.DateTimeFormat('vi-VN', { month: '2-digit', day: '2-digit' }).format(startOfWeek)} - {new Intl.DateTimeFormat('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(weekDays[6])}
            </h2>
            <button 
              onClick={() => changeWeek(1)} 
              className="p-2 rounded-full hover:bg-white/70 transition-colors"
            >
              <FaChevronRight className="text-indigo-600" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="flex-grow grid grid-cols-7 gap-3">
            {weekDays.map(day => {
              const daySchedules = schedules.filter(s => s.ngay_chay === day.toISOString().split('T')[0]);
              const today = isToday(day);
              
              return (
                <div 
                  key={day.toISOString()} 
                  className={`rounded-lg border-2 p-3 flex flex-col transition-all ${
                    today
                      ? 'bg-indigo-50 border-indigo-400 shadow-md'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {/* Ngày */}
                  <div className={`text-center mb-3 pb-2 border-b-2 ${
                    today ? 'border-indigo-400' : 'border-gray-300'
                  }`}>
                    <p className={`font-bold text-sm ${today ? 'text-indigo-700' : 'text-gray-700'}`}>
                      {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                    </p>
                    <p className={`text-xl font-bold ${today ? 'text-indigo-600' : 'text-gray-800'}`}>
                      {day.getDate()}
                    </p>
                    {today && (
                      <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full mt-1 inline-block">
                        Hôm nay
                      </span>
                    )}
                  </div>

                  {/* Danh sách lịch trình */}
                  <div className="space-y-2 overflow-y-auto flex-grow">
                    {daySchedules.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center mt-4">Không có chuyến đi</p>
                    ) : (
                      daySchedules.map(schedule => {
                        // Màu theo trạng thái
                        const statusConfig = {
                          cho_khoi_hanh: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ khởi hành' },
                          dang_di: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đang đi' },
                          hoan_thanh: { bg: 'bg-green-100', text: 'text-green-700', label: 'Hoàn thành' },
                          da_huy: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy' },
                          bi_tre: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Bị trễ' }
                        };
                        const status = statusConfig[schedule.trang_thai] || statusConfig.cho_khoi_hanh;

                        return (
                          <div
                            key={schedule.id_chuyen_di}
                            className="bg-white border-2 border-indigo-200 p-3 rounded-lg text-xs hover:shadow-lg hover:border-indigo-400 transition-all group relative"
                          >
                            {/* Nút sửa/xóa */}
                            <div className='absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10'>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditModal(schedule);
                                }} 
                                className='p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
                                title="Sửa"
                              >
                                <FaEdit size={10} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSchedule(schedule.id_chuyen_di);
                                }} 
                                className='p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
                                title="Xóa"
                              >
                                <FaTrash size={10} />
                              </button>
                            </div>

                            {/* Nội dung */}
                            <div onClick={() => navigate(`/lichtrinh/${schedule.id_chuyen_di}`)} className="cursor-pointer">
                              {/* Giờ khởi hành và trạng thái */}
                              <div className="flex items-center justify-between mb-2 pr-12">
                                <span className="text-lg font-bold text-indigo-600">
                                  {schedule.gio_khoi_hanh}
                                </span>
                                <span className={`text-xs ${status.bg} ${status.text} px-2 py-1 rounded-full font-medium`}>
                                  {status.label}
                                </span>
                              </div>

                              {/* Tên tuyến */}
                              <p className="font-bold text-gray-800 mb-2 flex items-start gap-1 group-hover:text-indigo-600 transition-colors">
                                <FaRoute className="mt-0.5 flex-shrink-0" size={12} />
                                <span className="line-clamp-2">{schedule.ten_tuyen_duong}</span>
                              </p>

                              {/* Thông tin xe và tài xế */}
                              <div className="space-y-1 text-gray-600">
                                <p className="flex items-center gap-2">
                                  <FaBus size={11} className="text-blue-500" />
                                  <span className="font-medium">{schedule.bien_so_xe}</span>
                                </p>

                                <p className="flex items-center gap-2">
                                  <FaUserTie size={11} className="text-purple-500" />
                                  <span className="truncate">{schedule.ten_tai_xe}</span>
                                </p>

                                {/* Số học sinh */}
                                <p className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                                  <FaUsers size={11} className="text-orange-500" />
                                  <span className="font-semibold text-orange-600">
                                    {schedule.so_hoc_sinh} học sinh
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chú thích */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-50 border-2 border-indigo-400 rounded"></div>
                <span>Hôm nay</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded"></div>
                <span>Ngày khác</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Chờ khởi hành</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Đang đi</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Hoàn thành</span>
              </div>
              <p className="text-gray-500 ml-auto">
                💡 <span className="italic">Hover để chỉnh sửa, nhấn vào lịch để xem chi tiết</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  </>
);
}

export default QuanLyLichTrinh;