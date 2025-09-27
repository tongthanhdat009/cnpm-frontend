import React, { useState, useEffect } from 'react';
import { FaTimes, FaArrowUp, FaArrowDown, FaGripVertical } from 'react-icons/fa';
import ReactMapGL, { Marker, Source, Layer } from '@goongmaps/goong-map-react';
import polyline from '@mapbox/polyline';
// --- COMPONENT MODAL ĐỂ THÊM/SỬA TUYẾN ĐƯỜNG ---
const RouteModal = ({ isOpen, onClose, onSave, allStops, routeToEdit }) => {
  const [routeName, setRouteName] = useState('');
  const [routeDesc, setRouteDesc] = useState('');
  const [selectedStops, setSelectedStops] = useState([]);

  const [previewRoute, setPreviewRoute] = useState(null);
  const [viewport, setViewport] = useState({
    latitude: 10.7769, longitude: 106.7008, zoom: 12, width: '100%', height: '100%'
  });
  
  useEffect(() => {
    if (routeToEdit) {
      setRouteName(routeToEdit.ten_tuyen_duong);
      setRouteDesc(routeToEdit.mo_ta);
      const stopsInOrder = routeToEdit.diem_dung_ids.map(id => allStops.find(s => s.id_diem_dung === id)).filter(Boolean);
      setSelectedStops(stopsInOrder);
    } else {
      setRouteName(''); setRouteDesc(''); setSelectedStops([]);
    }
  }, [routeToEdit, isOpen, allStops]);

  useEffect(() => {
    if (selectedStops.length < 2) {
      setPreviewRoute(null);
      return;
    }
    const fetchPreview = async () => {
      const coords = selectedStops.map(s => `${s.vi_do},${s.kinh_do}`);
      const origin = coords.shift();
      const destination = coords.pop();
      const waypoints = coords.join('|');
      
      let url = `https://rsapi.goong.io/Direction?origin=${origin}&destination=${destination}&vehicle=car&api_key=${import.meta.env.VITE_GOONG_API_KEY}`;
      if (waypoints) url += `&waypoints=${waypoints}`;

      const response = await fetch(url);
      const data = await response.json();
      const routePolyline = data?.routes?.[0]?.overview_polyline?.points;

      if (routePolyline) {
        const decoded = polyline.decode(routePolyline).map(c => [c[1], c[0]]);
        setPreviewRoute({ type: 'Feature', geometry: { type: 'LineString', coordinates: decoded } });
      }
    };
    fetchPreview();
  }, [selectedStops]);

  if (!isOpen) return null;

  const handleStopSelection = (stop) => {
    if (selectedStops.find(s => s.id_diem_dung === stop.id_diem_dung)) {
      setSelectedStops(selectedStops.filter(s => s.id_diem_dung !== stop.id_diem_dung));
    } else {
      setSelectedStops([...selectedStops, stop]);
    }
  };

  const moveStop = (index, direction) => {
    const newStops = [...selectedStops];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newStops.length) return;
    [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];
    setSelectedStops(newStops);
  };
  
  const handleSubmit = () => {
    const routeData = {
        ten_tuyen_duong: routeName,
        mo_ta: routeDesc,
        diem_dung_ids: selectedStops.map(s => s.id_diem_dung)
    };
    onSave(routeData);
  }

  // Định nghĩa các lớp CSS chung
  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";
  const labelClasses = "block text-sm font-medium text-gray-700";
  const btnPrimaryClasses = "px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors";
  const btnSecondaryClasses = "px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition-colors";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Tạo/Chỉnh sửa tuyến đường</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><FaTimes size={20} /></button>
        </div>
        
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2">
          {/* Cột thông tin và chọn trạm */}
          <div className="flex flex-col gap-6">
            <div>
              <label className={labelClasses}>Tên tuyến đường</label>
              <input type="text" value={routeName} onChange={e => setRouteName(e.target.value)} className={inputClasses}/>
            </div>
            <div>
              <label className={labelClasses}>Mô tả</label>
              <textarea value={routeDesc} onChange={e => setRouteDesc(e.target.value)} rows="3" className={inputClasses}></textarea>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-gray-800">Các trạm đã chọn (Kéo thả hoặc dùng nút để sắp xếp)</h3>
              <div className="p-3 border rounded-md min-h-[150px] space-y-2 bg-gray-50">
                {selectedStops.map((stop, index) => (
                    <div key={stop.id_diem_dung} className="flex justify-between items-center bg-white p-2 rounded shadow-sm border">
                        <div className='flex items-center gap-2'>
                            <FaGripVertical className="cursor-grab text-gray-400"/>
                            <span className="font-medium">{index + 1}. {stop.ten_diem_dung}</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => moveStop(index, -1)} disabled={index === 0} className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"><FaArrowUp/></button>
                            <button onClick={() => moveStop(index, 1)} disabled={index === selectedStops.length - 1} className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"><FaArrowDown/></button>
                        </div>
                    </div>
                ))}
                {selectedStops.length === 0 && <p className="text-gray-400 text-sm text-center py-10">Vui lòng chọn trạm từ danh sách bên dưới</p>}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-gray-800">Danh sách trạm có sẵn</h3>
              <div className="p-3 border rounded-md max-h-[200px] overflow-y-auto space-y-2 bg-gray-50">
                {allStops.map(stop => (
                  <div key={stop.id_diem_dung} className="p-2 rounded hover:bg-indigo-50 transition-colors">
                    <label className="flex items-center gap-3 cursor-pointer w-full">
                      <input 
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedStops.some(s => s.id_diem_dung === stop.id_diem_dung)}
                        onChange={() => handleStopSelection(stop)}
                      />
                      {stop.ten_diem_dung}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cột bản đồ preview */}
          <div className="rounded-lg overflow-hidden border shadow-sm">
            <ReactMapGL {...viewport} onViewportChange={setViewport} goongApiAccessToken={import.meta.env.VITE_GOONG_MAPTILES_KEY}>
                {previewRoute && (
                    <Source id="preview-route" type="geojson" data={previewRoute}>
                        <Layer id="preview-route" type="line" paint={{ 'line-color': '#0d9488', 'line-width': 5 }} />
                    </Source>
                )}
                {selectedStops.map((stop, index) => (
                    <Marker key={stop.id_diem_dung} longitude={stop.kinh_do} latitude={stop.vi_do}>
                        <div className="bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-lg">
                            {index + 1}
                        </div>
                    </Marker>
                ))}
            </ReactMapGL>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4 pt-4 border-t">
          <button type="button" onClick={onClose} className={btnSecondaryClasses}>Hủy</button>
          <button type="button" onClick={handleSubmit} className={btnPrimaryClasses}>Lưu tuyến đường</button>
        </div>
      </div>
    </div>
  );
};

export default RouteModal;