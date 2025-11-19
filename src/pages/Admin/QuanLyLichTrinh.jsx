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
                
                // Parse ngày từ API - chỉ lấy phần ngày để tránh lệch múi giờ
                const ngayStr = item.ngay.split('T')[0];
                
                return {
                    id_chuyen_di: item.id_chuyen_di,
                    id_tuyen_duong: item.id_tuyen_duong,
                    id_xe_buyt: item.id_xe_buyt,
                    id_tai_xe: item.id_tai_xe,
                    ngay_chay: ngayStr,
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

// Logic lịch tháng
const getMonthDays = () => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Ngày đầu tiên của tháng
  const firstDay = new Date(year, month, 1);
  
  // Tìm ngày bắt đầu hiển thị (Chủ nhật tuần trước nếu tháng không bắt đầu từ CN)
  const startDate = new Date(firstDay);
  const dayOfWeek = firstDay.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);
  
  // Tạo mảng 42 ngày (6 tuần x 7 ngày)
  const days = [];
  const currentDay = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }
  
  return { days, currentMonth: month, currentYear: year };
};

const changeMonth = (direction) => { 
  const newDate = new Date(currentDate); 
  newDate.setMonth(newDate.getMonth() + direction); 
  setCurrentDate(newDate); 
};

const goToToday = () => {
  setCurrentDate(new Date());
};

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

    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">Quản lý lịch trình</h1>
          <p className="text-sm md:text-base text-gray-600">Quản lý tất cả lịch trình xe buýt trong hệ thống</p>
        </div>
        <button 
          onClick={handleOpenAddModal} 
          className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 px-4 py-2 md:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm md:text-base"
        >
          <FaPlus /> <span>Tạo lịch trình</span>
        </button>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <FaSpinner className="animate-spin text-3xl md:text-4xl text-blue-500" />
          <span className="ml-3 text-sm md:text-base text-gray-600">Đang tải dữ liệu...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded mb-4 text-sm md:text-base">
          {error}
        </div>
      )}

      {/* Month Navigation */}
      {!loading && !error && (() => {
        const { days, currentMonth, currentYear } = getMonthDays();
        const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                           'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

        return (
          <>
            <div className="flex justify-between items-center mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
              <button 
                onClick={() => changeMonth(-1)} 
                className="p-2 rounded-full hover:bg-white/70 transition-colors touch-manipulation"
                aria-label="Tháng trước"
              >
                <FaChevronLeft className="text-indigo-600 text-sm md:text-base" />
              </button>
              <div className="flex items-center gap-3">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                  {monthNames[currentMonth]} • {currentYear}
                </h2>
                <button 
                  onClick={goToToday} 
                  className="px-3 py-1 text-xs md:text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Hôm nay
                </button>
              </div>
              <button 
                onClick={() => changeMonth(1)} 
                className="p-2 rounded-full hover:bg-white/70 transition-colors touch-manipulation"
                aria-label="Tháng sau"
              >
                <FaChevronRight className="text-indigo-600 text-sm md:text-base" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="flex-grow overflow-auto">
              <div className="min-w-[640px]">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                  {dayNames.map((dayName, idx) => (
                    <div 
                      key={dayName} 
                      className={`text-center font-bold text-sm md:text-base py-2 rounded-lg ${
                        idx === 0 ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {dayName}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {days.map((day, idx) => {
                    const isCurrentMonth = day.getMonth() === currentMonth;
                    // So sánh ngày theo local để tránh lệch múi giờ
                    const pad = n => n.toString().padStart(2, '0');
                    const dayStr = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
                    const daySchedules = schedules.filter(s => s.ngay_chay === dayStr);
                    const today = isToday(day);
                    const isSunday = day.getDay() === 0;
                    
                    return (
                      <div 
                        key={idx} 
                        className={`rounded-lg border-2 p-1.5 sm:p-2 flex flex-col min-h-[100px] md:min-h-[120px] transition-all ${
                          !isCurrentMonth 
                            ? 'bg-gray-100 border-gray-200 opacity-50' 
                            : today
                              ? 'bg-blue-50 border-blue-400 shadow-md'
                              : 'bg-white border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        {/* Ngày */}
                        <div className="text-right mb-1">
                          <span className={`inline-block font-bold text-sm md:text-base px-2 py-0.5 rounded ${
                            today 
                              ? 'bg-blue-600 text-white' 
                              : isSunday
                                ? 'text-red-600'
                                : isCurrentMonth 
                                  ? 'text-gray-800' 
                                  : 'text-gray-400'
                          }`}>
                            {day.getDate()}
                          </span>
                        </div>

                        {/* Danh sách lịch trình */}
                        <div className="space-y-1 overflow-y-auto flex-grow custom-scrollbar">
                          {isCurrentMonth && daySchedules.slice(0, 3).map(schedule => {
                            const statusConfig = {
                              cho_khoi_hanh: { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700' },
                              dang_di: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700' },
                              hoan_thanh: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700' },
                              da_huy: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700' },
                              bi_tre: { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-700' }
                            };
                            const status = statusConfig[schedule.trang_thai] || statusConfig.cho_khoi_hanh;

                            return (
                              <div
                                key={schedule.id_chuyen_di}
                                onClick={() => navigate(`/lichtrinh/${schedule.id_chuyen_di}`)}
                                className={`${status.bg} border-l-4 ${status.border} p-1.5 rounded text-xs cursor-pointer hover:shadow-md transition-all group`}
                                title={`${schedule.gio_khoi_hanh} - ${schedule.ten_tuyen_duong}\n${schedule.bien_so_xe} - ${schedule.ten_tai_xe}\n${schedule.so_hoc_sinh} học sinh`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`font-bold ${status.text}`}>{schedule.gio_khoi_hanh}</span>
                                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditModal(schedule);
                                      }} 
                                      className='p-0.5 bg-blue-500 text-white rounded hover:bg-blue-600'
                                      title="Sửa"
                                    >
                                      <FaEdit size={8} />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSchedule(schedule.id_chuyen_di);
                                      }} 
                                      className='p-0.5 bg-red-500 text-white rounded hover:bg-red-600'
                                      title="Xóa"
                                    >
                                      <FaTrash size={8} />
                                    </button>
                                  </div>
                                </div>
                                <p className={`${status.text} font-medium truncate text-[10px] mt-0.5`}>
                                  {schedule.ten_tuyen_duong}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5 text-[9px] text-gray-600">
                                  <FaBus size={8} />
                                  <span className="truncate">{schedule.bien_so_xe}</span>
                                </div>
                              </div>
                            );
                          })}
                          {isCurrentMonth && daySchedules.length > 3 && (
                            <div className="text-[10px] text-indigo-600 font-semibold text-center py-0.5">
                              +{daySchedules.length - 3} chuyến khác
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Chú thích */}
            <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-200">
              <div className="flex items-start md:items-center gap-3 md:gap-6 text-xs md:text-sm text-gray-600 flex-wrap">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-50 border-2 border-blue-400 rounded flex-shrink-0"></div>
                  <span>Hôm nay</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                  <span className="text-[10px] md:text-xs bg-yellow-100 text-yellow-700 border-l-4 border-yellow-400 px-1.5 md:px-2 py-0.5 md:py-1 rounded whitespace-nowrap">Chờ khởi hành</span>
                  <span className="text-[10px] md:text-xs bg-blue-100 text-blue-700 border-l-4 border-blue-400 px-1.5 md:px-2 py-0.5 md:py-1 rounded whitespace-nowrap">Đang đi</span>
                  <span className="text-[10px] md:text-xs bg-green-100 text-green-700 border-l-4 border-green-400 px-1.5 md:px-2 py-0.5 md:py-1 rounded whitespace-nowrap">Hoàn thành</span>
                </div>
                <p className="text-gray-500 w-full md:w-auto md:ml-auto text-xs md:text-sm mt-2 md:mt-0">
                  💡 <span className="italic">Nhấn vào lịch để xem chi tiết, hover để chỉnh sửa</span>
                </p>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  </>
);
}

export default QuanLyLichTrinh;