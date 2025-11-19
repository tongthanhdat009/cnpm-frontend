import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FaTimes, 
  FaMapMarkedAlt, 
  FaUserCheck, 
  FaExclamationTriangle,
  FaBus,
  FaSpinner,
  FaCheck,
  FaUserTimes,
  FaUserClock,
  FaExpand,
  FaMapMarkerAlt,
  FaPlay,
  FaStop
} from 'react-icons/fa';
import ReactMapGL, { Source, Layer, Marker, Popup } from '@goongmaps/goong-map-react';
import polyline from '@mapbox/polyline';
import ChuyenDiService from '../services/chuyenDiService';
import TuyenDuongService from '../services/tuyenDuongService';

const initialViewport = {
  latitude: 10.8231,
  longitude: 106.6297,
  zoom: 11,
  width: '100%',
  height: '100%'
};

const STATUS_LABELS = {
  da_don: 'Đã đón',
  da_tra: 'Đã trả',
  vang_mat: 'Vắng mặt',
  chua_don: 'Chưa cập nhật'
};

const ActiveTripModal = ({ isOpen, onClose, tripId }) => {
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'attendance', 'incident'
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState(null);
  
  // Map states
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [viewport, setViewport] = useState(initialViewport);
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [optimalViewport, setOptimalViewport] = useState(null);
  const mapContainerRef = useRef(null);
  const [mapSizeKey, setMapSizeKey] = useState(0);
  const [busLocation, setBusLocation] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  
  // Attendance states
  const [attendanceUpdating, setAttendanceUpdating] = useState({});
  const [attendanceError, setAttendanceError] = useState(null);
  
  // Incident states
  const [incidentMessage, setIncidentMessage] = useState('');
  const [sendingIncident, setSendingIncident] = useState(false);
  
  // Trip status states
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch trip details
  useEffect(() => {
    if (!isOpen || !tripId) return;
    
    const fetchTripDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ChuyenDiService.getChuyenDiById(tripId);
        if (response?.success) {
          setSchedule(response.data);
        } else {
          setError(response?.message || 'Không tìm thấy chuyến đi.');
        }
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Không thể tải thông tin chuyến đi.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [isOpen, tripId]);

  // Fetch route and stops
  useEffect(() => {
    if (!schedule?.id_tuyen_duong) return;

    let cancelled = false;

    const fetchRouteAndStops = async () => {
      try {
        setMapLoading(true);
        const response = await TuyenDuongService.getTuyenDuongById(schedule.id_tuyen_duong);
        if (!response?.success || !response?.data || cancelled) return;

        const stopsData = response.data.tuyen_duong_diem_dung
          ?.sort((a, b) => a.thu_tu_diem_dung - b.thu_tu_diem_dung)
          .map((item, index) => {
            if (!item?.diem_dung) return null;
            return {
              id_diem_dung: item.diem_dung.id_diem_dung,
              ten_diem_dung: item.diem_dung.ten_diem_dung,
              dia_chi: item.diem_dung.dia_chi,
              vi_do: item.diem_dung.vi_do,
              kinh_do: item.diem_dung.kinh_do,
              displayOrder: index + 1
            };
          })
          .filter(Boolean) || [];

        if (cancelled) return;
        setStops(stopsData);

        if (stopsData.length < 2) return;

        const latitudes = stopsData.map((stop) => parseFloat(stop.vi_do));
        const longitudes = stopsData.map((stop) => parseFloat(stop.kinh_do));
        const maxLat = Math.max(...latitudes);
        const minLat = Math.min(...latitudes);
        const maxLng = Math.max(...longitudes);
        const minLng = Math.min(...longitudes);
        const centerLat = (maxLat + minLat) / 2;
        const centerLng = (maxLng + minLng) / 2;

        const allSegments = [];
        for (let i = 0; i < stopsData.length - 1; i += 1) {
          const origin = `${stopsData[i].vi_do},${stopsData[i].kinh_do}`;
          const destination = `${stopsData[i + 1].vi_do},${stopsData[i + 1].kinh_do}`;
          const url = `https://rsapi.goong.io/Direction?origin=${origin}&destination=${destination}&vehicle=car&api_key=${import.meta.env.VITE_GOONG_API_KEY}`;

          try {
            const segmentResponse = await fetch(url);
            const segmentData = await segmentResponse.json();
            const segmentPolyline = segmentData?.routes?.[0]?.overview_polyline?.points;
            if (segmentPolyline) {
              const decoded = polyline.decode(segmentPolyline).map((coord) => [coord[1], coord[0]]);
              allSegments.push(...decoded);
            }
          } catch (err) {
            allSegments.push([parseFloat(stopsData[i].kinh_do), parseFloat(stopsData[i].vi_do)]);
            allSegments.push([parseFloat(stopsData[i + 1].kinh_do), parseFloat(stopsData[i + 1].vi_do)]);
          }
        }

        if (allSegments.length > 0 && !cancelled) {
          setRouteGeoJSON({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: allSegments }
          });

          const allLats = [...latitudes, ...allSegments.map((coord) => coord[1])];
          const allLngs = [...longitudes, ...allSegments.map((coord) => coord[0])];
          const routeMaxLat = Math.max(...allLats);
          const routeMinLat = Math.min(...allLats);
          const routeMaxLng = Math.max(...allLngs);
          const routeMinLng = Math.min(...allLngs);
          const routeCenterLat = (routeMaxLat + routeMinLat) / 2;
          const routeCenterLng = (routeMaxLng + routeMinLng) / 2;
          const routeLatDiff = (routeMaxLat - routeMinLat) * 1.3;
          const routeLngDiff = (routeMaxLng - routeMinLng) * 1.3;
          const routeMaxDiff = Math.max(routeLatDiff, routeLngDiff);
          let finalZoom = 13;

          if (routeMaxDiff > 0.5) finalZoom = 10;
          else if (routeMaxDiff > 0.2) finalZoom = 11;
          else if (routeMaxDiff > 0.1) finalZoom = 12;
          else if (routeMaxDiff > 0.05) finalZoom = 13;
          else if (routeMaxDiff > 0.02) finalZoom = 14;
          else finalZoom = 15;

          const optimal = { latitude: routeCenterLat, longitude: routeCenterLng, zoom: finalZoom };
          setViewport((prev) => ({ ...prev, ...optimal }));
          setOptimalViewport(optimal);
        }
      } finally {
        if (!cancelled) setMapLoading(false);
      }
    };

    fetchRouteAndStops();
    return () => { cancelled = true; };
  }, [schedule?.id_tuyen_duong]);

  // WebSocket for real-time tracking
  useEffect(() => {
    if (!schedule || !isOpen) return;

    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:3000');
      
      ws.onopen = () => {
        setWsConnected(true);
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.id_nguoi_dung) {
          ws.send(JSON.stringify({ type: 'authenticate', userId: userData.id_nguoi_dung }));
        }
        ws.send(JSON.stringify({ type: 'subscribe_trip', tripId: parseInt(tripId) }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'bus_location_update' && message.data.id_chuyen_di === parseInt(tripId)) {
            setBusLocation({
              vi_do: parseFloat(message.data.vi_do),
              kinh_do: parseFloat(message.data.kinh_do),
              thoi_gian: message.data.thoi_gian
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = () => setWsConnected(false);
      ws.onclose = () => {
        setWsConnected(false);
        setTimeout(() => { if (schedule && isOpen) connectWebSocket(); }, 3000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'unsubscribe_trip', tripId: parseInt(tripId) }));
        }
        wsRef.current.close();
      }
    };
  }, [schedule, isOpen, tripId]);

  // Students grouped by stop
  const studentsByStop = useMemo(() => {
    if (!schedule?.diem_danh_chuyen_di) return [];
    
    const stopMap = new Map();
    stops.forEach((stop) => {
      if (!stopMap.has(stop.id_diem_dung)) {
        stopMap.set(stop.id_diem_dung, { ...stop, students: [] });
      }
    });

    schedule.diem_danh_chuyen_di.forEach((entry) => {
      const student = {
        id: entry.id_diem_danh,
        hoTen: entry.hoc_sinh?.ho_ten || 'Chưa rõ',
        trangThai: entry.trang_thai,
        lop: entry.hoc_sinh?.lop || '',
        id_diem_dung: entry.id_diem_dung
      };
      
      if (entry.id_diem_dung && stopMap.has(entry.id_diem_dung)) {
        stopMap.get(entry.id_diem_dung).students.push(student);
      }
    });

    return Array.from(stopMap.values()).sort((a, b) => a.displayOrder - b.displayOrder);
  }, [stops, schedule?.diem_danh_chuyen_di]);

  // Handle attendance update
  const handleAttendanceUpdate = async (attendanceId, targetStatus) => {
    setAttendanceError(null);
    setAttendanceUpdating((prev) => ({ ...prev, [attendanceId]: true }));

    const previousStatus = schedule.diem_danh_chuyen_di.find(e => e.id_diem_danh === attendanceId)?.trang_thai;

    setSchedule((prev) => ({
      ...prev,
      diem_danh_chuyen_di: prev.diem_danh_chuyen_di?.map((entry) =>
        entry.id_diem_danh === attendanceId ? { ...entry, trang_thai: targetStatus } : entry
      )
    }));

    try {
      await ChuyenDiService.updateTrangThaiDiemDanh(attendanceId, targetStatus);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Cập nhật thất bại.';
      setAttendanceError(message);
      setSchedule((prev) => ({
        ...prev,
        diem_danh_chuyen_di: prev.diem_danh_chuyen_di?.map((entry) =>
          entry.id_diem_danh === attendanceId ? { ...entry, trang_thai: previousStatus } : entry
        )
      }));
    } finally {
      setAttendanceUpdating((prev) => {
        const updated = { ...prev };
        delete updated[attendanceId];
        return updated;
      });
    }
  };

  // Handle trip status update
  const handleTripStatusUpdate = async (newStatus) => {
    if (updatingStatus) return;
    
    setUpdatingStatus(true);
    try {
      await ChuyenDiService.updateTrangThaiChuyenDi(tripId, newStatus);
      setSchedule(prev => ({ ...prev, trang_thai: newStatus }));
      
      if (newStatus === 'hoan_thanh') {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Cập nhật trạng thái thất bại.';
      alert(message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle incident report
  const handleSendIncident = async () => {
    if (!incidentMessage.trim() || sendingIncident) return;
    
    setSendingIncident(true);
    try {
      // Lấy thông tin user từ localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      await ChuyenDiService.sendIncidentWarning(tripId, { 
        noi_dung: incidentMessage.trim(),
        id_nguoi_gui: userData.id_nguoi_dung
      });
      alert('✅ Đã gửi cảnh báo sự cố thành công!');
      setIncidentMessage('');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Gửi cảnh báo thất bại.';
      alert('❌ ' + message);
    } finally {
      setSendingIncident(false);
    }
  };

  const fitToBounds = () => {
    if (optimalViewport) {
      setViewport((prev) => ({ ...prev, ...optimalViewport }));
    }
  };

  if (!isOpen) return null;

  const completedStatus = schedule?.loai_chuyen_di === 'tra' ? 'da_tra' : 'da_don';
  const completedLabel = schedule?.loai_chuyen_di === 'tra' ? 'Đã trả' : 'Đã đón';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
              <FaBus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{schedule?.tuyen_duong?.ten_tuyen_duong || 'Chuyến đi'}</h2>
              <p className="text-sm opacity-90 flex items-center gap-2">
                {schedule?.xe_buyt?.bien_so_xe}
                {wsConnected && (
                  <span className="flex items-center gap-1 bg-green-500/30 px-2 py-0.5 rounded-full text-xs">
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                    Live
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-4">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
              activeTab === 'map'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaMapMarkedAlt />
            Bản đồ
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
              activeTab === 'attendance'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaUserCheck />
            Điểm danh
          </button>
          <button
            onClick={() => setActiveTab('incident')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
              activeTab === 'incident'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaExclamationTriangle />
            Sự cố
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <FaSpinner className="animate-spin text-4xl text-indigo-600" />
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Map Tab */}
              {activeTab === 'map' && (
                <div className="h-full p-4">
                  <div ref={mapContainerRef} className="relative h-full rounded-lg overflow-hidden shadow-inner">
                    {mapLoading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                        <FaSpinner className="animate-spin text-3xl text-indigo-600" />
                      </div>
                    )}

                    {optimalViewport && (
                      <button
                        onClick={fitToBounds}
                        className="absolute top-3 right-3 z-30 bg-white border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm font-medium"
                      >
                        <FaExpand />
                        Xem toàn cảnh
                      </button>
                    )}

                    <ReactMapGL
                      key={mapSizeKey}
                      {...viewport}
                      onViewportChange={setViewport}
                      goongApiAccessToken={import.meta.env.VITE_GOONG_MAPTILES_KEY}
                    >
                      {routeGeoJSON && (
                        <Source id="trip-route" type="geojson" data={routeGeoJSON}>
                          <Layer id="trip-route" type="line" paint={{ 'line-color': '#2563eb', 'line-width': 4 }} />
                        </Source>
                      )}

                      {stops.map((stop, index) => (
                        <Marker
                          key={stop.id_diem_dung}
                          latitude={parseFloat(stop.vi_do)}
                          longitude={parseFloat(stop.kinh_do)}
                        >
                          <div
                            className="relative cursor-pointer transform transition-transform hover:scale-110"
                            onClick={() => setSelectedStop(stop)}
                          >
                            <FaMapMarkerAlt
                              size={34}
                              className={
                                index === 0
                                  ? 'text-green-600 drop-shadow'
                                  : index === stops.length - 1
                                    ? 'text-red-600 drop-shadow'
                                    : 'text-blue-600 drop-shadow'
                              }
                            />
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-bold shadow">
                              {stop.displayOrder}
                            </div>
                          </div>
                        </Marker>
                      ))}

                      {busLocation && (
                        <Marker latitude={busLocation.vi_do} longitude={busLocation.kinh_do}>
                          <div className="relative animate-bounce">
                            <FaBus 
                              size={40} 
                              className="text-orange-500 drop-shadow-lg"
                              style={{ filter: 'drop-shadow(0 0 8px rgba(255, 165, 0, 0.6))' }}
                            />
                          </div>
                        </Marker>
                      )}

                      {selectedStop && (
                        <Popup
                          latitude={parseFloat(selectedStop.vi_do)}
                          longitude={parseFloat(selectedStop.kinh_do)}
                          onClose={() => setSelectedStop(null)}
                          closeOnClick={false}
                        >
                          <div className="text-xs">
                            <p className="font-semibold">{selectedStop.ten_diem_dung}</p>
                            <p className="text-gray-600">{selectedStop.dia_chi}</p>
                          </div>
                        </Popup>
                      )}
                    </ReactMapGL>
                  </div>
                </div>
              )}

              {/* Attendance Tab */}
              {activeTab === 'attendance' && (
                <div className="h-full overflow-y-auto p-4">
                  {attendanceError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {attendanceError}
                    </div>
                  )}

                  <div className="space-y-6">
                    {studentsByStop.map((stopGroup) => (
                      <div key={stopGroup.id_diem_dung} className="space-y-3">
                        <div className="sticky top-0 bg-gray-100 p-3 rounded-lg border border-gray-200 z-10">
                          <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                              #{stopGroup.displayOrder}
                            </span>
                            {stopGroup.ten_diem_dung}
                          </h3>
                        </div>

                        {stopGroup.students.length === 0 ? (
                          <p className="text-sm text-gray-500 italic ml-4">Không có học sinh</p>
                        ) : (
                          <div className="space-y-2">
                            {stopGroup.students.map((student) => {
                              const isUpdating = attendanceUpdating[student.id];
                              const statusColor =
                                student.trangThai === 'da_don' || student.trangThai === 'da_tra'
                                  ? 'bg-green-100 text-green-700'
                                  : student.trangThai === 'vang_mat'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700';

                              return (
                                <div
                                  key={student.id}
                                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusColor}`}>
                                      {student.trangThai === 'da_don' || student.trangThai === 'da_tra' ? (
                                        <FaCheck />
                                      ) : student.trangThai === 'vang_mat' ? (
                                        <FaUserTimes />
                                      ) : (
                                        <FaUserClock />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900">{student.hoTen}</p>
                                      <p className="text-xs text-gray-500">Lớp {student.lop}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleAttendanceUpdate(student.id, completedStatus)}
                                      disabled={isUpdating || student.trangThai === completedStatus}
                                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-300"
                                    >
                                      {completedLabel}
                                    </button>
                                    <button
                                      onClick={() => handleAttendanceUpdate(student.id, 'vang_mat')}
                                      disabled={isUpdating || student.trangThai === 'vang_mat'}
                                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-300"
                                    >
                                      Vắng
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Incident Tab */}
              {activeTab === 'incident' && (
                <div className="h-full overflow-y-auto p-6">
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <FaExclamationTriangle className="text-yellow-600 text-xl mt-1" />
                        <div>
                          <h3 className="font-bold text-yellow-800 mb-1">Báo cáo sự cố</h3>
                          <p className="text-sm text-yellow-700">
                            Gửi thông báo về sự cố đến admin và phụ huynh ngay lập tức
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả sự cố <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={incidentMessage}
                        onChange={(e) => setIncidentMessage(e.target.value)}
                        placeholder="Ví dụ: Xe bị hỏng giữa đường, cần hỗ trợ khẩn cấp..."
                        className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <button
                      onClick={handleSendIncident}
                      disabled={!incidentMessage.trim() || sendingIncident}
                      className="w-full py-3 px-6 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {sendingIncident ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <FaExclamationTriangle />
                          Gửi cảnh báo sự cố
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer - Trip Controls */}
        {!loading && !error && schedule && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Trạng thái: <span className={`font-bold ${
                  schedule.trang_thai === 'dang_di' ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {schedule.trang_thai === 'dang_di' ? 'Đang đi' : schedule.trang_thai}
                </span>
              </div>
              <div className="flex gap-3">
                {schedule.trang_thai === 'cho_khoi_hanh' && (
                  <button
                    onClick={() => handleTripStatusUpdate('dang_di')}
                    disabled={updatingStatus}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    <FaPlay />
                    Bắt đầu chuyến đi
                  </button>
                )}
                {schedule.trang_thai === 'dang_di' && (
                  <button
                    onClick={() => handleTripStatusUpdate('hoan_thanh')}
                    disabled={updatingStatus}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                  >
                    <FaStop />
                    Kết thúc chuyến đi
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveTripModal;