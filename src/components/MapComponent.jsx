import React, { useState, useEffect } from 'react';
import ReactMapGL, { Source, Layer, Marker } from '@goongmaps/goong-map-react';

// Import hàm fetchRoute từ file tiện ích (sẽ tạo ở dưới)
import { fetchGoongRoute } from './goongApi';

// Import CSS
import '@goongmaps/goong-js/dist/goong-js.css';

// Kiểu dáng cho đường đi
const layerStyle = {
  id: 'route',
  type: 'line',
  paint: {
    'line-color': '#007bff',
    'line-width': 8,
    'line-opacity': 0.8
  },
  layout: {
    'line-join': 'round',
    'line-cap': 'round'
  }
};

// Component Map giờ sẽ nhận props
function Map({ startAddress, endAddress }) {
  const [viewport, setViewport] = useState({
    width: '100vw',
    height: '100vh',
    latitude: 10.775,
    longitude: 106.696,
    zoom: 16
  });

  // Quản lý các trạng thái
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const GOONG_MAPTILES_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY;

  useEffect(() => {
    // Tạo một hàm async bên trong để có thể dùng try...catch
    const getRoute = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Gọi hàm tiện ích đã được tách riêng
        const routeData = await fetchGoongRoute(startAddress, endAddress);
        setRoute(routeData);

      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    getRoute();
  }, [startAddress, endAddress]); // Chạy lại hiệu ứng khi địa chỉ thay đổi

  // Hiển thị trạng thái Loading
  if (loading) {
    return <div style={{ padding: '20px' }}>Đang tải tuyến đường...</div>;
  }

  // Hiển thị trạng thái Lỗi
  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Lỗi: {error}</div>;
  }

  // Lấy tọa độ điểm đầu/cuối từ state `route`
  const startPoint = route?.geometry.coordinates[0];
  const endPoint = route?.geometry.coordinates[route.geometry.coordinates.length - 1];

  return (
    <ReactMapGL
      {...viewport}
      onViewportChange={setViewport}
      goongApiAccessToken={GOONG_MAPTILES_KEY}
    >
      {route && (
        <Source id="route-source" type="geojson" data={route}>
          <Layer {...layerStyle} />
        </Source>
      )}

      {startPoint && (
        <Marker longitude={startPoint[0]} latitude={startPoint[1]} offsetTop={-20} offsetLeft={-10}>
          <div style={{ color: 'green', fontSize: '24px' }}>📍</div>
        </Marker>
      )}

      {endPoint && (
        <Marker longitude={endPoint[0]} latitude={endPoint[1]} offsetTop={-20} offsetLeft={-10}>
          <div style={{ color: 'red', fontSize: '24px' }}>🏁</div>
        </Marker>
      )}
    </ReactMapGL>
  );
}

export default Map;