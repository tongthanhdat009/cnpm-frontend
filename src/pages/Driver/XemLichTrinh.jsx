import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaBus, FaUserTie, FaUsers, FaRoute, FaMapMarkerAlt } from 'react-icons/fa';
import ScheduleDetailModal from '../../components/ScheduleDetailModal';

// --- DỮ LIỆU MẪU ---
const sampleStudents = [
  { id_hoc_sinh: 1, ho_ten: 'Nguyễn Văn An', quan: 'Quận 1' },
  { id_hoc_sinh: 2, ho_ten: 'Trần Thị Bích', quan: 'Quận 1' },
  { id_hoc_sinh: 3, ho_ten: 'Lê Văn Cường', quan: 'Bình Thạnh' },
  { id_hoc_sinh: 4, ho_ten: 'Phạm Thị Dung', quan: 'Phú Nhuận' },
];

const sampleRoutes = [
  { id_tuyen_duong: 1, ten_tuyen_duong: 'Tuyến Quận 1 - Bình Thạnh', quan: ['Quận 1', 'Bình Thạnh'], diem_dung_ids: [1, 2, 3] },
  { id_tuyen_duong: 2, ten_tuyen_duong: 'Tuyến Phú Nhuận', quan: ['Phú Nhuận'], diem_dung_ids: [1, 4] },
];

const sampleStops = [
  { id_diem_dung: 1, ten_diem_dung: 'Trường THCS A', vi_do: 10.7769, kinh_do: 106.7008 },
  { id_diem_dung: 2, ten_diem_dung: 'Nhà văn hóa Thanh Niên', vi_do: 10.7820, kinh_do: 106.6950 },
  { id_diem_dung: 3, ten_diem_dung: 'Ngã tư Hàng Xanh', vi_do: 10.8010, kinh_do: 106.7090 },
  { id_diem_dung: 4, ten_diem_dung: 'Công viên Gia Định', vi_do: 10.8150, kinh_do: 106.6780 },
];

const sampleBuses = [
  { id_xe_buyt: 1, bien_so_xe: "51B-123.45" }, 
  { id_xe_buyt: 2, bien_so_xe: "51C-678.90" }
];

const sampleDrivers = [
  { id_nguoi_dung: 201, ho_ten: "Trần Văn Sáu" }, 
  { id_nguoi_dung: 202, ho_ten: "Lý Thị Bảy" }
];

const sampleSchedules = [
  { id_lich_trinh: 1, id_tuyen_duong: 1, id_xe_buyt: 1, id_tai_xe: 201, ngay_chay: '2025-10-20', gio_khoi_hanh: '06:30', hoc_sinh_ids: [1, 2, 3] },
  { id_lich_trinh: 2, id_tuyen_duong: 2, id_xe_buyt: 2, id_tai_xe: 202, ngay_chay: '2025-10-20', gio_khoi_hanh: '07:00', hoc_sinh_ids: [4] },
  { id_lich_trinh: 3, id_tuyen_duong: 1, id_xe_buyt: 1, id_tai_xe: 201, ngay_chay: '2025-10-21', gio_khoi_hanh: '06:30', hoc_sinh_ids: [1, 2] },
  { id_lich_trinh: 4, id_tuyen_duong: 1, id_xe_buyt: 1, id_tai_xe: 201, ngay_chay: '2025-10-22', gio_khoi_hanh: '06:30', hoc_sinh_ids: [1, 2, 3] },
  { id_lich_trinh: 5, id_tuyen_duong: 1, id_xe_buyt: 1, id_tai_xe: 201, ngay_chay: '2025-10-23', gio_khoi_hanh: '06:30', hoc_sinh_ids: [1, 3] },
];

