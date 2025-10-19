import React, { useState} from 'react';
import { FaPlus, FaTimes, FaEdit, FaTrash, FaBus, FaUserTie, FaChevronLeft, FaChevronRight, FaUsers, FaInfoCircle, FaRoute } from 'react-icons/fa';
import ReactMapGL, { Marker, Source, Layer } from '@goongmaps/goong-map-react';
import ScheduleModal from '../../components/ScheduleModal';
import ScheduleDetailModal from '../../components/ScheduleDetailModal';
// --- DỮ LIỆU MẪU (Đã cập nhật để hỗ trợ các tính năng mới) ---
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
const sampleBuses = [{ id_xe_buyt: 1, bien_so_xe: "51B-123.45" }, { id_xe_buyt: 2, bien_so_xe: "51C-678.90" }];
const sampleDrivers = [{ id_ngu_dung: 201, ho_ten: "Trần Văn Sáu" }, { id_ngu_dung: 202, ho_ten: "Lý Thị Bảy" }];
const sampleSchedules = [
  { id_lich_trinh: 1, id_tuyen_duong: 1, id_xe_buyt: 1, id_tai_xe: 201, ngay_chay: '2025-09-29', gio_khoi_hanh: '06:30', hoc_sinh_ids: [1, 2, 3] },
  { id_lich_trinh: 2, id_tuyen_duong: 2, id_xe_buyt: 2, id_tai_xe: 202, ngay_chay: '2025-09-29', gio_khoi_hanh: '07:00', hoc_sinh_ids: [4] },
];



// --- COMPONENT CHÍNH QUẢN LÝ LỊCH TRÌNH ---
function QuanLyLichTrinh() {
const [schedules, setSchedules] = useState(sampleSchedules);
const [isModalOpen, setIsModalOpen] = useState(false);
const [viewingSchedule, setViewingSchedule] = useState(null);
const [editingSchedule, setEditingSchedule] = useState(null); // State cho lịch trình đang sửa
const [currentDate, setCurrentDate] = useState(new Date('2025-09-29'));

// Dữ liệu lookup
const [routes] = useState(sampleRoutes);
const [buses] = useState(sampleBuses);
const [drivers] = useState(sampleDrivers);
const [allStudents] = useState(sampleStudents);

// Logic lịch tuần
const startOfWeek = new Date(currentDate);
startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1));
const weekDays = Array.from({ length: 7 }).map((_, i) => { const day = new Date(startOfWeek); day.setDate(day.getDate() + i); return day; });
const changeWeek = (direction) => { const newDate = new Date(currentDate); newDate.setDate(newDate.getDate() + (7 * direction)); setCurrentDate(newDate); };

const handleOpenAddModal = () => {
    setEditingSchedule(null); // Đảm bảo không có dữ liệu sửa
    setIsModalOpen(true);
};

const handleOpenEditModal = (schedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
};

const handleSaveSchedule = (data) => {
  if (Array.isArray(data)) { // Xử lý Thêm mới (trả về mảng)
      setSchedules(prev => [...prev, ...data]);
  } else { // Xử lý Sửa (trả về object)
      setSchedules(prev => prev.map(s => s.id_lich_trinh === data.id_lich_trinh ? data : s));
  }
  setIsModalOpen(false);
};

return (
  <>
    <ScheduleModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
      onSave={handleSaveSchedule}
      routes={routes} buses={buses} drivers={drivers}
      scheduleToEdit={editingSchedule}
    />
    {viewingSchedule && ( <ScheduleDetailModal schedule={viewingSchedule} onClose={() => setViewingSchedule(null)} allRoutes={routes} allStops={sampleStops} allStudents={allStudents} allBuses={buses} allDrivers={drivers}/> )}

    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý lịch trình</h1>
        <button onClick={handleOpenAddModal} className="btn-primary flex items-center gap-2">
          <FaPlus /> Tạo lịch trình
        </button>
      </div>
      <div className="flex justify-between items-center mb-4 p-2 bg-gray-50 rounded-lg">
          <button onClick={() => changeWeek(-1)} className="p-2 rounded-full hover:bg-gray-200"><FaChevronLeft/></button>
          <h2 className="text-lg font-semibold">Tuần {new Intl.DateTimeFormat('vi-VN', { month: '2-digit', day: '2-digit' }).format(startOfWeek)} - {new Intl.DateTimeFormat('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(weekDays[6])}</h2>
          <button onClick={() => changeWeek(1)} className="p-2 rounded-full hover:bg-gray-200"><FaChevronRight/></button>
      </div>
      <div className="flex-grow grid grid-cols-7 gap-2">
        {weekDays.map(day => {
          const daySchedules = schedules.filter(s => s.ngay_chay === day.toISOString().split('T')[0]);
          return (
            <div key={day.toISOString()} className="bg-gray-50 rounded-lg border p-2 flex flex-col">
              <p className="font-bold text-center mb-2">{day.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit' })}</p>
              <div className="space-y-2 overflow-y-auto">
                {daySchedules.map(schedule => {
                  const route = routes.find(r => r.id_tuyen_duong === schedule.id_tuyen_duong);
                  const bus = buses.find(b => b.id_xe_buyt === schedule.id_xe_buyt);
                  const driver = drivers.find(d => d.id_nguoi_dung === schedule.id_tai_xe);
                  return (
                    <div key={schedule.id_lich_trinh} className="bg-indigo-100 p-2 rounded-md text-xs text-indigo-800 relative group">
                      <div className='absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                         <button onClick={() => handleOpenEditModal(schedule)} className='p-1 bg-white/50 rounded hover:bg-white'><FaEdit/></button>
                         <button className='p-1 bg-white/50 rounded hover:bg-white'><FaTrash/></button>
                      </div>
                      <p className="font-bold cursor-pointer" onClick={() => setViewingSchedule(schedule)}>{schedule.gio_khoi_hanh} - {route?.ten_tuyen_duong}</p>
                      <p className='flex items-center gap-1'><FaBus size={10}/> {bus?.bien_so_xe}</p>
                      <p className='flex items-center gap-1'><FaUserTie size={10}/> {driver?.ho_ten}</p>
                      <p className='flex items-center gap-1 mt-1 text-gray-600'><FaUsers size={10}/> {schedule.hoc_sinh_ids?.length || 0} học sinh</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  </>
);
}

export default QuanLyLichTrinh;