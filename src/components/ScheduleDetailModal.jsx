import React, { useState, useEffect } from 'react';
import {FaTimes, FaBus, FaUserTie, FaMapMarkerAlt, FaExpand } from 'react-icons/fa';
import ReactMapGL, { Source, Layer, Marker, Popup } from '@goongmaps/goong-map-react';
import polyline from '@mapbox/polyline';
import TuyenDuongService from '../services/tuyenDuongService';
// --- COMPONENT MODAL XEM CHI TIẾT LỊCH TRÌNH ---
const ScheduleDetailModal = ({ schedule, onClose }) => {
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [viewport, setViewport] = useState({ latitude: 10.7769, longitude: 106.7008, zoom: 12, width: '100%', height: '100%'});
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [optimalViewport, setOptimalViewport] = useState(null);

  // Lấy thông tin học sinh từ diem_danh_chuyen_di
  const students = schedule.diem_danh_chuyen_di?.map(dd => ({
    id_hoc_sinh: dd.id_hoc_sinh,
    ho_ten: dd.hoc_sinh?.ho_ten || 'N/A',
    trang_thai: dd.trang_thai,
    diem_don: dd.hoc_sinh?.diem_don_tra?.find(d => d.loai === 'diem_don')
  })) || [];

  useEffect(() => {
    const fetchRouteAndStops = async () => {
      if (!schedule.id_tuyen_duong) return;
      
      try {
        setLoading(true);
        // Fetch thông tin tuyến đường bao gồm các điểm dừng
        const response = await TuyenDuongService.getTuyenDuongById(schedule.id_tuyen_duong);
        
        if (response.success && response.data) {
          // Lấy danh sách điểm dừng và sắp xếp theo thứ tự
          const stopsData = response.data.tuyen_duong_diem_dung
            ?.sort((a, b) => a.thu_tu_diem_dung - b.thu_tu_diem_dung)
            .map(item => item.diem_dung)
            .filter(Boolean) || [];
          
          setStops(stopsData);
          console.log("Điểm dừng tải về:", stopsData);
          // Vẽ route trên bản đồ nếu có ít nhất 2 điểm dừng
          if (stopsData.length >= 2) {
            // Tính toán bounds để hiển thị tất cả các điểm
            const latitudes = stopsData.map(s => parseFloat(s.vi_do));
            const longitudes = stopsData.map(s => parseFloat(s.kinh_do));
            
            const maxLat = Math.max(...latitudes);
            const minLat = Math.min(...latitudes);
            const maxLng = Math.max(...longitudes);
            const minLng = Math.min(...longitudes);
            
            // Tính center point
            const centerLat = (maxLat + minLat) / 2;
            const centerLng = (maxLng + minLng) / 2;
            
            // Tính khoảng cách và zoom level phù hợp
            // Thêm padding 20% để tránh các điểm nằm sát mép
            const latDiff = (maxLat - minLat) * 1.4; // Thêm 40% padding
            const lngDiff = (maxLng - minLng) * 1.4;
            
            // Tính zoom level dựa trên khoảng cách
            // Formula gần đúng cho zoom level
            const maxDiff = Math.max(latDiff, lngDiff);
            let calculatedZoom = 13;
            
            if (maxDiff > 0.5) calculatedZoom = 10;
            else if (maxDiff > 0.2) calculatedZoom = 11;
            else if (maxDiff > 0.1) calculatedZoom = 12;
            else if (maxDiff > 0.05) calculatedZoom = 13;
            else if (maxDiff > 0.02) calculatedZoom = 14;
            else calculatedZoom = 15;
            
            setViewport(prev => ({
              ...prev,
              latitude: centerLat,
              longitude: centerLng,
              zoom: calculatedZoom
            }));

            // Fetch direction từ Goong API - Vẽ từng đoạn nhỏ
            console.log("Bắt đầu fetch route cho", stopsData.length, "điểm dừng");
            
            // Tạo array chứa tất cả các segments
            const allSegments = [];
            
            // Vẽ route từ điểm này đến điểm kế tiếp
            for (let i = 0; i < stopsData.length - 1; i++) {
              const origin = `${stopsData[i].vi_do},${stopsData[i].kinh_do}`;
              const destination = `${stopsData[i + 1].vi_do},${stopsData[i + 1].kinh_do}`;
              
              const url = `https://rsapi.goong.io/Direction?origin=${origin}&destination=${destination}&vehicle=car&api_key=${import.meta.env.VITE_GOONG_API_KEY}`;
              
              try {
                const response = await fetch(url);
                const data = await response.json();
                const segmentPolyline = data?.routes?.[0]?.overview_polyline?.points;
                
                if (segmentPolyline) {
                  const decoded = polyline.decode(segmentPolyline).map(c => [c[1], c[0]]);
                  allSegments.push(...decoded);
                  console.log(`Segment ${i+1}: ${stopsData[i].ten_diem_dung} -> ${stopsData[i+1].ten_diem_dung}`, decoded.length, "points");
                }
              } catch (error) {
                console.error(`Lỗi khi fetch segment ${i}:`, error);
                // Fallback: vẽ đường thẳng
                allSegments.push([parseFloat(stopsData[i].kinh_do), parseFloat(stopsData[i].vi_do)]);
                allSegments.push([parseFloat(stopsData[i+1].kinh_do), parseFloat(stopsData[i+1].vi_do)]);
              }
            }
            
            // Tạo GeoJSON từ tất cả các segments
            if (allSegments.length > 0) {
              setRouteGeoJSON({ 
                type: 'Feature', 
                geometry: { 
                  type: 'LineString', 
                  coordinates: allSegments 
                } 
              });
              console.log("Route hoàn chỉnh với", allSegments.length, "điểm");
              
              // Tính lại bounds bao gồm tất cả các điểm trên route
              const allLats = [...latitudes, ...allSegments.map(c => c[1])];
              const allLngs = [...longitudes, ...allSegments.map(c => c[0])];
              
              const routeMaxLat = Math.max(...allLats);
              const routeMinLat = Math.min(...allLats);
              const routeMaxLng = Math.max(...allLngs);
              const routeMinLng = Math.min(...allLngs);
              
              const routeCenterLat = (routeMaxLat + routeMinLat) / 2;
              const routeCenterLng = (routeMaxLng + routeMinLng) / 2;
              
              const routeLatDiff = (routeMaxLat - routeMinLat) * 1.3; // 30% padding
              const routeLngDiff = (routeMaxLng - routeMinLng) * 1.3;
              
              const routeMaxDiff = Math.max(routeLatDiff, routeLngDiff);
              let finalZoom = 13;
              
              if (routeMaxDiff > 0.5) finalZoom = 10;
              else if (routeMaxDiff > 0.2) finalZoom = 11;
              else if (routeMaxDiff > 0.1) finalZoom = 12;
              else if (routeMaxDiff > 0.05) finalZoom = 13;
              else if (routeMaxDiff > 0.02) finalZoom = 14;
              else finalZoom = 15;
              
              // Cập nhật viewport sau khi có route
              const optimalView = {
                latitude: routeCenterLat,
                longitude: routeCenterLng,
                zoom: finalZoom
              };
              
              setViewport(prev => ({
                ...prev,
                ...optimalView
              }));
              
              // Lưu lại viewport tối ưu để reset về sau
              setOptimalViewport(optimalView);
            }
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin tuyến đường:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRouteAndStops();
  }, [schedule.id_tuyen_duong]);

  // Hàm reset view về toàn cảnh
  const fitToBounds = () => {
    if (optimalViewport) {
      setViewport(prev => ({
        ...prev,
        ...optimalViewport
      }));
    }
  };
  
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Chi tiết lịch trình: {schedule.ten_tuyen_duong}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><FaTimes size={20} /></button>
        </div>
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
            <div className="md:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2">
                <div>
                    <h3 className='font-bold text-lg mb-2 text-gray-700'>Thông tin chuyến đi</h3>
                    <div className='space-y-2 text-sm bg-gray-50 p-3 rounded-lg'>
                        <p><strong>Ngày chạy:</strong> {new Date(schedule.ngay_chay).toLocaleDateString('vi-VN')}</p>
                        <p><strong>Giờ khởi hành:</strong> {schedule.gio_khoi_hanh}</p>
                        <p><strong>Loại chuyến:</strong> {schedule.loai_chuyen_di === 'don' ? 'Đón học sinh' : 'Trả học sinh'}</p>
                        <p><strong>Trạng thái:</strong> <span className={`px-2 py-1 rounded text-xs ${
                          schedule.trang_thai === 'hoan_thanh' ? 'bg-green-100 text-green-800' :
                          schedule.trang_thai === 'dang_di' ? 'bg-blue-100 text-blue-800' :
                          schedule.trang_thai === 'da_huy' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>{schedule.trang_thai}</span></p>
                        <p className='flex items-center gap-2'><FaBus className='text-gray-500'/> <strong>Xe buýt:</strong> {schedule.bien_so_xe}</p>
                        <p className='flex items-center gap-2'><FaUserTie className='text-gray-500'/> <strong>Tài xế:</strong> {schedule.ten_tai_xe}</p>
                    </div>
                </div>
                 <div>
                    <h3 className='font-bold text-lg mb-2 text-gray-700'>Danh sách học sinh ({students.length})</h3>
                    <div className='space-y-2'>
                        {students.length === 0 && (
                          <p className="text-sm text-gray-500 italic">Chưa có học sinh nào</p>
                        )}
                        {students.map(student => (
                            <div key={student.id_hoc_sinh} className="p-2 bg-indigo-50 rounded-md text-sm">
                              <p className="font-semibold text-indigo-800">{student.ho_ten}</p>
                              {student.diem_don && (
                                <p className="text-xs text-gray-600 mt-1">
                                  Điểm đón: {student.diem_don.dia_chi}
                                </p>
                              )}
                              <p className="text-xs mt-1">
                                <span className={`px-1.5 py-0.5 rounded ${
                                  student.trang_thai === 'da_don' || student.trang_thai === 'da_tra' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {student.trang_thai}
                                </span>
                              </p>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
            <div className='md:col-span-2 rounded-lg overflow-hidden border relative'>
                {loading && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Đang tải bản đồ...</p>
                    </div>
                  </div>
                )}
                
                {/* Nút Fit to Bounds */}
                {optimalViewport && (
                  <button
                    onClick={fitToBounds}
                    className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-200 hover:shadow-xl"
                    title="Hiển thị toàn bộ tuyến đường"
                  >
                    <FaExpand size={14} />
                    <span className="text-sm font-medium">Xem toàn cảnh</span>
                  </button>
                )}
                
                {/* Thông tin điểm dừng */}
                {stops.length > 0 && (
                  <div className="absolute bottom-4 left-4 z-10 bg-white px-3 py-2 rounded-lg shadow-lg">
                    <p className="text-xs text-gray-600">
                      Tuyến đường có <span className="font-bold text-blue-600">{stops.length}</span> điểm dừng
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Điểm đầu</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Điểm giữa</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Điểm cuối</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <ReactMapGL {...viewport} onViewportChange={setViewport} goongApiAccessToken={import.meta.env.VITE_GOONG_MAPTILES_KEY}>
                    {/* Vẽ route */}
                    {routeGeoJSON && (
                        <Source id="detail-route" type="geojson" data={routeGeoJSON}>
                            <Layer 
                              id="detail-route" 
                              type="line" 
                              paint={{ 
                                'line-color': '#2563eb', 
                                'line-width': 4,
                                'line-opacity': 0.8 
                              }} 
                            />
                        </Source>
                    )}
                    
                    {/* Hiển thị các điểm dừng */}
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
                            size={32} 
                            className={`${
                              index === 0 ? 'text-green-500' : 
                              index === stops.length - 1 ? 'text-red-500' : 
                              'text-blue-500'
                            } drop-shadow-lg`}
                          />
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs font-semibold whitespace-nowrap">
                            {index + 1}
                          </div>
                        </div>
                      </Marker>
                    ))}

                    {/* Popup khi click vào điểm dừng */}
                    {selectedStop && (
                      <Popup
                        latitude={parseFloat(selectedStop.vi_do)}
                        longitude={parseFloat(selectedStop.kinh_do)}
                        onClose={() => setSelectedStop(null)}
                        closeOnClick={false}
                        offsetTop={-15}
                      >
                        <div className="p-2">
                          <h3 className="font-bold text-sm mb-1">{selectedStop.ten_diem_dung}</h3>
                          <p className="text-xs text-gray-600">{selectedStop.dia_chi}</p>
                        </div>
                      </Popup>
                    )}
                </ReactMapGL>
            </div>
        </div>
      </div>
    </div>
  )
};
export default ScheduleDetailModal;