// --- COMPONENT CHÍNH XEM LỊCH TRÌNH (READONLY) ---
function XemLichTrinh() {
  const [viewingSchedule, setViewingSchedule] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Dữ liệu lookup
  const [schedules] = useState(sampleSchedules);
  const [routes] = useState(sampleRoutes);
  const [buses] = useState(sampleBuses);
  const [drivers] = useState(sampleDrivers);
  const [allStudents] = useState(sampleStudents);

  // TODO: Lọc lịch trình theo tài xế đang đăng nhập
  // const currentDriverId = 201; // ID tài xế đăng nhập
  // const driverSchedules = schedules.filter(s => s.id_tai_xe === currentDriverId);

  // Logic lịch tuần
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1));
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(day.getDate() + i);
    return day;
  });

  const changeWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (7 * direction));
    setCurrentDate(newDate);
  };

  // Kiểm tra ngày hiện tại
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <>
      {/* Modal chi tiết lịch trình */}
      {viewingSchedule && (
        <ScheduleDetailModal
          schedule={viewingSchedule}
          onClose={() => setViewingSchedule(null)}
          allRoutes={routes}
          allStops={sampleStops}
          allStudents={allStudents}
          allBuses={buses}
          allDrivers={drivers}
        />
      )}

      <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Lịch trình của tôi</h1>
          <p className="text-gray-600">Xem lịch trình làm việc trong tuần</p>
        </div>

        {/* Điều hướng tuần */}
        <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
          <button
            onClick={() => changeWeek(-1)}
            className="p-2 rounded-full hover:bg-white/70 transition-colors"
          >
            <FaChevronLeft className="text-indigo-600" />
          </button>
          
          <h2 className="text-lg font-semibold text-gray-800">
            Tuần {new Intl.DateTimeFormat('vi-VN', { month: '2-digit', day: '2-digit' }).format(startOfWeek)} 
            {' - '}
            {new Intl.DateTimeFormat('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(weekDays[6])}
          </h2>
          
          <button
            onClick={() => changeWeek(1)}
            className="p-2 rounded-full hover:bg-white/70 transition-colors"
          >
            <FaChevronRight className="text-indigo-600" />
          </button>
        </div>

        {/* Lịch tuần */}
        <div className="flex-grow grid grid-cols-7 gap-3">
          {weekDays.map(day => {
            const daySchedules = schedules.filter(
              s => s.ngay_chay === day.toISOString().split('T')[0]
            );
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
                    <p className="text-xs text-gray-400 text-center mt-4">Không có lịch</p>
                  ) : (
                    daySchedules.map(schedule => {
                      const route = routes.find(r => r.id_tuyen_duong === schedule.id_tuyen_duong);
                      const bus = buses.find(b => b.id_xe_buyt === schedule.id_xe_buyt);
                      const driver = drivers.find(d => d.id_nguoi_dung === schedule.id_tai_xe);

                      return (
                        <div
                          key={schedule.id_lich_trinh}
                          onClick={() => setViewingSchedule(schedule)}
                          className="bg-white border-2 border-indigo-200 p-3 rounded-lg text-xs hover:shadow-lg hover:border-indigo-400 cursor-pointer transition-all group"
                        >
                          {/* Giờ khởi hành */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-indigo-600">
                              {schedule.gio_khoi_hanh}
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Hoạt động
                            </span>
                          </div>

                          {/* Tên tuyến */}
                          <p className="font-bold text-gray-800 mb-2 flex items-start gap-1 group-hover:text-indigo-600 transition-colors">
                            <FaRoute className="mt-0.5 flex-shrink-0" size={12} />
                            <span className="line-clamp-2">{route?.ten_tuyen_duong}</span>
                          </p>

                          {/* Thông tin xe */}
                          <div className="space-y-1 text-gray-600">
                            <p className="flex items-center gap-2">
                              <FaBus size={11} className="text-blue-500" />
                              <span className="font-medium">{bus?.bien_so_xe}</span>
                            </p>

                            {/* Thông tin tài xế */}
                            <p className="flex items-center gap-2">
                              <FaUserTie size={11} className="text-purple-500" />
                              <span className="truncate">{driver?.ho_ten}</span>
                            </p>

                            {/* Số học sinh */}
                            <p className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                              <FaUsers size={11} className="text-orange-500" />
                              <span className="font-semibold text-orange-600">
                                {schedule.hoc_sinh_ids?.length || 0} học sinh
                              </span>
                            </p>
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
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-indigo-50 border-2 border-indigo-400 rounded"></div>
              <span>Hôm nay</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded"></div>
              <span>Ngày khác</span>
            </div>
            <p className="text-gray-500 ml-auto">
              💡 <span className="italic">Nhấn vào lịch trình để xem chi tiết</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default XemLichTrinh;
