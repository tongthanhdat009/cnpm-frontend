import React, { useState, useEffect } from 'react';
import {FaTimes, FaBus, FaUserTie } from 'react-icons/fa';
import polyline from '@mapbox/polyline';
import ReactMapGL, { Source, Layer } from '@goongmaps/goong-map-react';
// --- COMPONENT MODAL XEM CHI TIẾT LỊCH TRÌNH ---
const ScheduleDetailModal = ({ schedule, onClose, allRoutes, allStops, allStudents, allBuses, allDrivers }) => {
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [viewport, setViewport] = useState({ latitude: 10.7769, longitude: 106.7008, zoom: 12, width: '100%', height: '100%'});

  const route = allRoutes.find(r => r.id_tuyen_duong === schedule.id_tuyen_duong);
  const bus = allBuses.find(b => b.id_xe_buyt === schedule.id_xe_buyt);
  const driver = allDrivers.find(d => d.id_ngu_dung === schedule.id_tai_xe);
  const students = schedule.hoc_sinh_ids.map(id => allStudents.find(s => s.id_hoc_sinh === id)).filter(Boolean);

  useEffect(() => {
    if (!route) return;
    const fetchRouteMap = async () => {
      const stopsOnRoute = route.diem_dung_ids.map(id => allStops.find(s => s.id_diem_dung === id)).filter(Boolean);
      if (stopsOnRoute.length < 2) return;

      const coords = stopsOnRoute.map(s => `${s.vi_do},${s.kinh_do}`);
      const origin = coords.shift();
      const destination = coords.pop();
      const waypoints = coords.join('|');
      let url = `https://rsapi.goong.io/Direction?origin=${origin}&destination=${destination}&vehicle=car&api_key=${import.meta.env.VITE_GOONG_API_KEY}`;
      if (waypoints) url += `&waypoints=${waypoints}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        const routePolyline = data?.routes?.[0]?.overview_polyline?.points;
        if (routePolyline) {
          const decoded = polyline.decode(routePolyline).map(c => [c[1], c[0]]);
          setRouteGeoJSON({ type: 'Feature', geometry: { type: 'LineString', coordinates: decoded } });
        }
      } catch (error) {
        console.error("Lỗi khi tải bản đồ chi tiết:", error);
      }
    };
    fetchRouteMap();
  }, [route, allStops]);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Chi tiết lịch trình: {route?.ten_tuyen_duong}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><FaTimes size={20} /></button>
        </div>
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
            <div className="md:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2">
                <div>
                    <h3 className='font-bold text-lg mb-2 text-gray-700'>Thông tin chuyến đi</h3>
                    <div className='space-y-2 text-sm bg-gray-50 p-3 rounded-lg'>
                        <p><strong>Ngày chạy:</strong> {new Date(schedule.ngay_chay).toLocaleDateString('vi-VN')}</p>
                        <p><strong>Giờ khởi hành:</strong> {schedule.gio_khoi_hanh}</p>
                        <p className='flex items-center gap-2'><FaBus className='text-gray-500'/> <strong>Xe buýt:</strong> {bus?.bien_so_xe}</p>
                        <p className='flex items-center gap-2'><FaUserTie className='text-gray-500'/> <strong>Tài xế:</strong> {driver?.ho_ten}</p>
                    </div>
                </div>
                 <div>
                    <h3 className='font-bold text-lg mb-2 text-gray-700'>Danh sách học sinh ({students.length})</h3>
                    <div className='space-y-2'>
                        {students.map(student => (
                            <div key={student.id_hoc_sinh} className="p-2 bg-indigo-50 rounded-md text-sm text-indigo-800">{student.ho_ten}</div>
                        ))}
                    </div>
                 </div>
            </div>
            <div className='md:col-span-2 rounded-lg overflow-hidden border'>
                <ReactMapGL {...viewport} onViewportChange={setViewport} goongApiAccessToken={import.meta.env.VITE_GOONG_MAPTILES_KEY}>
                    {routeGeoJSON && (
                        <Source id="detail-route" type="geojson" data={routeGeoJSON}>
                            <Layer id="detail-route" type="line" paint={{ 'line-color': '#2563eb', 'line-width': 5 }} />
                        </Source>
                    )}
                </ReactMapGL>
            </div>
        </div>
      </div>
    </div>
  )
};
export default ScheduleDetailModal;