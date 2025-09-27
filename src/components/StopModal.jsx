import React, { useState} from 'react';
import { useEffect } from 'react';
import { FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import ReactMapGL, { Marker } from '@goongmaps/goong-map-react';

// --- COMPONENT MODAL ĐỂ THÊM/SỬA TRẠM ---
const StopModal = ({ isOpen, onClose, onSave, stopToEdit }) => {
  const [stopData, setStopData] = useState({ ten_diem_dung: '', dia_chi: '', vi_do: 10.7769, kinh_do: 106.7008 });
  const [viewport, setViewport] = useState({
    latitude: 10.7769, longitude: 106.7008, zoom: 15, width: '100%', height: '100%'
  });
  
  useEffect(() => {
    if (stopToEdit) {
      setStopData(stopToEdit);
      setViewport(prev => ({ ...prev, latitude: stopToEdit.vi_do, longitude: stopToEdit.kinh_do }));
    } else {
      setStopData({ ten_diem_dung: '', dia_chi: '', vi_do: 10.7769, kinh_do: 106.7008 });
    }
  }, [stopToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStopData(prev => ({ ...prev, [name]: value }));
  };

  const handleMapClick = (event) => {
    const [lng, lat] = event.lngLat;
    setStopData(prev => ({ ...prev, vi_do: lat, kinh_do: lng }));
    setViewport(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };
  
  const handleSubmit = () => onSave(stopData);

  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{stopToEdit ? 'Chỉnh sửa trạm' : 'Tạo trạm mới'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><FaTimes size={20} /></button>
        </div>
        
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2">
          {/* Cột thông tin */}
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelClasses}>Tên trạm</label>
              <input type="text" name="ten_diem_dung" value={stopData.ten_diem_dung} onChange={handleChange} className={inputClasses}/>
            </div>
            <div>
              <label className={labelClasses}>Địa chỉ</label>
              <textarea name="dia_chi" value={stopData.dia_chi} onChange={handleChange} rows="3" className={inputClasses}></textarea>
            </div>
            <div className='grid grid-cols-2 gap-4'>
                <div>
                    <label className={labelClasses}>Vĩ độ (Latitude)</label>
                    <input type="number" name="vi_do" value={stopData.vi_do} onChange={handleChange} className={inputClasses}/>
                </div>
                <div>
                    <label className={labelClasses}>Kinh độ (Longitude)</label>
                    <input type="number" name="kinh_do" value={stopData.kinh_do} onChange={handleChange} className={inputClasses}/>
                </div>
            </div>
            <div className='p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800'>
                <strong>Mẹo:</strong> Bạn có thể click trực tiếp lên bản đồ bên cạnh để chọn tọa độ cho trạm.
            </div>
          </div>

          {/* Cột bản đồ */}
          <div className="rounded-lg overflow-hidden border">
            <ReactMapGL {...viewport} onViewportChange={setViewport} onClick={handleMapClick} goongApiAccessToken={import.meta.env.VITE_GOONG_MAPTILES_KEY}>
                <Marker longitude={stopData.kinh_do} latitude={stopData.vi_do}>
                    <FaMapMarkerAlt size={32} className="text-red-500" />
                </Marker>
            </ReactMapGL>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4 pt-4 border-t">
          <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
          <button type="button" onClick={handleSubmit} className="btn-primary">Lưu trạm</button>
        </div>
      </div>
    </div>
  );
};
export default StopModal;