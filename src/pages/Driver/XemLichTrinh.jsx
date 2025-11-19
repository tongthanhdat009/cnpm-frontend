import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaBus, FaUsers, FaRoute, FaSpinner, FaClock, FaCalendarAlt, FaHistory } from 'react-icons/fa';
import ChuyenDiService from '../../services/chuyenDiService';
import ActiveTripModal from '../../components/ActiveTripModal';

function XemLichTrinh() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);
  const [viewMode, setViewMode] = useState('current'); // 'current', 'upcoming', 'past'
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showActiveTripModal, setShowActiveTripModal] = useState(false);
  const [activeTripId, setActiveTripId] = useState(null);

  useEffect(() => {
    const fetchDriverSchedules = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (!userData.id_nguoi_dung) {
          setError('Không tìm thấy thông tin tài xế');
          return;
        }

        const response = await ChuyenDiService.getChuyenDiByTaiXe(userData.id_nguoi_dung);
        
        if (response?.success) {
          const trips = response.data || [];
          const now = new Date();
          
          const current = trips.find(trip => trip.trang_thai === 'dang_di');
          
          const upcoming = trips.filter(trip => {
            const tripDate = new Date(trip.ngay_chay || trip.ngay);
            return tripDate > now && trip.trang_thai !== 'huy';
          }).sort((a, b) => new Date(a.ngay_chay || a.ngay) - new Date(b.ngay_chay || b.ngay));
          
          const past = trips.filter(trip => {
            const tripDate = new Date(trip.ngay_chay || trip.ngay);
            return (tripDate < now || trip.trang_thai === 'hoan_thanh') && trip.trang_thai !== 'huy';
          }).sort((a, b) => new Date(b.ngay_chay || b.ngay) - new Date(a.ngay_chay || a.ngay));
          
          setCurrentTrip(current || null);
          setUpcomingTrips(upcoming);
          setPastTrips(past);
          
          if (current) {
            setSelectedTrip(current);
            setViewMode('current');
          } else if (upcoming.length > 0) {
            setSelectedTrip(upcoming[0]);
            setViewMode('upcoming');
          } else if (past.length > 0) {
            setSelectedTrip(past[0]);
            setViewMode('past');
          }
        } else {
          setError(response?.message || 'Không thể tải lịch trình');
        }
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Không thể tải lịch trình';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverSchedules();
  }, []);

  const handleViewDetails = (trip) => {
    // Nếu là chuyến đang đi, mở modal
    if (trip.trang_thai === 'dang_di') {
      setActiveTripId(trip.id_chuyen_di);
      setShowActiveTripModal(true);
    } else {
      // Nếu không phải đang đi, chuyển đến trang chi tiết
      navigate(`/driver/chi-tiet-chuyen-di/${trip.id_chuyen_di}`);
    }
  };

  const handleModalClose = () => {
    setShowActiveTripModal(false);
    setActiveTripId(null);
    // Refresh data sau khi đóng modal
    window.location.reload();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'dang_di': return 'bg-blue-100 text-blue-700';
      case 'hoan_thanh': return 'bg-green-100 text-green-700';
      case 'huy': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'dang_di': return 'Đang đi';
      case 'hoan_thanh': return 'Hoàn thành';
      case 'huy': return 'Đã hủy';
      default: return 'Chờ xuất phát';
    }
  };

  const renderTripCard = (trip, isSelected) => {
    const date = new Date(trip.ngay_chay || trip.ngay);
    const time = trip.gio_khoi_hanh 
      ? new Date(trip.gio_khoi_hanh).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : 'N/A';
    const tripTypeLabel = trip.loai_chuyen_di === 'don' ? 'Đón' : 'Trả';
    const isDangDi = trip.trang_thai === 'dang_di';

    return (
      <div
        key={trip.id_chuyen_di}
        onClick={() => handleViewDetails(trip)}
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
          isSelected
            ? 'border-indigo-500 bg-indigo-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow'
        } ${isDangDi ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
      >
        {isDangDi && (
          <div className="mb-2 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              ĐANG HOẠT ĐỘNG
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FaClock className="text-indigo-600" size={16} />
            <span className="text-base font-bold text-gray-800">
              {date.toLocaleDateString('vi-VN')} • {time}
            </span>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(trip.trang_thai)}`}>
            {getStatusLabel(trip.trang_thai)}
          </span>
        </div>
        
        <div className="flex items-start gap-2 mb-3">
          <FaRoute className="text-blue-600 mt-1 flex-shrink-0" size={14} />
          <p className="text-sm font-semibold text-gray-800 line-clamp-2">
            {trip.tuyen_duong?.ten_tuyen_duong}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              trip.loai_chuyen_di === 'don' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              {tripTypeLabel} học sinh
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <FaBus size={14} />
            <span className="font-medium">{trip.xe_buyt?.bien_so_xe}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-indigo-600 mx-auto mb-3" />
          <p className="text-gray-600">Đang tải lịch trình...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaBus className="text-indigo-600" />
                Lịch trình của tôi
              </h1>
              <p className="text-gray-600 mt-1">Xem lịch trình làm việc</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => {
                  setViewMode('current');
                  if (currentTrip) setSelectedTrip(currentTrip);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  viewMode === 'current'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <FaBus size={14} />
                Đang đi
                {currentTrip && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                    Live
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setViewMode('upcoming');
                  if (upcomingTrips.length > 0) setSelectedTrip(upcomingTrips[0]);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  viewMode === 'upcoming'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <FaCalendarAlt size={14} />
                Sắp tới ({upcomingTrips.length})
              </button>
              <button
                onClick={() => {
                  setViewMode('past');
                  if (pastTrips.length > 0) setSelectedTrip(pastTrips[0]);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  viewMode === 'past'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <FaHistory size={14} />
                Lịch sử ({pastTrips.length})
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full p-4">
            {error && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 h-full overflow-y-auto">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                {viewMode === 'current' && (
                  <>
                    <FaBus className="text-indigo-600" />
                    Chuyến đang đi
                  </>
                )}
                {viewMode === 'upcoming' && (
                  <>
                    <FaCalendarAlt className="text-indigo-600" />
                    Các chuyến sắp tới
                  </>
                )}
                {viewMode === 'past' && (
                  <>
                    <FaHistory className="text-indigo-600" />
                    Lịch sử chuyến đi
                  </>
                )}
              </h2>

              <div className="space-y-3">
                {viewMode === 'current' && currentTrip && (
                  <>
                    {renderTripCard(currentTrip, true)}
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Nhấn vào thẻ chuyến đi</strong> để mở bảng điều khiển với bản đồ, điểm danh học sinh, và báo cáo sự cố
                      </p>
                    </div>
                  </>
                )}
                {viewMode === 'current' && !currentTrip && (
                  <div className="text-center py-12">
                    <FaBus size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Không có chuyến đang diễn ra</p>
                    <p className="text-gray-400 text-sm mt-2">Chuyến tiếp theo sẽ hiển thị khi bắt đầu</p>
                  </div>
                )}

                {viewMode === 'upcoming' && upcomingTrips.length === 0 && (
                  <div className="text-center py-12">
                    <FaCalendarAlt size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Không có chuyến nào sắp tới</p>
                    <p className="text-gray-400 text-sm mt-2">Bạn chưa có lịch làm việc trong thời gian tới</p>
                  </div>
                )}
                {viewMode === 'upcoming' && upcomingTrips.map(trip => 
                  renderTripCard(trip, trip.id_chuyen_di === selectedTrip?.id_chuyen_di)
                )}

                {viewMode === 'past' && pastTrips.length === 0 && (
                  <div className="text-center py-12">
                    <FaHistory size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Chưa có lịch sử chuyến đi</p>
                    <p className="text-gray-400 text-sm mt-2">Các chuyến đi đã hoàn thành sẽ hiển thị tại đây</p>
                  </div>
                )}
                {viewMode === 'past' && pastTrips.slice(0, 20).map(trip => 
                  renderTripCard(trip, trip.id_chuyen_di === selectedTrip?.id_chuyen_di)
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm text-gray-600 text-center">
              💡 <span className="italic">
                {currentTrip 
                  ? 'Nhấn vào chuyến đang đi để mở bảng điều khiển' 
                  : 'Nhấn vào chuyến đi để xem chi tiết tuyến đường và danh sách học sinh'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Active Trip Modal */}
      <ActiveTripModal 
        isOpen={showActiveTripModal}
        onClose={handleModalClose}
        tripId={activeTripId}
      />
    </>
  );
}

export default XemLichTrinh;
