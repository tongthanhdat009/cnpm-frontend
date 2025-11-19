import { FaTimes } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import ChuyenDiService from '../services/chuyenDiService';

const ReplaceDriverModal = ({ isOpen, onClose, trips = [], candidates = [], onConfirm, deletingDriver }) => {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [checking, setChecking] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [checkError, setCheckError] = useState('');

  useEffect(() => {
    // default select first candidate
    if (candidates && candidates.length > 0) setSelectedDriver(candidates[0].id_nguoi_dung);
    else setSelectedDriver(null);
    setConflicts([]);
    setCheckError('');
  }, [candidates, isOpen]);

  // Compute conflicts between deleting driver's trips and selected replacement driver's trips
  useEffect(() => {
    const run = async () => {
      if (!isOpen || !selectedDriver) {
        setConflicts([]);
        setCheckError('');
        return;
      }
      try {
        setChecking(true);
        setCheckError('');
        const res = await ChuyenDiService.getChuyenDiByTaiXe(selectedDriver);
        const repTrips = res?.data || [];
        const mkKey = (ngay, gio) => `${new Date(ngay).toDateString()}|${gio}`;
        const repSet = new Map();
        repTrips.forEach(rt => {
          const key = mkKey(rt.ngay, rt.gio_khoi_hanh);
          const arr = repSet.get(key) || [];
          arr.push(rt);
          repSet.set(key, arr);
        });
        const found = [];
        trips.forEach(t => {
          const key = mkKey(t.ngay, t.gio_khoi_hanh);
          const match = repSet.get(key);
          if (match && match.length > 0) {
            found.push({ reassignTrip: t, with: match });
          }
        });
        setConflicts(found);
      } catch (e) {
        console.error('Lỗi khi kiểm tra trùng lịch tài xế thay thế:', e);
        setCheckError('Không kiểm tra được lịch của tài xế thay thế. Vui lòng thử lại.');
      } finally {
        setChecking(false);
      }
    };
    run();
  }, [isOpen, selectedDriver, JSON.stringify(trips)]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Tài xế đang có lịch trình</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes /></button>
        </div>

        <p className="text-sm text-gray-700 mb-4">Tài xế <strong>{deletingDriver?.ho_ten}</strong> đang có {trips.length} chuyến. Vui lòng chọn tài xế thay thế để chuyển các chuyến này trước khi xóa.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn tài xế thay thế</label>
            <select value={selectedDriver ?? ''} onChange={(e) => setSelectedDriver(Number(e.target.value))} className="w-full p-2 border rounded">
              {candidates.length === 0 && <option value="">(Không có tài xế thay thế)</option>}
              {candidates.map(c => (
                <option key={c.id_nguoi_dung} value={c.id_nguoi_dung}>{c.ho_ten} ({c.ten_tai_khoan})</option>
              ))}
            </select>
            {checking && <p className="text-xs text-gray-500 mt-1">Đang kiểm tra trùng lịch...</p>}
            {checkError && <p className="text-xs text-red-600 mt-1">{checkError}</p>}
            {conflicts.length > 0 && (
              <div className="mt-2 p-2 rounded bg-red-50 border border-red-200">
                <p className="text-sm text-red-700 font-medium">Tài xế này đang trùng lịch với {conflicts.length} chuyến:</p>
                <ul className="mt-1 text-xs text-red-700 list-disc list-inside max-h-28 overflow-auto">
                  {conflicts.map((c, idx) => (
                    <li key={idx}>#{c.reassignTrip.id_chuyen_di} — {new Date(c.reassignTrip.ngay).toLocaleDateString()} {c.reassignTrip.gio_khoi_hanh}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh sách chuyến bị ảnh hưởng</label>
            <div className="h-40 overflow-auto border rounded p-2 bg-gray-50">
              {trips.length === 0 ? (
                <p className="text-sm text-gray-600">Không có chuyến nào.</p>
              ) : (
                <ul className="text-sm">
                  {trips.map(t => (
                    <li key={t.id_chuyen_di} className="mb-2">#{t.id_chuyen_di} — {t.tuyen_duong?.ten_tuyen_duong || 'Tuyến'} — {new Date(t.ngay).toLocaleDateString()} {t.gio_khoi_hanh}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
          <button
            disabled={!selectedDriver || checking || conflicts.length > 0}
            onClick={() => onConfirm(selectedDriver)}
            className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
            title={conflicts.length > 0 ? 'Tài xế thay thế đang trùng lịch' : ''}
          >
            Chuyển và xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplaceDriverModal;
