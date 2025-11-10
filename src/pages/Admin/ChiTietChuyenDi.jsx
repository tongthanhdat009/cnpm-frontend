import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBus,
  FaUserTie,
  FaRoute,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaSpinner,
  FaMapMarkerAlt,
  FaExpand
} from 'react-icons/fa';
import ReactMapGL, { Source, Layer, Marker, Popup } from '@goongmaps/goong-map-react';
import polyline from '@mapbox/polyline';
import ChuyenDiService from '../../services/chuyenDiService';
import TuyenDuongService from '../../services/tuyenDuongService';
import BusTrackingService from '../../services/busTrackingService';

const initialViewport = {
  latitude: 10.8231,
  longitude: 106.6297,
  zoom: 11,
  width: '100%',
  height: '100%'
};

const formatDate = (value) => {
  if (!value) return 'Không xác định';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
};

const formatTime = (value) => {
  if (!value) return 'Không xác định';
  if (typeof value === 'string' && /^\d{2}:\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const STATUS_LABELS = {
  da_don: 'Đã đón',
  da_tra: 'Đã trả',
  vang_mat: 'Vắng mặt',
  chua_don: 'Chưa cập nhật',
  cho_don: 'Chờ đón'
};

const ChiTietChuyenDi = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [viewport, setViewport] = useState(initialViewport);
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [optimalViewport, setOptimalViewport] = useState(null);
  const mapContainerRef = useRef(null);
  const [mapSizeKey, setMapSizeKey] = useState(0);
  const [attendanceUpdating, setAttendanceUpdating] = useState({});
  const [attendanceError, setAttendanceError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [incidentLoading, setIncidentLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  const locationUpdateIntervalRef = useRef(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ChuyenDiService.getChuyenDiById(scheduleId);
        if (response?.success) {
          setSchedule(response.data);
        } else {
          setError(response?.message || 'Không tìm thấy chuyến đi.');
        }
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Không thể tải chi tiết chuyến đi.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (scheduleId) {
      fetchSchedule();
    }
  }, [scheduleId]);

  useEffect(() => {
    if (!schedule?.id_tuyen_duong) return;

    let cancelled = false;

    const fetchRouteAndStops = async () => {
      try {
        setMapLoading(true);
        setRouteGeoJSON(null);
        setOptimalViewport(null);
        const response = await TuyenDuongService.getTuyenDuongById(schedule.id_tuyen_duong);
        if (!response?.success || !response?.data || cancelled) return;

        const stopsData = response.data.tuyen_duong_diem_dung
          ?.sort((a, b) => a.thu_tu_diem_dung - b.thu_tu_diem_dung)
          .map((item, index) => {
            if (!item?.diem_dung) return null;
            const order = item.thu_tu_diem_dung ?? index + 1;
            return {
              id_tuyen_duong_diem_dung: item.id_tuyen_duong_diem_dung,
              id_diem_dung: item.diem_dung.id_diem_dung,
              ten_diem_dung: item.diem_dung.ten_diem_dung,
              dia_chi: item.diem_dung.dia_chi,
              vi_do: item.diem_dung.vi_do,
              kinh_do: item.diem_dung.kinh_do,
              thu_tu_diem_dung: order,
              displayOrder: index + 1
            };
          })
          .filter(Boolean) || [];

        if (cancelled) return;

        setStops(stopsData);
        setSelectedStop(null);

        if (stopsData.length < 2) return;

        const latitudes = stopsData.map((stop) => parseFloat(stop.vi_do));
        const longitudes = stopsData.map((stop) => parseFloat(stop.kinh_do));
        const maxLat = Math.max(...latitudes);
        const minLat = Math.min(...latitudes);
        const maxLng = Math.max(...longitudes);
        const minLng = Math.min(...longitudes);
        const centerLat = (maxLat + minLat) / 2;
        const centerLng = (maxLng + minLng) / 2;
        const latDiff = (maxLat - minLat) * 1.4;
        const lngDiff = (maxLng - minLng) * 1.4;
        const maxDiff = Math.max(latDiff, lngDiff);
        let calculatedZoom = 13;

        if (maxDiff > 0.5) calculatedZoom = 10;
        else if (maxDiff > 0.2) calculatedZoom = 11;
        else if (maxDiff > 0.1) calculatedZoom = 12;
        else if (maxDiff > 0.05) calculatedZoom = 13;
        else if (maxDiff > 0.02) calculatedZoom = 14;
        else calculatedZoom = 15;

        if (!cancelled) {
          setViewport((prev) => ({ ...prev, latitude: centerLat, longitude: centerLng, zoom: calculatedZoom }));
        }

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
          } catch (fetchError) {
            allSegments.push([parseFloat(stopsData[i].kinh_do), parseFloat(stopsData[i].vi_do)]);
            allSegments.push([parseFloat(stopsData[i + 1].kinh_do), parseFloat(stopsData[i + 1].vi_do)]);
          }

          if (cancelled) return;
        }

        if (allSegments.length > 0 && !cancelled) {
          setRouteGeoJSON({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: allSegments
            }
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
        if (!cancelled) {
          setMapLoading(false);
        }
      }
    };

    fetchRouteAndStops();

    return () => {
      cancelled = true;
    };
  }, [schedule?.id_tuyen_duong]);

  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return undefined;

    let timer = null;
    const updateSize = () => {
      const { clientWidth, clientHeight } = el;
      if (!clientWidth || !clientHeight) return;
      setMapSizeKey((prev) => prev + 1);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setMapSizeKey((prev) => prev + 1);
      }, 250);
    };

    updateSize();

    const ro = new ResizeObserver(() => updateSize());
    ro.observe(el);
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    return () => {
      try { ro.disconnect(); } catch {}
      if (timer) clearTimeout(timer);
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, []);

  // WebSocket connection cho real-time tracking
  useEffect(() => {
    if (!schedule || schedule.trang_thai !== 'dang_di') {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        setWsConnected(false);
      }
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
        locationUpdateIntervalRef.current = null;
      }
      return;
    }

    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:3000');
      
      ws.onopen = () => {
        // console.log('✅ WebSocket connected for bus tracking');
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
          console.log('📨 Message chi tiết chuyến di:', scheduleId);
          if (message.type === 'bus_location_update' && 
              message.data.id_chuyen_di === scheduleId) {
            console.log('📍 Received bus location update:', message.data);
            // Cập nhật state ngay lập tức
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

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setWsConnected(false);
      };

      ws.onclose = () => {
        console.log('❌ WebSocket disconnected');
        setWsConnected(false);
        
        setTimeout(() => {
          if (schedule?.trang_thai === 'dang_di') {
            connectWebSocket();
          }
        }, 3000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    // Lấy vị trí ban đầu từ database hoặc đặt ở điểm đầu tiên
    const fetchInitialLocation = async () => {
      try {
        const response = await BusTrackingService.getTripBusLocation(scheduleId);
        if (response.success && response.data.xe_buyt.vi_do && response.data.xe_buyt.kinh_do) {
          setBusLocation({
            vi_do: parseFloat(response.data.xe_buyt.vi_do),
            kinh_do: parseFloat(response.data.xe_buyt.kinh_do),
            thoi_gian: response.data.xe_buyt.lan_cap_nhat_cuoi
          });
        } else {
          // Nếu chưa có vị trí, đặt xe ở điểm đầu tiên của tuyến
          if (stops.length > 0) {
            const firstStop = stops[0];
            const initialLat = parseFloat(firstStop.vi_do);
            const initialLng = parseFloat(firstStop.kinh_do);
            
            setBusLocation({
              vi_do: initialLat,
              kinh_do: initialLng,
              thoi_gian: new Date().toISOString()
            });

            // Cập nhật vị trí ban đầu vào database
            if (schedule.xe_buyt?.id_xe_buyt) {
              await BusTrackingService.updateBusLocation(
                schedule.xe_buyt.id_xe_buyt,
                initialLat,
                initialLng
              );
            }
          }
        }
      } catch (error) {
        console.error('Error fetching initial bus location:', error);
        // Nếu lỗi, vẫn đặt xe ở điểm đầu tiên
        if (stops.length > 0) {
          const firstStop = stops[0];
          setBusLocation({
            vi_do: parseFloat(firstStop.vi_do),
            kinh_do: parseFloat(firstStop.kinh_do),
            thoi_gian: new Date().toISOString()
          });
        }
      }
    };

    fetchInitialLocation();

    // Mô phỏng xe di chuyển theo tuyến đường
    if (schedule.xe_buyt?.id_xe_buyt && routeGeoJSON?.geometry?.coordinates) {
      const routeCoordinates = routeGeoJSON.geometry.coordinates;
      let currentStepIndex = 0;

      // Tìm điểm bắt đầu gần nhất trên tuyến (nếu xe đã có vị trí)
      const findNearestPoint = () => {
        let minDistance = Infinity;
        let nearestIndex = 0;
        
        // Sử dụng busLocation hiện tại từ state
        const currentBusLoc = busLocation;
        if (currentBusLoc) {
          routeCoordinates.forEach((coord, index) => {
            const [lng, lat] = coord;
            const distance = Math.sqrt(
              Math.pow(lat - currentBusLoc.vi_do, 2) + 
              Math.pow(lng - currentBusLoc.kinh_do, 2)
            );
            if (distance < minDistance) {
              minDistance = distance;
              nearestIndex = index;
            }
          });
        }
        return nearestIndex;
      };

      currentStepIndex = findNearestPoint();
      
      // console.log(`🚀 Bắt đầu mô phỏng từ điểm ${currentStepIndex}/${routeCoordinates.length}`);

      locationUpdateIntervalRef.current = setInterval(async () => {
        if (currentStepIndex >= routeCoordinates.length) {
          // Đã đến cuối tuyến, dừng mô phỏng
          clearInterval(locationUpdateIntervalRef.current);
          // console.log('🏁 Xe đã hoàn thành tuyến đường');
          return;
        }

        const [newLng, newLat] = routeCoordinates[currentStepIndex];
        
        try {
          await BusTrackingService.updateBusLocation(
            schedule.xe_buyt.id_xe_buyt,
            newLat,
            newLng
          );
          // console.log(`🚌 Xe di chuyển đến vị trí ${currentStepIndex}/${routeCoordinates.length}: [${newLat.toFixed(6)}, ${newLng.toFixed(6)}]`);
        } catch (error) {
          console.error('Error updating bus location:', error);
        }

        currentStepIndex += 1; // Di chuyển đến điểm tiếp theo
      }, 3000); // Cập nhật mỗi 3 giây (tốc độ mô phỏng)
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
      }
    };
  }, [schedule, scheduleId, stops, routeGeoJSON]); // Bỏ busLocation khỏi dependency

  const stopLookup = useMemo(() => {
    const map = new Map();
    stops.forEach((stop) => {
      if (stop.id_diem_dung !== undefined && !map.has(stop.id_diem_dung)) {
        map.set(stop.id_diem_dung, stop);
      }
    });
    return map;
  }, [stops]);

  const routeStopOrderMap = useMemo(() => {
    const map = new Map();
    schedule?.tuyen_duong?.tuyen_duong_diem_dung?.forEach((item) => {
      if (item?.id_diem_dung !== undefined && !map.has(item.id_diem_dung)) {
        map.set(item.id_diem_dung, item.thu_tu_diem_dung);
      }
    });
    return map;
  }, [schedule?.tuyen_duong?.tuyen_duong_diem_dung]);

  const students = useMemo(
    () => (
      schedule?.diem_danh_chuyen_di?.map((entry) => {
        const stopFromLookup = entry.id_diem_dung !== undefined ? stopLookup.get(entry.id_diem_dung) : null;
        let fallbackStop = null;

        if (!stopFromLookup && entry.diem_dung) {
          const fallbackOrder = routeStopOrderMap.get(entry.diem_dung.id_diem_dung) ?? null;
          fallbackStop = {
            id_diem_dung: entry.diem_dung.id_diem_dung,
            ten_diem_dung: entry.diem_dung.ten_diem_dung,
            dia_chi: entry.diem_dung.dia_chi,
            displayOrder: fallbackOrder,
            thu_tu_diem_dung: fallbackOrder
          };
        }

        return {
          id: entry.id_diem_danh,
          hoTen: entry.hoc_sinh?.ho_ten || 'Chưa rõ',
          trangThai: entry.trang_thai,
          lop: entry.hoc_sinh?.lop || '',
          ghiChu: entry.hoc_sinh?.ghi_chu || '',
          stop: stopFromLookup || fallbackStop,
          lastUpdated: entry.thoi_gian
        };
      }) || []
    ),
    [routeStopOrderMap, schedule?.diem_danh_chuyen_di, stopLookup]
  );

  const attendanceStats = useMemo(() => {
    const base = { da_don: 0, da_tra: 0, vang_mat: 0, chua_don: 0 };
    students.forEach((student) => {
      if (student.trangThai && base[student.trangThai] !== undefined) {
        base[student.trangThai] += 1;
      } else {
        base.chua_don += 1;
      }
    });
    return base;
  }, [students]);

  const totalStudents = students.length;

  const studentsByStop = useMemo(() => {
    const stopMap = new Map();

    stops.forEach((stop) => {
      if (!stopMap.has(stop.id_diem_dung)) {
        stopMap.set(stop.id_diem_dung, { ...stop, students: [] });
      }
    });

    const unassigned = [];

    students.forEach((student) => {
      const stopId = student.stop?.id_diem_dung;
      if (stopId !== undefined && stopMap.has(stopId)) {
        stopMap.get(stopId).students.push(student);
      } else {
        unassigned.push(student);
      }
    });

    const orderedStops = Array.from(stopMap.values()).sort((a, b) => {
      const orderA = a.displayOrder ?? a.thu_tu_diem_dung ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.displayOrder ?? b.thu_tu_diem_dung ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

    if (unassigned.length > 0) {
      orderedStops.push({
        id_diem_dung: 'unassigned',
        ten_diem_dung: 'Học sinh chưa gán trạm',
        dia_chi: '',
        displayOrder: null,
        students: unassigned
      });
    }

    return orderedStops;
  }, [stops, students]);

  const handleBack = () => {
    navigate(-1);
  };

  const fitToBounds = () => {
    if (optimalViewport) {
      setViewport((prev) => ({ ...prev, ...optimalViewport }));
    }
  };

  const handleAttendanceUpdate = async (attendanceId, targetStatus, previousStatus) => {
    if (!schedule || targetStatus === previousStatus) return;

    setAttendanceError(null);
    setAttendanceUpdating((prev) => ({ ...prev, [attendanceId]: true }));

    setSchedule((prev) => ({
      ...prev,
      diem_danh_chuyen_di: prev.diem_danh_chuyen_di?.map((entry) =>
        entry.id_diem_danh === attendanceId ? { ...entry, trang_thai: targetStatus } : entry
      )
    }));

    try {
      await ChuyenDiService.updateTrangThaiDiemDanh(attendanceId, targetStatus);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Cập nhật trạng thái điểm danh thất bại.';
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

  const handleUpdateTripStatus = async (newStatus) => {
    if (!schedule || schedule.trang_thai === newStatus) return;

    try {
      setStatusError(null);
      setStatusUpdating(true);
      await ChuyenDiService.updateTrangThaiChuyenDi(schedule.id_chuyen_di, newStatus);
      setSchedule((prev) => ({
        ...prev,
        trang_thai: newStatus
      }));
      
      if (newStatus === 'dang_di') {
        alert('Chuyến đi đã bắt đầu. Hệ thống đang theo dõi vị trí xe buýt real-time.');
      } else {
        alert('Cập nhật trạng thái chuyến đi thành công.');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Cập nhật trạng thái chuyến đi thất bại.';
      setStatusError(message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleIncidentWarning = async () => {
    if (!schedule) return;

    const noiDung = window.prompt('Nhập nội dung cảnh báo sự cố (ví dụ: xe bị hỏng, kẹt xe, ...):');
    if (!noiDung || !noiDung.trim()) {
      return;
    }

    try {
      setStatusError(null);
      setIncidentLoading(true);
      await ChuyenDiService.sendIncidentWarning(schedule.id_chuyen_di, {
        noi_dung: noiDung.trim()
      });
      alert('Đã gửi cảnh báo sự cố tới hệ thống.');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Gửi cảnh báo sự cố thất bại.';
      setStatusError(message);
    } finally {
      setIncidentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button onClick={handleBack} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6">
          <FaArrowLeft />
          <span>Quay lại lịch trình</span>
        </button>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!schedule) {
    return null;
  }

  const displayDate = formatDate(schedule.ngay_chay || schedule.ngay);
  const displayTime = formatTime(schedule.gio_khoi_hanh);
  const tripType = schedule.loai_chuyen_di === 'don' ? 'Đón học sinh' : 'Trả học sinh';
  const completedStatus = schedule.loai_chuyen_di === 'tra' ? 'da_tra' : 'da_don';
  const completedLabel = schedule.loai_chuyen_di === 'tra' ? 'Đã trả' : 'Đã đón';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-6">
        <button 
          onClick={handleBack} 
          className="group flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-all hover:gap-3"
        >
          <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
          <span>Quay lại lịch trình</span>
        </button>

        {schedule?.trang_thai === 'dang_di' && (
          <div className={`p-3 rounded-lg border ${wsConnected ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
              <span className="text-sm font-medium">
                {wsConnected ? '🟢 Đang theo dõi vị trí xe real-time' : '🟡 Đang kết nối...'}
              </span>
              {busLocation && (
                <span className="text-xs text-gray-600 ml-auto">
                  Cập nhật lúc: {new Date(busLocation.thoi_gian).toLocaleTimeString('vi-VN')}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {schedule.tuyen_duong?.ten_tuyen_duong || 'Chuyến đi'}
            </h1>
            <p className="text-gray-600 mt-1">
              {displayDate} • {displayTime} • {tripType}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleUpdateTripStatus('dang_di')}
              disabled={statusUpdating || schedule.trang_thai === 'dang_di'}
              className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Đang đi
            </button>
            <button
              type="button"
              onClick={() => handleUpdateTripStatus('hoan_thanh')}
              disabled={statusUpdating || schedule.trang_thai === 'hoan_thanh'}
              className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              Hoàn thành
            </button>
            <button
              type="button"
              onClick={handleIncidentWarning}
              disabled={incidentLoading}
              className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed"
            >
              Cảnh báo sự cố
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Tổng học sinh</p>
            <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <FaUserCheck className="text-gray-500" /> Đã hoàn tất
            </p>
            <p className="text-2xl font-bold text-gray-900">{attendanceStats.da_don + attendanceStats.da_tra}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <FaUserClock className="text-gray-500" /> Chưa cập nhật
            </p>
            <p className="text-2xl font-bold text-gray-900">{attendanceStats.chua_don}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <FaUserTimes className="text-gray-500" /> Vắng mặt
            </p>
            <p className="text-2xl font-bold text-gray-900">{attendanceStats.vang_mat}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin chuyến đi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border">
              <div>
                <p className="text-sm text-gray-600 font-medium">Trạng thái</p>
                <span className="inline-block mt-1 px-3 py-1 rounded-full bg-indigo-600 text-white text-sm font-semibold uppercase">
                  {schedule.trang_thai}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border">
              <div className="p-2 rounded-md bg-gray-100">
                <FaBus className="text-xl text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Xe buýt</p>
                <p className="text-lg font-bold text-gray-800">{schedule.xe_buyt?.bien_so_xe || 'Chưa gán'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border">
              <div className="p-2 rounded-md bg-gray-100">
                <FaUserTie className="text-xl text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Tài xế</p>
                <p className="text-lg font-bold text-gray-800">{schedule.nguoi_dung?.ho_ten || 'Chưa gán'}</p>
                <p className="text-sm text-gray-500">{schedule.nguoi_dung?.so_dien_thoai || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border md:col-span-2 lg:col-span-3">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium">Ghi chú</p>
                <p className="text-base text-gray-800 mt-1">{schedule.ghi_chu || 'Không có ghi chú'}</p>
              </div>
            </div>
          </div>
          
          {statusError && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
              <p className="font-medium">⚠️ {statusError}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Bản đồ tuyến đường</h2>
          <div ref={mapContainerRef} className="relative h-64 md:h-80 lg:h-96 overflow-hidden rounded-md">
            {mapLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                <div className="flex flex-col items-center gap-4">
                  <FaSpinner className="animate-spin text-3xl text-indigo-600" />
                  <p className="text-sm text-gray-600 font-medium">Đang tải bản đồ tuyến đường...</p>
                </div>
              </div>
            )}

            {optimalViewport && (
              <button
                onClick={fitToBounds}
                className="absolute top-3 right-3 z-30 bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-md shadow-sm flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <FaExpand className="text-gray-600" />
                Xem toàn cảnh
              </button>
            )}

            {stops.length > 0 && (
              <div className="absolute bottom-3 left-3 z-30 bg-white px-3 py-1.5 rounded-md shadow border text-xs font-medium text-gray-700">
                Tuyến đường gồm <strong className="text-gray-900">{stops.length}</strong> điểm dừng
              </div>
            )}

            <ReactMapGL
              key={mapSizeKey}
              {...viewport}
              onViewportChange={setViewport}
              goongApiAccessToken={import.meta.env.VITE_GOONG_MAPTILES_KEY}
            >
              {routeGeoJSON && (
                <Source id="trip-route" type="geojson" data={routeGeoJSON}>
                  <Layer id="trip-route" type="line" paint={{ 'line-color': '#2563eb', 'line-width': 4, 'line-opacity': 0.8 }} />
                </Source>
              )}

              {stops.map((stop, index) => (
                <Marker
                  key={stop.id_tuyen_duong_diem_dung || stop.id_diem_dung || index}
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
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-semibold shadow">
                      {stop.displayOrder || index + 1}
                    </div>
                  </div>
                </Marker>
              ))}

              {busLocation && schedule?.trang_thai === 'dang_di' && (
                <Marker
                  latitude={busLocation.vi_do}
                  longitude={busLocation.kinh_do}
                >
                  <div className="relative animate-bounce">
                    <FaBus 
                      size={40} 
                      className="text-orange-500 drop-shadow-lg"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(255, 165, 0, 0.6))' }}
                    />
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
                      {schedule.xe_buyt?.bien_so_xe || 'Xe buýt'}
                    </div>
                  </div>
                </Marker>
              )}

              {selectedStop && (
                <Popup
                  latitude={parseFloat(selectedStop.vi_do)}
                  longitude={parseFloat(selectedStop.kinh_do)}
                  onClose={() => setSelectedStop(null)}
                  closeOnClick={false}
                  offsetTop={-10}
                >
                  <div className="text-xs">
                    <p className="font-semibold mb-1">{selectedStop.ten_diem_dung}</p>
                    <p className="text-gray-600">{selectedStop.dia_chi}</p>
                  </div>
                </Popup>
              )}
            </ReactMapGL>
          </div>
        </div>

        {stops.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Hành trình chi tiết</h2>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{stops.length} trạm</span>
            </div>
            <ol className="relative border-l border-gray-200 space-y-4">
              {stops.map((stop) => (
                <li
                  key={stop.id_tuyen_duong_diem_dung || `${stop.id_diem_dung}-${stop.displayOrder}`}
                  className="relative pl-6"
                >
                  <span className="absolute left-0 transform -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-semibold">
                    {stop.displayOrder}
                  </span>
                  <p className="text-sm font-medium text-gray-800">{stop.ten_diem_dung}</p>
                  <p className="text-xs text-gray-600 mt-1">{stop.dia_chi}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Danh sách học sinh</h2>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{totalStudents} học sinh</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">Cập nhật trạng thái điểm danh trực tiếp</p>
          
          {attendanceError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
              <p className="font-medium">⚠️ {attendanceError}</p>
            </div>
          )}
          
          <div className="space-y-8">
            {studentsByStop.length === 0 && (
              <p className="text-center text-gray-500 italic py-8">Chưa có học sinh nào được gán vào chuyến đi này</p>
            )}
            {studentsByStop.map((stopGroup) => (
              <div
                key={stopGroup.id_tuyen_duong_diem_dung || stopGroup.id_diem_dung || 'unassigned'}
                className="space-y-4"
              >
                <div className="p-3 rounded-lg border bg-gray-50">
                  <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                      {stopGroup.displayOrder ? `#${stopGroup.displayOrder}` : '•'}
                    </span>
                    {stopGroup.ten_diem_dung}
                  </h3>
                  {stopGroup.dia_chi && (
                    <p className="text-xs text-gray-600 mt-1 ml-8">{stopGroup.dia_chi}</p>
                  )}
                </div>

                {stopGroup.students.length === 0 ? (
                  <p className="text-sm text-gray-500 italic ml-4">Chưa có học sinh nào tại trạm này</p>
                ) : (
                  <div className="space-y-3">
                    {stopGroup.students.map((student) => {
                      const currentStatus = student.trangThai;
                      const isUpdating = Boolean(attendanceUpdating[student.id]);

                      const statusChipClass =
                        currentStatus === 'da_don' || currentStatus === 'da_tra'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : currentStatus === 'vang_mat'
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : 'bg-yellow-100 text-yellow-700 border-yellow-200';

                      const statusLabel = STATUS_LABELS[currentStatus] || currentStatus || 'Chưa cập nhật';
                      const classLabel = student.lop ? `Lớp ${student.lop}` : 'Chưa cập nhật lớp';
                      const noteText = student.ghiChu && student.ghiChu.trim().length > 0 ? student.ghiChu : 'Không có ghi chú';

                      return (
                        <div
                          key={student.id}
                          className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between border border-gray-200 rounded-lg p-4 bg-white"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-gray-800 text-base">{student.hoTen}</p>
                              <span className="px-2 py-0.5 text-xs rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                                {classLabel}
                              </span>
                              <span className={`px-2 py-0.5 text-xs rounded border ${statusChipClass}`}>
                                {statusLabel}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              <strong>Ghi chú:</strong> {noteText}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 md:flex-nowrap">
                            <button
                              type="button"
                              onClick={() => handleAttendanceUpdate(student.id, completedStatus, currentStatus)}
                              disabled={isUpdating || currentStatus === completedStatus}
                              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"
                            >
                              {completedLabel}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttendanceUpdate(student.id, 'vang_mat', currentStatus)}
                              disabled={isUpdating || currentStatus === 'vang_mat'}
                              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed"
                            >
                              Vắng mặt
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttendanceUpdate(student.id, 'chua_don', currentStatus)}
                              disabled={isUpdating || currentStatus === 'chua_don'}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              Chưa cập nhật
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
      </div>
    </div>
  );
};

export default ChiTietChuyenDi;
