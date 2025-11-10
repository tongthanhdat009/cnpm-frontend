import React, { useState, useEffect, useRef } from 'react';
import ReactMapGL, { Marker, Source, Layer, Popup } from '@goongmaps/goong-map-react';
import { FaBus, FaMapMarkerAlt, FaSchool, FaUserGraduate, FaSpinner, FaPhone } from 'react-icons/fa';
import polyline from '@mapbox/polyline';
import '@goongmaps/goong-js/dist/goong-js.css';
import HocSinhService from '../../services/hocSinhService';
import BusTrackingService from '../../services/busTrackingService';

function TheoDoiXeBuyt() {
  const [viewport, setViewport] = useState({
    latitude: 10.7769,
    longitude: 106.7008,
    zoom: 13,
    width: '100%',
    height: '100%',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [activeTrips, setActiveTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [stops, setStops] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);

  // Lấy danh sách con của phụ huynh
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await HocSinhService.getHocSinhByPhuHuynh(userData.id_nguoi_dung);
        
        if (response.success && response.data.length > 0) {
          setChildren(response.data);
          setSelectedChild(response.data[0]); // Chọn con đầu tiên mặc định
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

  // Lấy chuyến đi đang hoạt động khi chọn con
  useEffect(() => {
    if (!selectedChild) return;

    const fetchActiveTrips = async () => {
      try {
        const response = await BusTrackingService.getActiveTripsForStudent(selectedChild.id_hoc_sinh);
        
        if (response.success && response.data.length > 0) {
          setActiveTrips(response.data);
          setSelectedTrip(response.data[0]); // Chọn chuyến đầu tiên
        } else {
          setActiveTrips([]);
          setSelectedTrip(null);
          setError('Hiện không có chuyến đi nào đang hoạt động');
        }
      } catch (err) {
        console.error('Error fetching active trips:', err);
        setActiveTrips([]);
        setSelectedTrip(null);
      }
    };

    fetchActiveTrips();
    
    // Refresh mỗi 30 giây
    const interval = setInterval(fetchActiveTrips, 30000);
    return () => clearInterval(interval);
  }, [selectedChild]);

  // Vẽ tuyến đường khi có chuyến đi
  useEffect(() => {
    if (!selectedTrip?.chuyen_di?.tuyen_duong?.tuyen_duong_diem_dung) return;

    const stopsData = selectedTrip.chuyen_di.tuyen_duong.tuyen_duong_diem_dung
      .sort((a, b) => a.thu_tu_diem_dung - b.thu_tu_diem_dung)
      .map(item => ({
        id: item.diem_dung.id_diem_dung,
        name: item.diem_dung.ten_diem_dung,
        address: item.diem_dung.dia_chi,
        lat: parseFloat(item.diem_dung.vi_do),
        lng: parseFloat(item.diem_dung.kinh_do),
        order: item.thu_tu_diem_dung
      }));

    setStops(stopsData);

    // Tính toán viewport để hiển thị toàn bộ tuyến
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
    const drawRoute = async () => {
      const allSegments = [];
      
      for (let i = 0; i < stopsData.length - 1; i++) {
        const origin = `${stopsData[i].lat},${stopsData[i].lng}`;
        const destination = `${stopsData[i + 1].lat},${stopsData[i + 1].lng}`;
        const url = `https://rsapi.goong.io/Direction?origin=${origin}&destination=${destination}&vehicle=car&api_key=${import.meta.env.VITE_GOONG_API_KEY}`;

        try {
          const response = await fetch(url);
          const data = await response.json();
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
    };

    drawRoute();
  }, [selectedTrip]);

  // WebSocket connection cho real-time tracking
  useEffect(() => {
    if (!selectedTrip) {
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
        console.log('✅ WebSocket connected (Parent)');
        setWsConnected(true);
        
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.id_nguoi_dung) {
          ws.send(JSON.stringify({
            type: 'authenticate',
            userId: userData.id_nguoi_dung
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'bus_location_update' && 
              message.data.id_chuyen_di === selectedTrip.chuyen_di.id_chuyen_di) {
            console.log('📍 Received bus location update (Parent):', message.data);
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
        console.error('❌ WebSocket error:', error);
        setWsConnected(false);
      };

      ws.onclose = () => {
        console.log('❌ WebSocket disconnected');
        setWsConnected(false);
        
        setTimeout(() => {
          if (selectedTrip) {
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
        const response = await BusTrackingService.getTripBusLocation(selectedTrip.chuyen_di.id_chuyen_di);
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
        wsRef.current.close();
      }
    };
  }, [selectedTrip]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  if (error && !selectedTrip) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <p className="font-medium">{error}</p>
          <p className="text-sm mt-2">Chuyến đi sẽ xuất hiện khi tài xế bắt đầu chuyến.</p>
        </div>
      </div>
    );
  }

  const childStop = selectedTrip?.diem_dung;
  const trip = selectedTrip?.chuyen_di;
  const tripType = trip?.loai_chuyen_di === 'don' ? 'Đón học sinh' : 'Trả học sinh';

  return (
    <div className="flex flex-col lg:flex-row h-full max-h-[calc(100vh-8rem)] bg-white rounded-lg shadow-md overflow-hidden">
      {/* Cột thông tin và trạng thái */}
      <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-200 p-4 flex flex-col overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">Theo dõi xe buýt</h2>
        
        {/* Chọn con (nếu có nhiều con) */}
        {children.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn học sinh</label>
            <select
              value={selectedChild?.id_hoc_sinh || ''}
              onChange={(e) => {
                const child = children.find(c => c.id_hoc_sinh === parseInt(e.target.value));
                setSelectedChild(child);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {children.map(child => (
                <option key={child.id_hoc_sinh} value={child.id_hoc_sinh}>
                  {child.ho_ten} - Lớp {child.lop}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Thông tin học sinh */}
        {selectedChild && (
          <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg mb-4">
            <FaUserGraduate size={24} className="text-indigo-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800">{selectedChild.ho_ten}</p>
              <p className="text-sm text-gray-600">Lớp {selectedChild.lop}</p>
              {childStop && (
                <p className="text-xs text-gray-500 mt-1">Điểm đón: {childStop.ten_diem_dung}</p>
              )}
            </div>
          </div>
        )}

        {/* Trạng thái kết nối */}
        <div className={`p-3 rounded-lg border mb-4 ${wsConnected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium">
              {wsConnected ? '🟢 Đang theo dõi real-time' : '⚪ Chưa kết nối'}
            </span>
          </div>
          {busLocation && (
            <p className="text-xs text-gray-600 mt-2">
              Cập nhật lúc: {new Date(busLocation.time).toLocaleTimeString('vi-VN')}
            </p>
          )}
        </div>

        {/* Thông tin chuyến đi */}
        {trip && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">Thông tin chuyến đi</p>
              <div className="space-y-2 text-sm">
                <p><strong>Tuyến:</strong> {trip.tuyen_duong?.ten_tuyen_duong}</p>
                <p><strong>Loại:</strong> {tripType}</p>
                <p><strong>Giờ khởi hành:</strong> {new Date(trip.gio_khoi_hanh).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                <p><strong>Trạng thái:</strong> <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">{trip.trang_thai}</span></p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">Thông tin xe & tài xế</p>
              <div className="space-y-2 text-sm">
                <p><strong>Biển số xe:</strong> {trip.xe_buyt?.bien_so_xe}</p>
                <p><strong>Tài xế:</strong> {trip.tai_xe?.ho_ten}</p>
                {trip.tai_xe?.so_dien_thoai && (
                  <a 
                    href={`tel:${trip.tai_xe.so_dien_thoai}`}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    <FaPhone size={12} />
                    {trip.tai_xe.so_dien_thoai}
                  </a>
                )}
              </div>
            </div>

            {/* Trạng thái điểm danh */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">Trạng thái điểm danh</p>
              <p className="text-lg font-bold text-gray-800">
                {selectedTrip.trang_thai_diem_danh === 'da_don' && '✅ Đã đón'}
                {selectedTrip.trang_thai_diem_danh === 'da_tra' && '✅ Đã trả'}
                {selectedTrip.trang_thai_diem_danh === 'chua_don' && '⏳ Chưa cập nhật'}
                {selectedTrip.trang_thai_diem_danh === 'vang_mat' && '❌ Vắng mặt'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Cột bản đồ */}
      <div className="lg:w-2/3 h-96 lg:h-full">
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
                  'line-width': 4, 
                  'line-opacity': 0.8 
                }}
              />
            </Source>
          )}

          {/* Markers cho các điểm dừng */}
          {stops.map((stop, index) => (
            <Marker 
              key={stop.id} 
              latitude={stop.lat} 
              longitude={stop.lng}
            >
              <div className="relative">
                <FaMapMarkerAlt 
                  size={28} 
                  className={
                    stop.id === childStop?.id_diem_dung
                      ? 'text-green-600 drop-shadow-lg'
                      : index === 0
                        ? 'text-blue-600 drop-shadow'
                        : index === stops.length - 1
                          ? 'text-red-600 drop-shadow'
                          : 'text-gray-600 drop-shadow'
                  }
                  title={stop.name}
                />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded text-xs font-semibold shadow">
                  {stop.order}
                </div>
              </div>
            </Marker>
          ))}

          {/* Marker cho xe buýt */}
          {busLocation && (
            <Marker latitude={busLocation.lat} longitude={busLocation.lng}>
              <div className="relative animate-bounce">
                <FaBus 
                  size={36} 
                  className="text-orange-500"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(255, 165, 0, 0.8))' }}
                />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
                  {trip?.xe_buyt?.bien_so_xe}
                </div>
              </div>
            </Marker>
          )}
        </ReactMapGL>
      </div>
    </div>
  );
}

export default TheoDoiXeBuyt;