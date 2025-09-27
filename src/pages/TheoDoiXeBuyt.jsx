import React, { useState, useEffect } from 'react';
import ReactMapGL, { Marker, Source, Layer } from '@goongmaps/goong-map-react';
import { FaBus, FaMapMarkerAlt, FaSchool, FaUserGraduate } from 'react-icons/fa';
import polyline from '@mapbox/polyline';
import '@goongmaps/goong-js/dist/goong-js.css';


// --- DỮ LIỆU MẪU (Mô phỏng dữ liệu của phụ huynh và con họ) ---
const parentData = {
  child: {
    name: 'Nguyễn Văn An',
    stop: { 
      name: 'Nhà văn hóa Thanh Niên',
      lat: 10.7820, 
      lng: 106.6950 
    }
  },
  bus: {
    id: 1,
    bienSo: '51B-123.45',
    taiXe: 'Nguyễn Văn A',
    sdtTaiXe: '090-123-4567',
  },
  school: {
    name: 'Trường THCS A',
    lat: 10.7769,
    lng: 106.7008
  }
};
// --- KẾT THÚC DỮ LIỆU MẪU ---


function TheoDoiXeBuyt() {
  const [viewport, setViewport] = useState({
    latitude: parentData.child.stop.lat,
    longitude: parentData.child.stop.lng,
    zoom: 14,
    width: '100%',
    height: '100%',
  });

  const [busLocation, setBusLocation] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [status, setStatus] = useState("Xe sắp khởi hành...");
  const [eta, setEta] = useState(null); // Estimated Time of Arrival

  // Lấy tuyến đường và bắt đầu mô phỏng
  useEffect(() => {
    const fetchRouteAndAnimate = async () => {
      // Lấy tuyến đường từ trường đến điểm đón của con
      const origin = `${parentData.school.lat},${parentData.school.lng}`;
      const destination = `${parentData.child.stop.lat},${parentData.child.stop.lng}`;
      const url = `https://rsapi.goong.io/Direction?origin=${origin}&destination=${destination}&vehicle=car&api_key=${import.meta.env.VITE_GOONG_API_KEY}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        const routePolyline = data?.routes?.[0]?.overview_polyline?.points;

        if (routePolyline) {
          const decoded = polyline.decode(routePolyline).map(coord => [coord[1], coord[0]]);
          setRouteGeoJSON({ type: 'Feature', geometry: { type: 'LineString', coordinates: decoded } });
          
          // Bắt đầu animation
          let step = 0;
          const interval = setInterval(() => {
            if (step >= decoded.length) {
              clearInterval(interval);
              setStatus(`Xe đã đến điểm đón!`);
              setEta('0 phút');
              return;
            }
            const [lng, lat] = decoded[step];
            setBusLocation({ lat, lng });

            // Cập nhật trạng thái và ETA (ước tính)
            const remainingStops = decoded.length - step;
            const estimatedMinutes = Math.ceil(remainingStops); // Giả lập: 2 giây/bước
            setStatus('Xe đang đến...');
            setEta(`${estimatedMinutes} phút`);

            step++;
          }, 2000); // Cập nhật vị trí mỗi 2 giây
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tuyến đường:", error);
        setStatus("Không thể tải dữ liệu tuyến đường.");
      }
    };

    fetchRouteAndAnimate();
  }, []);

  return (
    <div className="flex h-full max-h-[calc(100vh-8rem)] bg-white rounded-lg shadow-md overflow-hidden">
      {/* Cột thông tin và trạng thái */}
      <div className="w-1/3 border-r border-gray-200 p-4 flex flex-col">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">Theo dõi xe buýt</h2>
        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
          <FaUserGraduate size={24} className="text-indigo-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-800">{parentData.child.name}</p>
            <p className="text-sm text-gray-600">Điểm đón: {parentData.child.stop.name}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
            <p className="font-bold text-lg text-gray-900">{status}</p>
            {eta && <p className="text-2xl font-bold text-indigo-600">Dự kiến đến trong: {eta}</p>}
        </div>

        <div className="mt-auto pt-4 border-t">
          <p className="font-semibold text-gray-800 mb-2">Thông tin chuyến đi</p>
          <div className="space-y-2 text-sm">
            <p><strong>Biển số xe:</strong> {parentData.bus.bienSo}</p>
            <p><strong>Tài xế:</strong> {parentData.bus.taiXe}</p>
            <p><strong>SĐT Tài xế:</strong> {parentData.bus.sdtTaiXe}</p>
          </div>
        </div>
      </div>

      {/* Cột bản đồ */}
      <div className="w-2/3">
        <ReactMapGL
          {...viewport}
          onViewportChange={setViewport}
          goongApiAccessToken={import.meta.env.VITE_GOONG_MAPTILES_KEY}
        >
          {/* Lớp vẽ tuyến đường */}
          {routeGeoJSON && (
            <Source id="route" type="geojson" data={routeGeoJSON}>
              <Layer
                id="route" type="line"
                paint={{ 'line-color': '#007bff', 'line-width': 5, 'line-opacity': 0.8 }}
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              />
            </Source>
          )}

          {/* Marker cho trường học */}
          <Marker longitude={parentData.school.lng} latitude={parentData.school.lat}>
            <FaSchool size={28} className="text-red-600" title={parentData.school.name} />
          </Marker>

          {/* Marker cho điểm đón của con */}
          <Marker longitude={parentData.child.stop.lng} latitude={parentData.child.stop.lat}>
            <FaMapMarkerAlt size={28} className="text-green-600" title={parentData.child.stop.name}/>
          </Marker>

          {/* Marker cho xe buýt đang di chuyển */}
          {busLocation && (
            <Marker latitude={busLocation.lat} longitude={busLocation.lng}>
              <div className="p-2 rounded-full shadow-lg bg-indigo-500">
                <FaBus className="text-white" size={16}/>
              </div>
            </Marker>
          )}
        </ReactMapGL>
      </div>
    </div>
  );
}

export default TheoDoiXeBuyt;