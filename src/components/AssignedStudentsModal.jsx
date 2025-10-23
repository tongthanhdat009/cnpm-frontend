import React, { useState, useMemo, useEffect } from 'react';
import { FaTimes, FaSearch } from 'react-icons/fa';
import TuyenDuongService from '../services/tuyenDuongService';

const AssignedStudentsModal = ({ isOpen, onClose, route = {}, students = [], stops = [], onSave }) => {
  const [query, setQuery] = useState('');
  const normalizedStudents = useMemo(() => Array.isArray(students) ? students : [], [students]);

  // current route id (normalized)
  const routeId = useMemo(() => Number(route?.id_tuyen_duong ?? route?.id ?? 0), [route]);

  // Local selection state (tick/untick per student)
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Initialize selection from students: auto-tick if student assigned to current route
  const initialSelectedIds = useMemo(() => {
    const set = new Set();
    for (const s of normalizedStudents) {
      const sid = s.id_hoc_sinh ?? s.id;
      const assignments = Array.isArray(s.phan_cong_hoc_sinh)
        ? s.phan_cong_hoc_sinh
        : (Array.isArray(s.phan_cong) ? s.phan_cong : []);
      const isAssignedToRoute = assignments.some(a => Number(a.id_tuyen_duong ?? a.id) === routeId);
      if (isAssignedToRoute && sid != null) set.add(sid);
    }
    return set;
  }, [normalizedStudents, routeId]);

  useEffect(() => {
    // reset selections when route or student list changes or modal opens
    setSelectedIds(new Set(initialSelectedIds));
  }, [initialSelectedIds, isOpen]);

  const toggleStudent = (sid) => {
    // Optimistic toggle handled via handleToggleStudent (which calls API).
    // keep this function for compatibility but delegate to handler
    handleToggleStudent(sid);
  };

  const [pendingIds, setPendingIds] = useState(new Set());

  const handleToggleStudent = async (sid) => {
    if (sid == null) return;
    const rId = routeId;
    // optimistic UI: toggle locally
    const wasSelected = selectedIds.has(sid);
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(sid)) next.delete(sid); else next.add(sid);
      return next;
    });
    // mark pending
    setPendingIds(prev => new Set(prev).add(sid));

    try {
      if (!wasSelected) {
        // assign
        const res = await TuyenDuongService.assignStudentToRoute(rId, sid);
        if (!res || !res.success) {
          throw new Error(res?.error || 'Lỗi khi phân công học sinh');
        }
      } else {
        // unassign
        const res = await TuyenDuongService.unassignStudentFromRoute(rId, sid);
        if (!res || !res.success) {
          throw new Error(res?.error || 'Lỗi khi huỷ phân công học sinh');
        }
      }
    } catch (e) {
      // revert optimistic change
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (wasSelected) next.add(sid); else next.delete(sid);
        return next;
      });
      alert(e?.message || 'Lỗi khi cập nhật phân công');
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(sid);
        return next;
      });
    }
  };

  const filtered = useMemo(() => {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return normalizedStudents;
    return normalizedStudents.filter(s => {
      // try common fields
      const name = (s.ten_hoc_sinh || s.name || s.fullName || s.ten || '').toString().toLowerCase();
      const id = (s.id_hoc_sinh || s.id || s.ma_hoc_sinh || '').toString().toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }, [query, normalizedStudents]);

  // Build ordered stops for this route (from route.tuyen_duong_diem_dung)
  const routeStopsOrdered = useMemo(() => {
    const list = Array.isArray(route?.tuyen_duong_diem_dung) ? route.tuyen_duong_diem_dung.slice().sort((a, b) => (a.thu_tu_diem_dung || 0) - (b.thu_tu_diem_dung || 0)) : [];
    return list.map(item => {
      const sid = (item.id_diem_dung ?? item.id);
      const found = stops.find(st => String(st.id_diem_dung) === String(sid));
      return {
        id_diem_dung: sid,
        ten_diem_dung: found ? (found.ten_diem_dung || `#${sid}`) : (item.ten_diem_dung || `#${sid}`),
        raw: found || item,
      };
    });
  }, [route, stops]);

  // For each stop, compute students matching: student.id_diem_dung == stopId AND (unassigned OR assigned to this route)
  const studentsByStop = useMemo(() => {
    const map = new Map();
    const rId = routeId;
    for (const st of routeStopsOrdered) {
      map.set(st.id_diem_dung, []);
    }
    for (const s of filtered) {
      const sid = s.id_hoc_sinh ?? s.id;
      const studStopId = s.id_diem_dung ?? s.diem_dung?.id_diem_dung ?? s.diem_dung?.id;
      if (studStopId == null) continue;
      // only consider students whose stop is in the route
      const keyStr = String(studStopId);
      if (!Array.from(map.keys()).map(k => String(k)).includes(keyStr)) continue;
      const assignedArr = Array.isArray(s.phan_cong_hoc_sinh) ? s.phan_cong_hoc_sinh : (Array.isArray(s.phan_cong) ? s.phan_cong : []);
      const isUnassigned = assignedArr.length === 0;
      const isAssignedToRoute = assignedArr.some(a => Number(a.id_tuyen_duong ?? a.id) === Number(rId));
      if (isUnassigned || isAssignedToRoute) {
        const existing = map.get(studStopId) || map.get(String(studStopId)) || [];
        existing.push(s);
        map.set(studStopId, existing);
      }
    }
    return map;
  }, [filtered, routeStopsOrdered, routeId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white w-full max-w-6xl h-[92vh] sm:h-auto sm:max-h-[85vh] rounded-none sm:rounded-lg shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">Danh sách học sinh - {route.ten_tuyen_duong || route.name || `#${route.id_tuyen_duong || route.id || ''}`}</h3>
              <div className="text-xs sm:text-sm text-gray-500">Tổng: {normalizedStudents.length} học sinh</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 rounded hover:bg-gray-100"><FaTimes/></button>
          </div>
        </div>

        <div className="p-3 sm:p-4 flex-1 overflow-y-auto">
          {/* Route info card */}
          <div className="mb-4 p-3 sm:p-4 border rounded bg-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg sm:text-xl font-semibold">{route.ten_tuyen_duong || `#${route.id_tuyen_duong ?? route.id ?? ''}`}</div>
                <div className="text-sm sm:text-base text-gray-600">{route.mo_ta || '-'}</div>
                <div className="mt-2 text-sm sm:text-base text-gray-700 flex flex-wrap gap-x-6 gap-y-1">
                  <div>Quãng đường: <span className="font-medium">{route.quang_duong ?? '-'}</span></div>
                  <div>Thời gian dự kiến: <span className="font-medium">{route.thoi_gian_du_kien ?? '-'}</span></div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-sm sm:text-base text-gray-600">
              <div className="font-medium">Các trạm trên tuyến:</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {routeStopsOrdered.length === 0 && <div className="text-xs text-gray-500">Không có trạm</div>}
                {routeStopsOrdered.map(s => (
                  <div key={s.id_diem_dung} className="px-2 py-1 bg-white border rounded text-xs">{s.ten_diem_dung}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Tìm theo tên, mã hoặc phụ huynh..."
                className="w-full border rounded pl-10 pr-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FaSearch/></div>
            </div>
          </div>
          <div className="space-y-4">
            {routeStopsOrdered.length === 0 && (
              <div className="text-center text-gray-500">Tuyến chưa có trạm nào.</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routeStopsOrdered.map((st, idx) => {
              const key = st.id_diem_dung;
              const list = studentsByStop.get(key) || studentsByStop.get(String(key)) || [];
              return (
                <div key={key} className="border rounded p-3 sm:p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-base sm:text-lg">{idx + 1}. {st.ten_diem_dung}</div>
                    <div className="text-sm text-gray-500">{list.length} học sinh</div>
                  </div>
                  <div className="space-y-2">
                    {list.length === 0 && <div className="text-xs text-gray-500">Không có học sinh phù hợp ở trạm này</div>}
                    {list.map((s, i) => {
                      const name = s.ten_hoc_sinh || s.ho_ten || s.name || s.fullName || '-';
                      const note = s.ghi_chu || s.note || '';
                      const sid = s.id_hoc_sinh ?? s.id;
                      const isSelected = selectedIds.has(sid);
                      return (
                        <label key={sid ?? i} className={`p-2 rounded border flex items-start justify-between gap-3 cursor-pointer ${isSelected ? 'bg-green-50 border-green-300' : 'bg-white'}`}>
                          <div className="flex-1">
                            <div className="font-medium text-sm sm:text-base">{name} <span className="text-xs text-gray-500">({s.lop || s.class || ''})</span></div>
                            {/* Parent info intentionally hidden as requested */}
                            {note && <div className="text-xs text-red-600">Ghi chú: {note}</div>}
                          </div>
                          <div className="flex items-center gap-2">
                            {isSelected && <span className="hidden sm:inline text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">Đã chọn</span>}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleStudent(sid)}
                              disabled={pendingIds.has(sid)}
                              className="w-4 h-4 mt-1 accent-green-600"
                            />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600">Đã chọn: <span className="font-medium">{selectedIds.size}</span> học sinh</div>
          <div className="flex items-center gap-2 sm:gap-3 justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignedStudentsModal;
