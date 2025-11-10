import React, { useState, useEffect, useRef } from 'react';
import ReactMapGL, { Marker, Source, Layer, Popup } from '@goongmaps/goong-map-react';
import { FaBus, FaMapMarkerAlt, FaUserGraduate, FaSpinner, FaPhone, FaHistory, FaClock, FaCalendarAlt, FaMapMarkedAlt, FaCheckCircle, FaExclamationCircle, FaHourglassHalf } from 'react-icons/fa';
import polyline from '@mapbox/polyline';
import '@goongmaps/goong-js/dist/goong-js.css';
import HocSinhService from '../../services/hocSinhService';
import ChuyenDiService from '../../services/chuyenDiService';
import TuyenDuongService from '../../services/tuyenDuongService';
import BusTrackingService from '../../services/busTrackingService';

function TheoDoiXeBuyt() {
  const [viewport, setViewport] = useState({
    latitude: 10.8231,
    longitude: 106.6297,
    zoom: 13,
    width: '100%',
    height: '100%',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [viewMode, setViewMode] = useState('current'); // 'current', 'upcoming', 'past'
  const [busLocation, setBusLocation] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [stops, setStops] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const wsRef = useRef(null);

  // Lấy danh sách con của phụ huynh
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await HocSinhService.getHocSinhByPhuHuynh(userData.id_nguoi_dung);
        console.log(response);
        if (response.success && response.data.length > 0) {
          setChildren(response.data);
          setSelectedChild(response.data[0]);
        } else {
          setError('Không tìm thấy thông tin học sinh');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải thông tin học sinh');
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  // Lấy các chuyến đi khi chọn con
  useEffect(() => {
    if (!selectedChild) return;

    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await ChuyenDiService.getChuyenDiByHocSinh(selectedChild.id_hoc_sinh);
        
        if (response.success && response.data) {
          const now = new Date();
          const trips = response.data;
          
          // Phân loại chuyến đi
          const current = trips.find(trip => {
            return trip.trang_thai === 'dang_di';
          });
          
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
          
          // Tự động chọn chuyến hiện tại hoặc chuyến tiếp theo
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
        }
      } catch (err) {
        console.error('Error fetching trips:', err);
        setError('Không thể tải thông tin chuyến đi');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [selectedChild]);

  // Vẽ tuyến đường khi có chuyến đi được chọn
  useEffect(() => {
    if (!selectedTrip?.id_tuyen_duong) return;

    const fetchRouteAndStops = async () => {
      try {
        const response = await TuyenDuongService.getTuyenDuongById(selectedTrip.id_tuyen_duong);
        
        if (!response?.success || !response?.data) return;

        const stopsData = response.data.tuyen_duong_diem_dung
          ?.sort((a, b) => a.thu_tu_diem_dung - b.thu_tu_diem_dung)
          .map((item, index) => ({
            id: item.diem_dung.id_diem_dung,
            name: item.diem_dung.ten_diem_dung,
            address: item.diem_dung.dia_chi,
            lat: parseFloat(item.diem_dung.vi_do),
            lng: parseFloat(item.diem_dung.kinh_do),
            order: item.thu_tu_diem_dung
          })) || [];

        setStops(stopsData);

        // Tính viewport để hiển thị toàn bộ tuyến
        if (stopsData.length > 0) {
          const lats = stopsData.map(s => s.lat);
          const lngs = stopsData.map(s => s.lng);
          const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
          const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
          
          setViewport(prev => ({
            ...prev,
            latitude: centerLat,
            longitude: centerLng,
            zoom: 13
          }));
        }

        // Vẽ tuyến đường
        const allSegments = [];
        for (let i = 0; i < stopsData.length - 1; i++) {
          const origin = `${stopsData[i].lat},${stopsData[i].lng}`;
          const destination = `${stopsData[i + 1].lat},${stopsData[i + 1].lng}`;
          const url = `https://rsapi.goong.io/Direction?origin=${origin}&destination=${destination}&vehicle=car&api_key=${import.meta.env.VITE_GOONG_API_KEY}`;

          try {
            const res = await fetch(url);
            const data = await res.json();
            const segmentPolyline = data?.routes?.[0]?.overview_polyline?.points;
            
            if (segmentPolyline) {
              const decoded = polyline.decode(segmentPolyline).map(coord => [coord[1], coord[0]]);
              allSegments.push(...decoded);
            }
          } catch (error) {
            console.error('Error fetching route segment:', error);
          }
        }

        if (allSegments.length > 0) {
          setRouteGeoJSON({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: allSegments
            }
          });
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRouteAndStops();
  }, [selectedTrip]);

  // WebSocket connection cho real-time tracking
  useEffect(() => {
    if (!selectedTrip || selectedTrip.trang_thai !== 'dang_di') {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        setWsConnected(false);
      }
      return;
    }

    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:3000');
      
      ws.onopen = () => {
        setWsConnected(true);
        
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.id_nguoi_dung) {
          ws.send(JSON.stringify({
            type: 'authenticate',
            userId: userData.id_nguoi_dung
          }));
        }

        // Subscribe vào chuyến đi này
        ws.send(JSON.stringify({
          type: 'subscribe_trip',
          tripId: selectedTrip.id_chuyen_di
        }));
        console.log(`📡 Parent subscribed to trip ${selectedTrip.id_chuyen_di}`);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Bỏ qua các message xác nhận
          if (message.type === 'authenticated' || message.type === 'subscribed') {
            console.log('✅', message);
            return;
          }
          
          // Chỉ xử lý bus_location_update cho chuyến này
          if (message.type === 'bus_location_update' && 
              message.data.id_chuyen_di === selectedTrip.id_chuyen_di) {
            console.log('✅ Received bus location update for current trip:', message.data);
            setBusLocation({
              lat: parseFloat(message.data.vi_do),
              lng: parseFloat(message.data.kinh_do),
              time: message.data.thoi_gian
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      };

      ws.onclose = () => {
        setWsConnected(false);
        setTimeout(() => {
          if (selectedTrip?.trang_thai === 'dang_di') {
            connectWebSocket();
          }
        }, 3000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    // Lấy vị trí ban đầu
    const fetchInitialLocation = async () => {
      try {
        const response = await BusTrackingService.getTripBusLocation(selectedTrip.id_chuyen_di);
        if (response.success && response.data.xe_buyt.vi_do && response.data.xe_buyt.kinh_do) {
          setBusLocation({
            lat: parseFloat(response.data.xe_buyt.vi_do),
            lng: parseFloat(response.data.xe_buyt.kinh_do),
            time: response.data.xe_buyt.lan_cap_nhat_cuoi
          });
        }
      } catch (error) {
        console.error('Error fetching initial bus location:', error);
      }
    };

    fetchInitialLocation();

    return () => {
      if (wsRef.current) {
        // Unsubscribe trước khi đóng
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'unsubscribe_trip',
            tripId: selectedTrip.id_chuyen_di
          }));
        }
        wsRef.current.close();
      }
    };
  }, [selectedTrip]);

  // Tìm điểm dừng của học sinh
  const getChildStop = () => {
    if (!selectedTrip || !selectedChild) return null;
    
    const attendance = selectedTrip.diem_danh_chuyen_di?.find(
      dd => dd.id_hoc_sinh === selectedChild.id_hoc_sinh
    );
    
    return attendance?.diem_dung || null;
  };

  const getAttendanceStatus = () => {
    if (!selectedTrip || !selectedChild) return null;
    
    const attendance = selectedTrip.diem_danh_chuyen_di?.find(
      dd => dd.id_hoc_sinh === selectedChild.id_hoc_sinh
    );
    
    return attendance?.trang_thai || 'chua_don';
  };

  const getStatusLabel = (status) => {
    const labels = {
      da_don: 'Đã đón',
      da_tra: 'Đã trả',
      chua_don: 'Chưa cập nhật',
      vang_mat: 'Vắng mặt'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'da_don':
      case 'da_tra':
        return <FaCheckCircle className="text-green-500" size={20} />;
      case 'vang_mat':
        return <FaExclamationCircle className="text-red-500" size={20} />;
      default:
        return <FaHourglassHalf className="text-yellow-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'da_don':
      case 'da_tra':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'vang_mat':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  const getTripStatusColor = (status) => {
    switch(status) {
      case 'dang_di': return 'bg-blue-100 text-blue-700';
      case 'hoan_thanh': return 'bg-green-100 text-green-700';
      case 'huy': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getTripStatusLabel = (status) => {
    switch(status) {
      case 'dang_di': return 'Đang đi';
      case 'hoan_thanh': return 'Hoàn thành';
      case 'huy': return 'Đã hủy';
      default: return 'Chờ xuất phát';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-indigo-600 mx-auto mb-3" />
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error && !selectedTrip) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const childStop = getChildStop();
  const tripType = selectedTrip?.loai_chuyen_di === 'don' ? 'Đón học sinh' : 'Trả học sinh';
  const attendanceStatus = getAttendanceStatus();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaBus className="text-indigo-600" />
              Theo dõi xe buýt
            </h1>
            
            {/* Chọn con (nếu có nhiều con) */}
            {children.length > 1 && (
              <select
                value={selectedChild?.id_hoc_sinh || ''}
                onChange={(e) => {
                  const child = children.find(c => c.id_hoc_sinh === parseInt(e.target.value));
                  setSelectedChild(child);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {children.map(child => (
                  <option key={child.id_hoc_sinh} value={child.id_hoc_sinh}>
                    {child.ho_ten} - Lớp {child.lop}
                  </option>
                ))}
              </select>
            )}
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

      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full p-4">
          <div className="flex flex-col lg:flex-row gap-4 h-full">
            {/* Sidebar - Thông tin chuyến đi */}
            <div className="lg:w-96 flex-shrink-0 space-y-4 overflow-y-auto">
              {/* Thông tin học sinh */}
              {selectedChild && (
                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-indigo-500">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <FaUserGraduate size={24} className="text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-lg">{selectedChild.ho_ten}</p>
                      <p className="text-sm text-gray-600">Lớp {selectedChild.lop}</p>
                    </div>
                  </div>
                  
                  {childStop && selectedTrip && (
                    <>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Điểm đón/trả:</p>
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className="text-green-600 mt-1 flex-shrink-0" size={14} />
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{childStop.ten_diem_dung}</p>
                            <p className="text-xs text-gray-600">{childStop.dia_chi}</p>
                          </div>
                        </div>
                      </div>

                      {/* Trạng thái điểm danh */}
                      <div className={`mt-3 p-3 rounded-lg border-2 ${getStatusColor(attendanceStatus)}`}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(attendanceStatus)}
                          <div className="flex-1">
                            <p className="text-xs font-medium mb-1">Trạng thái:</p>
                            <p className="font-bold text-sm">{getStatusLabel(attendanceStatus)}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Real-time status */}
              {selectedTrip?.trang_thai === 'dang_di' && (
                <div className={`p-4 rounded-lg border-2 ${
                  wsConnected 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-yellow-50 border-yellow-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {wsConnected ? '🟢 Đang theo dõi real-time' : '🟡 Đang kết nối...'}
                      </p>
                      {busLocation && (
                        <p className="text-xs text-gray-600 mt-1">
                          Cập nhật: {new Date(busLocation.time).toLocaleTimeString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Danh sách chuyến đi */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FaMapMarkedAlt className="text-indigo-600" />
                  {viewMode === 'current' && 'Chuyến hiện tại'}
                  {viewMode === 'upcoming' && 'Các chuyến sắp tới'}
                  {viewMode === 'past' && 'Lịch sử chuyến đi'}
                </h3>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {viewMode === 'current' && currentTrip && renderTripCard(currentTrip, true)}
                  {viewMode === 'current' && !currentTrip && (
                    <p className="text-sm text-gray-500 italic text-center py-4">
                      Không có chuyến đang diễn ra
                    </p>
                  )}

                  {viewMode === 'upcoming' && upcomingTrips.length === 0 && (
                    <p className="text-sm text-gray-500 italic text-center py-4">
                      Không có chuyến nào sắp tới
                    </p>
                  )}
                  {viewMode === 'upcoming' && upcomingTrips.map(trip => 
                    renderTripCard(trip, trip.id_chuyen_di === selectedTrip?.id_chuyen_di)
                  )}

                  {viewMode === 'past' && pastTrips.length === 0 && (
                    <p className="text-sm text-gray-500 italic text-center py-4">
                      Chưa có lịch sử chuyến đi
                    </p>
                  )}
                  {viewMode === 'past' && pastTrips.slice(0, 10).map(trip => 
                    renderTripCard(trip, trip.id_chuyen_di === selectedTrip?.id_chuyen_di)
                  )}
                </div>
              </div>

              {/* Thông tin chi tiết chuyến đã chọn */}
              {selectedTrip && (
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="font-bold text-gray-800 mb-3">Chi tiết chuyến đi</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">Loại chuyến:</span>
                      <span className="font-semibold text-gray-800">{tripType}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTripStatusColor(selectedTrip.trang_thai)}`}>
                        {getTripStatusLabel(selectedTrip.trang_thai)}
                      </span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-gray-600 mb-2">Xe buýt:</p>
                      <p className="font-bold text-gray-800 text-lg">{selectedTrip.xe_buyt?.bien_so_xe || 'N/A'}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-gray-600 mb-2">Tài xế:</p>
                      <p className="font-semibold text-gray-800">{selectedTrip.nguoi_dung?.ho_ten || 'N/A'}</p>
                      {selectedTrip.nguoi_dung?.so_dien_thoai && (
                        <a 
                          href={`tel:${selectedTrip.nguoi_dung.so_dien_thoai}`}
                          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mt-2"
                        >
                          <FaPhone size={12} />
                          {selectedTrip.nguoi_dung.so_dien_thoai}
                        </a>
                      )}
                    </div>

                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-gray-600 mb-2">Tuyến đường:</p>
                      <p className="font-semibold text-gray-800">{selectedTrip.tuyen_duong?.ten_tuyen_duong || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bản đồ */}
            <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
              {!selectedTrip ? (
                <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                  <FaMapMarkedAlt size={64} className="text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Chọn một chuyến đi để xem bản đồ</p>
                </div>
              ) : (
                <ReactMapGL
                  {...viewport}
                  onViewportChange={setViewport}
                  goongApiAccessToken={import.meta.env.VITE_GOONG_MAPTILES_KEY}
                >
                  {/* Vẽ tuyến đường */}
                  {routeGeoJSON && (
                    <Source id="route" type="geojson" data={routeGeoJSON}>
                      <Layer
                        id="route" 
                        type="line"
                        paint={{ 
                          'line-color': '#3b82f6', 
                          'line-width': 5, 
                          'line-opacity': 0.8 
                        }}
                      />
                    </Source>
                  )}

                  {/* Điểm dừng */}
                  {stops.map((stop, index) => {
                    const isChildStop = stop.id === childStop?.id_diem_dung;
                    const isFirstStop = index === 0;
                    const isLastStop = index === stops.length - 1;
                    
                    return (
                      <Marker 
                        key={stop.id} 
                        latitude={stop.lat} 
                        longitude={stop.lng}
                      >
                        <div 
                          className="relative cursor-pointer transform transition-transform hover:scale-110"
                          onClick={() => setSelectedStop(stop)}
                        >
                          <FaMapMarkerAlt 
                            size={isChildStop ? 36 : 28} 
                            className={`drop-shadow-lg ${
                              isChildStop
                                ? 'text-green-600 animate-pulse'
                                : isFirstStop
                                  ? 'text-blue-600'
                                  : isLastStop
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                            }`}
                          />
                          {isChildStop && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow-lg">
                              Con bạn
                            </div>
                          )}
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded text-xs font-semibold shadow border border-gray-300">
                            {stop.order}
                          </div>
                        </div>
                      </Marker>
                    );
                  })}

                  {/* Vị trí xe buýt real-time */}
                  {busLocation && selectedTrip?.trang_thai === 'dang_di' && (
                    <Marker latitude={busLocation.lat} longitude={busLocation.lng}>
                      <div className="relative animate-bounce">
                        <FaBus 
                          size={40} 
                          className="text-orange-500"
                          style={{ filter: 'drop-shadow(0 0 10px rgba(255, 165, 0, 0.9))' }}
                        />
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
                          {selectedTrip.xe_buyt?.bien_so_xe}
                        </div>
                      </div>
                    </Marker>
                  )}

                  {/* Popup điểm dừng */}
                  {selectedStop && (
                    <Popup
                      latitude={selectedStop.lat}
                      longitude={selectedStop.lng}
                      onClose={() => setSelectedStop(null)}
                      closeOnClick={false}
                      offsetTop={-10}
                    >
                      <div className="p-2">
                        <p className="font-bold text-sm mb-1">{selectedStop.name}</p>
                        <p className="text-xs text-gray-600">{selectedStop.address}</p>
                        {selectedStop.id === childStop?.id_diem_dung && (
                          <p className="text-xs text-green-600 font-semibold mt-2">
                            ⭐ Điểm đón/trả của con bạn
                          </p>
                        )}
                      </div>
                    </Popup>
                  )}
                </ReactMapGL>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function renderTripCard(trip, isSelected) {
    const date = new Date(trip.ngay_chay || trip.ngay);
    const time = trip.gio_khoi_hanh 
      ? new Date(trip.gio_khoi_hanh).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : 'N/A';
    const tripTypeLabel = trip.loai_chuyen_di === 'don' ? 'Đón' : 'Trả';

    return (
      <div
        key={trip.id_chuyen_di}
        onClick={() => setSelectedTrip(trip)}
        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
          isSelected
            ? 'border-indigo-500 bg-indigo-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaClock className="text-indigo-600" size={14} />
            <span className="text-sm font-bold text-gray-800">
              {date.toLocaleDateString('vi-VN')} • {time}
            </span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTripStatusColor(trip.trang_thai)}`}>
            {getTripStatusLabel(trip.trang_thai)}
          </span>
        </div>
        <p className="text-sm font-semibold text-gray-800 mb-1">
          {trip.tuyen_duong?.ten_tuyen_duong}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{tripTypeLabel} học sinh</span>
          <span className="font-medium">{trip.xe_buyt?.bien_so_xe}</span>
        </div>
      </div>
    );
  }
}

export default TheoDoiXeBuyt;