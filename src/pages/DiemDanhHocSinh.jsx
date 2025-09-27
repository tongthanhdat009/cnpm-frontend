import React, { useState } from 'react';
import { FaBus, FaCheck, FaTimes, FaUserClock } from 'react-icons/fa';

// --- DỮ LIỆU MẪU (Mô phỏng dữ liệu cho một chuyến đi cụ thể của tài xế) ---
const sampleTripData = {
  id_chuyen_di: 101,
  ten_tuyen_duong: 'Tuyến Quận 1 - Bình Thạnh',
  bien_so_xe: '51B-123.45',
  loai_chuyen: 'Buổi sáng - Đón học sinh',
  stops: [
    {
      id_diem_dung: 3,
      ten_diem_dung: 'Ngã tư Hàng Xanh',
      students: [
        { id_hoc_sinh: 3, ho_ten: 'Lê Văn Cường', trang_thai: 'chua_diem_danh' },
      ]
    },
    {
      id_diem_dung: 2,
      ten_diem_dung: 'Nhà văn hóa Thanh Niên',
      students: [
        { id_hoc_sinh: 1, ho_ten: 'Nguyễn Văn An', trang_thai: 'chua_diem_danh' },
        { id_hoc_sinh: 2, ho_ten: 'Trần Thị Bích', trang_thai: 'chua_diem_danh' },
      ]
    }
  ]
};
// --- KẾT THÚC DỮ LIỆU MẪU ---

function DiemDanhHocSinh() {
  const [trip, setTrip] = useState(sampleTripData);

  const handleAttendance = (stopId, studentId, status) => {
    setTrip(prevTrip => {
      const newStops = prevTrip.stops.map(stop => {
        if (stop.id_diem_dung === stopId) {
          const newStudents = stop.students.map(student => {
            if (student.id_hoc_sinh === studentId) {
              return { ...student, trang_thai: status };
            }
            return student;
          });
          return { ...stop, students: newStudents };
        }
        return stop;
      });
      return { ...prevTrip, stops: newStops };
    });
  };

  const getStatusInfo = (status) => {
      switch(status) {
          case 'da_don': return { text: 'Đã đón', color: 'bg-green-500', icon: <FaCheck/> };
          case 'vang_mat': return { text: 'Vắng mặt', color: 'bg-red-500', icon: <FaTimes/> };
          default: return { text: 'Chờ điểm danh', color: 'bg-gray-400', icon: <FaUserClock/> };
      }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      {/* Header thông tin chuyến đi */}
      <div className="pb-4 border-b mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Điểm danh học sinh</h1>
        <div className="flex items-center gap-4 mt-2 text-gray-600">
            <FaBus className="text-indigo-600"/>
            <span>{trip.ten_tuyen_duong} - {trip.bien_so_xe}</span>
            <span className="font-semibold text-indigo-600">{trip.loai_chuyen}</span>
        </div>
      </div>

      {/* Danh sách các trạm và học sinh */}
      <div className="flex-grow overflow-y-auto pr-2 space-y-6">
        {trip.stops.map(stop => (
          <div key={stop.id_diem_dung}>
            <h2 className="text-lg font-bold text-gray-700 border-l-4 border-indigo-500 pl-3 mb-3">
              Trạm: {stop.ten_diem_dung}
            </h2>
            <div className="space-y-3">
              {stop.students.map(student => {
                const statusInfo = getStatusInfo(student.trang_thai);
                return (
                  <div key={student.id_hoc_sinh} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm">
                    {/* Thông tin học sinh và trạng thái */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${statusInfo.color}`}>
                        {statusInfo.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{student.ho_ten}</p>
                        <p className={`text-sm font-medium ${statusInfo.color.replace('bg', 'text')}`}>{statusInfo.text}</p>
                      </div>
                    </div>
                    {/* Nút điểm danh */}
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleAttendance(stop.id_diem_dung, student.id_hoc_sinh, 'da_don')}
                            disabled={student.trang_thai === 'da_don'}
                            className="px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg shadow-sm hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Đã đón
                        </button>
                        <button 
                            onClick={() => handleAttendance(stop.id_diem_dung, student.id_hoc_sinh, 'vang_mat')}
                            disabled={student.trang_thai === 'vang_mat'}
                            className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg shadow-sm hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Vắng
                        </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DiemDanhHocSinh;