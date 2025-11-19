import { FaTimes, FaExclamationTriangle, FaExchangeAlt, FaUserClock, FaCalendarTimes } from 'react-icons/fa';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="bg-amber-500 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaExclamationTriangle />
            Tài xế đang có lịch trình
          </h2>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <FaUserClock className="text-amber-600 mt-1 shrink-0" size={20} />
            <p className="text-sm text-amber-800">
              Tài xế <strong>{deletingDriver?.ho_ten}</strong> đang có <span className="font-bold">{trips.length}</span> chuyến đi chưa hoàn thành. 
              Vui lòng chọn tài xế thay thế để chuyển giao các chuyến này trước khi xóa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column: Select Replacement */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Chọn tài xế thay thế</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FaExchangeAlt />
                  </div>
                  <select 
                    value={selectedDriver ?? ''} 
                    onChange={(e) => setSelectedDriver(Number(e.target.value))} 
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  >
                    {candidates.length === 0 && <option value="">(Không có tài xế thay thế)</option>}
                    {candidates.map(c => (
                      <option key={c.id_nguoi_dung} value={c.id_nguoi_dung}>{c.ho_ten} ({c.ten_tai_khoan})</option>
                    ))}
                  </select>
                </div>
                {checking && <p className="text-xs text-gray-500 mt-1 ml-1">Đang kiểm tra trùng lịch...</p>}
                {checkError && <p className="text-xs text-red-600 mt-1 ml-1">{checkError}</p>}
              </div>

              {conflicts.length > 0 && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-2">
                    <FaCalendarTimes />
                    <span>Trùng lịch {conflicts.length} chuyến:</span>
                  </div>
                  <ul className="text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto custom-scrollbar pl-1">
                    {conflicts.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="mt-0.5">•</span>
                        <span>#{c.reassignTrip.id_chuyen_di} — {new Date(c.reassignTrip.ngay).toLocaleDateString()} {c.reassignTrip.gio_khoi_hanh}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column: Affected Trips */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Danh sách chuyến bị ảnh hưởng</label>
              <div className="h-64 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50 p-3 custom-scrollbar">
                {trips.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Không có chuyến nào.</p>
                ) : (
                  <ul className="space-y-2">
                    {trips.map(t => (
                      <li key={t.id_chuyen_di} className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm text-sm">
                        <div className="font-medium text-gray-900">#{t.id_chuyen_di} — {t.tuyen_duong?.ten_tuyen_duong || 'Tuyến chưa đặt tên'}</div>
                        <div className="text-gray-500 text-xs mt-1 flex items-center gap-2">
                          <span>{new Date(t.ngay).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{t.gio_khoi_hanh}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              onClick={onClose} 
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              disabled={!selectedDriver || checking || conflicts.length > 0}
              onClick={() => onConfirm(selectedDriver)}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title={conflicts.length > 0 ? 'Tài xế thay thế đang trùng lịch' : ''}
            >
              <FaExchangeAlt />
              Chuyển và Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplaceDriverModal;
