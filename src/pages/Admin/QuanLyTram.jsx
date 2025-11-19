import React, { useState, useMemo, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';
import ReactMapGL, { Marker } from '@goongmaps/goong-map-react';
import StopModal from '../../components/StopModal';
import diemDungService from '../../services/diemDungService';
// Note: Dữ liệu sẽ lấy từ API, sample chỉ dùng fallback khi lỗi




// --- COMPONENT CHÍNH QUẢN LÝ TRẠM ---
function QuanLyTram() {
  const [stops, setStops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStop, setSelectedStop] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stopToEdit, setStopToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [viewport, setViewport] = useState({
    latitude: 10.7769, longitude: 106.7008, zoom: 12, width: '100%', height: '100%'
  });
  
  // Ensure coordinates are valid numbers for the map/markers
  const normalizeStop = (s) => {
    const vi_do_num = Number(s?.vi_do);
    const kinh_do_num = Number(s?.kinh_do);
    return {
      ...s,
      ten_diem_dung: s?.ten_diem_dung || '',
      dia_chi: s?.dia_chi || '',
      vi_do: Number.isFinite(vi_do_num) ? vi_do_num : 10.7769,
      kinh_do: Number.isFinite(kinh_do_num) ? kinh_do_num : 106.7008,
    };
  };
  
  const filteredStops = useMemo(() => 
    stops.filter(stop => 
      (stop.ten_diem_dung || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stop.dia_chi || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [stops, searchTerm]);

  useEffect(() => {
    if (selectedStop) {
      setViewport(prev => ({...prev, latitude: selectedStop.vi_do, longitude: selectedStop.kinh_do, zoom: 15, transitionDuration: 500 }));
    }
  }, [selectedStop]);

  useEffect(() => {
    const fetchStops = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await diemDungService.list();
        const data = Array.isArray(res) ? res : (res?.data || []);
        const parsed = (data || []).map(normalizeStop);
        setStops(parsed);
        if (parsed.length > 0) setSelectedStop(parsed[0]);
      } catch (e) {
        console.error(e);
        setError(e?.message || 'Lỗi khi tải danh sách trạm');
      } finally {
        setLoading(false);
      }
    };
    fetchStops();
  }, []);

  const handleOpenModal = (stop = null) => {
    setStopToEdit(stop);
    setIsModalOpen(true);
  };
  
  const handleSaveStop = async (data) => {
    try {
      if (stopToEdit && stopToEdit.id_diem_dung) {
        const res = await diemDungService.update(stopToEdit.id_diem_dung, data);
        if (res?.success) {
          const updated = normalizeStop(res.data || {});
          setStops(prev => prev.map(s => s.id_diem_dung === stopToEdit.id_diem_dung ? updated : s));
          setStopToEdit(null);
          setIsModalOpen(false);
        } else {
          alert(res?.message || 'Cập nhật trạm thất bại');
        }
      } else {
        const res = await diemDungService.create(data);
        if (res?.success) {
          const created = normalizeStop(res.data || {});
          setStops(prev => [created, ...prev]);
          setIsModalOpen(false);
        } else {
          alert(res?.message || 'Tạo trạm thất bại');
        }
      }
    } catch (e) {
      console.error('Error saving stop:', e);
      alert(e?.response?.data?.message || e?.message || 'Lỗi khi lưu trạm');
    }
  };

  const handleEdit = (stop) => handleOpenModal(stop);

  const handleDelete = async (stop) => {
    if (!window.confirm('Bạn có chắc muốn xóa trạm này?')) return;
    const res = await diemDungService.softDelete(stop.id_diem_dung);
    if (res?.success) {
      setStops(prev => prev.filter(s => s.id_diem_dung !== stop.id_diem_dung));
    } else {
      alert(res?.message || 'Xóa trạm thất bại');
    }
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
              {loading ? (
                <div className='p-4 text-gray-600'>Đang tải danh sách trạm…</div>
              ) : error ? (
                <div className='p-4 text-red-600'>${'{'}error{'}'}</div>
              ) : (
                filteredStops.map(stop => (
                  <div key={stop.id_diem_dung} className={`p-4 border-b transition-colors ${selectedStop?.id_diem_dung === stop.id_diem_dung ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex-1 cursor-pointer' onClick={() => setSelectedStop(stop)}>
                        <p className="font-bold text-gray-900">{stop.ten_diem_dung}</p>
                        <p className="text-sm text-gray-500 truncate">{stop.dia_chi}</p>
                      </div>
                      <div className='flex items-center gap-3 shrink-0'>
                        <button className='text-blue-600 hover:text-blue-800' title='Sửa' onClick={() => handleEdit(stop)}>
                          <FaEdit />
                        </button>
                        <button className='text-red-600 hover:text-red-800' title='Xóa' onClick={() => handleDelete(stop)}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
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