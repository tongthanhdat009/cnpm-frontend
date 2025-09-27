import React, { useState, useMemo, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import ReactMapGL, { Marker } from '@goongmaps/goong-map-react';
import StopModal from '../components/StopModal';
// --- DỮ LIỆU MẪU (Mô phỏng bảng diem_dung) ---
const sampleStops = [
  { id_diem_dung: 1, ten_diem_dung: 'Trường THCS A', dia_chi: '123 Võ Văn Tần, P. 6, Q. 3, TPHCM', vi_do: 10.7769, kinh_do: 106.7008 },
  { id_diem_dung: 2, ten_diem_dung: 'Nhà văn hóa Thanh Niên', dia_chi: '4 Phạm Ngọc Thạch, Bến Nghé, Q. 1, TPHCM', vi_do: 10.7820, kinh_do: 106.6950 },
  { id_diem_dung: 3, ten_diem_dung: 'Ngã tư Hàng Xanh', dia_chi: 'Điện Biên Phủ, P. 21, Q. Bình Thạnh, TPHCM', vi_do: 10.8010, kinh_do: 106.7090 },
  { id_diem_dung: 4, ten_diem_dung: 'Công viên Gia Định', dia_chi: 'Hoàng Minh Giám, P. 3, Q. Gò Vấp, TPHCM', vi_do: 10.8150, kinh_do: 106.6780 },
  { id_diem_dung: 5, ten_diem_dung: 'Chợ Bến Thành', dia_chi: 'Đ. Lê Lợi, P. Bến Thành, Q. 1, TPHCM', vi_do: 10.7725, kinh_do: 106.6980 },
];
// --- KẾT THÚC DỮ LIỆU MẪU ---




// --- COMPONENT CHÍNH QUẢN LÝ TRẠM ---
function QuanLyTram() {
  const [stops, setStops] = useState(sampleStops);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStop, setSelectedStop] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stopToEdit, setStopToEdit] = useState(null);

  const [viewport, setViewport] = useState({
    latitude: 10.7769, longitude: 106.7008, zoom: 12, width: '100%', height: '100%'
  });
  
  const filteredStops = useMemo(() => 
    stops.filter(stop => 
      stop.ten_diem_dung.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stop.dia_chi.toLowerCase().includes(searchTerm.toLowerCase())
    ), [stops, searchTerm]);

  useEffect(() => {
      if (selectedStop) {
        setViewport(prev => ({...prev, latitude: selectedStop.vi_do, longitude: selectedStop.kinh_do, zoom: 15, transitionDuration: 500 }));
      }
  }, [selectedStop]);

  const handleOpenModal = (stop = null) => {
    setStopToEdit(stop);
    setIsModalOpen(true);
  };
  
  const handleSaveStop = (data) => {
    if (stopToEdit) {
      // Logic sửa
      setStops(stops.map(s => s.id_diem_dung === stopToEdit.id_diem_dung ? { ...s, ...data } : s));
    } else {
      // Logic thêm mới
      const newStop = { ...data, id_diem_dung: Math.max(...stops.map(s => s.id_diem_dung)) + 1 };
      setStops([...stops, newStop]);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <StopModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveStop}
        stopToEdit={stopToEdit}
      />
      <div className="flex h-full max-h-[calc(100vh-8rem)] bg-white rounded-lg shadow-md">
        {/* Cột danh sách trạm */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className='p-4 border-b'>
                <h2 className="text-lg font-bold text-gray-800">Danh sách trạm</h2>
                <div className="relative mt-2">
                    <input type="text" placeholder="Tìm theo tên hoặc địa chỉ..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                    <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                </div>
            </div>
            <div className='flex-grow overflow-y-auto'>
                {filteredStops.map(stop => (
                    <div key={stop.id_diem_dung}
                        className={`p-4 border-b cursor-pointer transition-colors ${selectedStop?.id_diem_dung === stop.id_diem_dung ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                        onClick={() => setSelectedStop(stop)}>
                        <p className="font-bold text-gray-900">{stop.ten_diem_dung}</p>
                        <p className="text-sm text-gray-500 truncate">{stop.dia_chi}</p>
                    </div>
                ))}
            </div>
            <div className='p-4 border-t'>
                <button onClick={() => handleOpenModal()} className="w-full flex items-center justify-center gap-2 btn-primary">
                    <FaPlus /> Thêm trạm mới
                </button>
            </div>
        </div>

        {/* Cột bản đồ */}
        <div className="w-2/3">
          <ReactMapGL {...viewport} onViewportChange={setViewport} goongApiAccessToken={import.meta.env.VITE_GOONG_MAPTILES_KEY}>
            {filteredStops.map(stop => (
              <Marker key={stop.id_diem_dung} longitude={stop.kinh_do} latitude={stop.vi_do}>
                  <div onClick={() => setSelectedStop(stop)} className='cursor-pointer'>
                      <FaMapMarkerAlt size={28} className={selectedStop?.id_diem_dung === stop.id_diem_dung ? 'text-indigo-600' : 'text-red-500'}/>
                  </div>
              </Marker>
            ))}
          </ReactMapGL>
        </div>
      </div>
    </>
  );
}

export default QuanLyTram;

// Thêm các class dùng chung vào file tailwind.css nếu cần
// .btn-primary { @apply px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 ... }
// .btn-secondary { @apply px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 ... }