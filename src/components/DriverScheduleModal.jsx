import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaBus, FaClock, FaMapMarkerAlt, FaHistory, FaRoute } from 'react-icons/fa';
import ChuyenDiService from '../services/chuyenDiService';

const DriverScheduleModal = ({ isOpen, onClose, driver }) => {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState({ current: null, upcoming: [], past: [] });
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past'

  useEffect(() => {
    if (isOpen && driver) {
      fetchSchedule();
    } else {
      setTrips({ current: null, upcoming: [], past: [] });
    }
  }, [isOpen, driver]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await ChuyenDiService.getChuyenDiByTaiXe(driver.id_nguoi_dung);
      
      if (response?.success) {
        const allTrips = response.data || [];
        const now = new Date();
        
        const current = allTrips.find(trip => trip.trang_thai === 'dang_di');
        
        const upcoming = allTrips.filter(trip => {
          const tripDate = new Date(trip.ngay_chay || trip.ngay);
          return tripDate > now && trip.trang_thai !== 'huy' && trip.trang_thai !== 'hoan_thanh' && trip.trang_thai !== 'dang_di';
        }).sort((a, b) => new Date(a.ngay_chay || a.ngay) - new Date(b.ngay_chay || b.ngay));
        
        const past = allTrips.filter(trip => {
          const tripDate = new Date(trip.ngay_chay || trip.ngay);
          return (tripDate < now || trip.trang_thai === 'hoan_thanh') && trip.trang_thai !== 'huy' && trip.trang_thai !== 'dang_di';
        }).sort((a, b) => new Date(b.ngay_chay || b.ngay) - new Date(a.ngay_chay || a.ngay));
        
        setTrips({ current, upcoming, past });
        
        // Auto switch tab if no upcoming trips
        if (!current && upcoming.length === 0 && past.length > 0) {
          setActiveTab('past');
        } else {
          setActiveTab('upcoming');
        }
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const TripCard = ({ trip, isCurrent = false }) => (
    <div className={`p-4 rounded-xl border ${isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'} shadow-sm mb-3`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isCurrent ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
            <FaBus />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">
              {trip.tuyen_duong?.ten_tuyen_duong || `Tuyến #${trip.id_tuyen_duong}`}
            </h4>
            <p className="text-xs text-gray-500">Mã chuyến: #{trip.id_chuyen_di}</p>
          </div>
        </div>
        {isCurrent && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full animate-pulse">
            Đang chạy
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm mt-3">
        <div className="flex items-center gap-2 text-gray-600">
          <FaCalendarAlt className="text-gray-400" />
          <span>{new Date(trip.ngay_chay || trip.ngay).toLocaleDateString('vi-VN')}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <FaClock className="text-gray-400" />
          <span>{trip.gio_khoi_hanh}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 col-span-2">
          <FaRoute className="text-gray-400" />
          <span className="truncate">{trip.tuyen_duong?.mo_ta || 'Không có mô tả'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaCalendarAlt />
              Lịch trình tài xế
            </h2>
            <p className="text-indigo-100 text-sm mt-1">{driver?.ho_ten}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'upcoming' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sắp tới ({trips.upcoming.length})
            {activeTab === 'upcoming' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'past' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Lịch sử ({trips.past.length})
            {activeTab === 'past' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
              <p>Đang tải lịch trình...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current Trip Section */}
              {trips.current && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Chuyến đang chạy</h3>
                  <TripCard trip={trips.current} isCurrent={true} />
                </div>
              )}

              {/* List Section */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                  {activeTab === 'upcoming' ? 'Chuyến sắp tới' : 'Lịch sử chuyến đi'}
                </h3>
                
                {activeTab === 'upcoming' ? (
                  trips.upcoming.length > 0 ? (
                    trips.upcoming.map(trip => <TripCard key={trip.id_chuyen_di} trip={trip} />)
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                      <FaCalendarAlt className="mx-auto mb-2 opacity-20" size={32} />
                      <p>Không có chuyến sắp tới</p>
                    </div>
                  )
                ) : (
                  trips.past.length > 0 ? (
                    trips.past.map(trip => <TripCard key={trip.id_chuyen_di} trip={trip} />)
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                      <FaHistory className="mx-auto mb-2 opacity-20" size={32} />
                      <p>Chưa có lịch sử chuyến đi</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverScheduleModal;