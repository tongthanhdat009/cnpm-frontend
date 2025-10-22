import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaArrowUp, FaArrowDown, FaGripVertical } from 'react-icons/fa';
import ReactMapGL, { Marker, Source, Layer } from '@goongmaps/goong-map-react';
import polyline from '@mapbox/polyline';
import DiemDungService from '../services/diemDuongService';

const UpdateRouteModal = ({ isOpen, onClose, onSave, allStops, routeToEdit, readOnly = false }) => {
  const [routeName, setRouteName] = useState('');
  const [routeDesc, setRouteDesc] = useState('');
  const [routeDistance, setRouteDistance] = useState('');
  const [routeEta, setRouteEta] = useState('');
  const [selectedStops, setSelectedStops] = useState([]);

  const [previewRoute, setPreviewRoute] = useState(null);
  const [viewport, setViewport] = useState({ latitude: 10.7769, longitude: 106.7008, zoom: 12 });

  useEffect(() => {
    let cancelled = false;
    const norm = (s) => ({ ...s, vi_do: s.vi_do == null ? s.vi_do : Number(s.vi_do), kinh_do: s.kinh_do == null ? s.kinh_do : Number(s.kinh_do) });
    const load = async () => {
      if (routeToEdit) {
        setRouteName(routeToEdit.ten_tuyen_duong || '');
        setRouteDesc(routeToEdit.mo_ta || '');
        setRouteDistance(routeToEdit.quang_duong ?? '');
        setRouteEta(routeToEdit.thoi_gian_du_kien ?? '');
        let diemDungIds = [];
        if (Array.isArray(routeToEdit.diem_dung_ids) && routeToEdit.diem_dung_ids.length > 0) {
          diemDungIds = routeToEdit.diem_dung_ids;
        } else if (Array.isArray(routeToEdit.tuyen_duong_diem_dung) && routeToEdit.tuyen_duong_diem_dung.length > 0) {
          diemDungIds = routeToEdit.tuyen_duong_diem_dung
            .slice()
            .sort((a, b) => (a.thu_tu_diem_dung || 0) - (b.thu_tu_diem_dung || 0))
            .map(item => item.id_diem_dung);
        }
        const present = allStops.filter(s => diemDungIds.includes(s.id_diem_dung));
        const presentIds = new Set(present.map(s => s.id_diem_dung));
        const missingIds = diemDungIds.filter(id => !presentIds.has(id));
        let fetched = [];
        if (missingIds.length > 0) {
          try {
            const results = await Promise.all(missingIds.map(id => DiemDungService.getDiemDungById(id)));
            fetched = results
              .map(res => (res && res.success ? res.data : null))
              .filter(Boolean);
          } catch (e) {
            console.warn('Could not fetch some missing stops:', e);
          }
        }
        const idToStop = [...present, ...fetched].reduce((acc, s) => { acc[s.id_diem_dung] = norm(s); return acc; }, {});
        const stopsInOrder = diemDungIds.map(id => idToStop[id]).filter(Boolean);
        if (!cancelled) setSelectedStops(stopsInOrder);
      } else {
        if (!cancelled) { setRouteName(''); setRouteDesc(''); setRouteDistance(''); setRouteEta(''); setSelectedStops([]); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [routeToEdit, isOpen, allStops]);

  const isStartStop = (stop) => stop && Number(stop.id_diem_dung) === 0;
  const isEndStop = (stop) => stop && Number(stop.id_diem_dung) === 1;

  useEffect(() => {
    if (readOnly) return; // don't alter selection in read-only
    if (!isOpen) return;
    if (!Array.isArray(selectedStops) || selectedStops.length === 0) return; // wait until selection is populated

    const norm = (s) => ({ ...s, vi_do: s.vi_do == null ? s.vi_do : Number(s.vi_do), kinh_do: s.kinh_do == null ? s.kinh_do : Number(s.kinh_do) });
    // Prefer start/end from allStops; fallback to what's already in selection
    const startFromAll = Array.isArray(allStops) ? allStops.find(s => Number(s.id_diem_dung) === 0) : null;
    const endFromAll = Array.isArray(allStops) ? allStops.find(s => Number(s.id_diem_dung) === 1) : null;
    const startSel = selectedStops.find(s => Number(s.id_diem_dung) === 0) || startFromAll;
    const endSel = selectedStops.find(s => Number(s.id_diem_dung) === 1) || endFromAll;
    if (!startSel || !endSel) return; // require both pinned stops available before rearranging

    const startN = norm(startSel); const endN = norm(endSel);
    const middle = (selectedStops || []).filter(s => !isStartStop(s) && !isEndStop(s));
    const arranged = [startN, ...middle, endN];
    const currIds = (selectedStops || []).map(s => s.id_diem_dung);
    const newIds = arranged.map(s => s.id_diem_dung);
    const changed = currIds.length !== newIds.length || currIds.some((v, i) => v !== newIds[i]);
    if (changed) setSelectedStops(arranged);
  }, [isOpen, allStops, selectedStops, readOnly]);

  useEffect(() => {
    if (selectedStops.length < 2) { setPreviewRoute(null); return; }
    const fetchSegmentedPreview = async () => {
      try {
        const allCoords = [];
        for (let i = 0; i < selectedStops.length - 1; i++) {
          const o = `${selectedStops[i].vi_do},${selectedStops[i].kinh_do}`;
          const d = `${selectedStops[i + 1].vi_do},${selectedStops[i + 1].kinh_do}`;
          if (!o || !d || o === d) continue;
          let url = `https://rsapi.goong.io/Direction?origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}&vehicle=car&api_key=${import.meta.env.VITE_GOONG_API_KEY}`;
          const res = await fetch(url);
          const json = await res.json();
          const points = json?.routes?.[0]?.overview_polyline?.points;
          if (points) {
            const segment = polyline.decode(points).map(c => [c[1], c[0]]);
            if (segment.length) { if (allCoords.length) segment.shift(); allCoords.push(...segment); }
          }
        }
        setPreviewRoute(allCoords.length ? { type: 'Feature', geometry: { type: 'LineString', coordinates: allCoords } } : null);
      } catch (e) { console.error('Failed to fetch segmented preview:', e); setPreviewRoute(null); }
    };
    fetchSegmentedPreview();
  }, [selectedStops]);

  // Only recompute distance/ETA if user really changed the stop order/selection.
  const userTouchedStopsRef = useRef(false);
  const prevSignatureRef = useRef('');
  useEffect(() => {
    const signature = JSON.stringify(selectedStops.map(s => s.id_diem_dung));
    const hasChanged = signature !== prevSignatureRef.current;
    // Skip recompute on first populate if route already has quang_duong/thoi_gian_du_kien
    const hasPrecomputed = routeToEdit && (routeToEdit.quang_duong != null || routeToEdit.thoi_gian_du_kien != null);
    if (hasChanged) {
      prevSignatureRef.current = signature;
      if (userTouchedStopsRef.current || !hasPrecomputed) {
        computeDistanceAndEta(selectedStops);
      }
    }
  }, [selectedStops]);

  if (!isOpen) return null;

  const handleStopSelection = (stop) => {
    if (readOnly) return;
    userTouchedStopsRef.current = true;
    if (Number(stop.id_diem_dung) === 0 || Number(stop.id_diem_dung) === 1) return;
    const exists = selectedStops.find(s => s.id_diem_dung === stop.id_diem_dung);
    if (exists) {
      setSelectedStops(selectedStops.filter(s => s.id_diem_dung !== stop.id_diem_dung));
    } else {
      const normalized = { ...stop, vi_do: stop.vi_do == null ? stop.vi_do : Number(stop.vi_do), kinh_do: stop.kinh_do == null ? stop.kinh_do : Number(stop.kinh_do) };
      const idxEnd = selectedStops.findIndex(s => Number(s.id_diem_dung) === 1);
      let newSel = [];
      if (idxEnd !== -1) newSel = [...selectedStops.slice(0, idxEnd), normalized, ...selectedStops.slice(idxEnd)];
      else newSel = [...selectedStops, normalized];
      setSelectedStops(newSel);
    }
  };

  async function computeDistanceAndEta(stops) {
    try {
      if (!stops || stops.length < 2) { setRouteDistance(''); setRouteEta(''); return; }
      for (const s of stops) { if (s.vi_do == null || s.kinh_do == null || !isFinite(Number(s.vi_do)) || !isFinite(Number(s.kinh_do))) return; }
      const toMeters = (distance) => { if (typeof distance === 'number' && isFinite(distance)) return distance; if (distance && typeof distance.value === 'number' && isFinite(distance.value)) return distance.value; if (typeof distance === 'string') { const km = distance.match(/([0-9]+(?:\.[0-9]+)?)\s*km/i); if (km) return Math.round(parseFloat(km[1]) * 1000); const m = distance.match(/([0-9]+)\s*m(?!in)/i); if (m) return parseInt(m[1], 10); } return 0; };
      const toSeconds = (duration) => { if (typeof duration === 'number' && isFinite(duration)) return duration; if (duration && typeof duration.value === 'number' && isFinite(duration.value)) return duration.value; if (typeof duration === 'string') { let total = 0; const h = duration.match(/([0-9]+)\s*h/i); const min = duration.match(/([0-9]+)\s*m/i); const s = duration.match(/([0-9]+)\s*s/i); if (h) total += parseInt(h[1], 10) * 3600; if (min) total += parseInt(min[1], 10) * 60; if (s) total += parseInt(s[1], 10); if (total > 0) return total; } return 0; };
      let totalDistance = 0; let totalDuration = 0;
      for (let i = 0; i < stops.length - 1; i++) {
        const o = `${stops[i].vi_do},${stops[i].kinh_do}`; const d = `${stops[i + 1].vi_do},${stops[i + 1].kinh_do}`; if (!o || !d || o === d) continue;
        let url = `https://rsapi.goong.io/Direction?origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}&vehicle=car&api_key=${import.meta.env.VITE_GOONG_API_KEY}`; const resp = await fetch(url);
        const data = await resp.json(); const route = data?.routes?.[0]; const legs = Array.isArray(route?.legs) ? route.legs : [];
        if (legs.length > 0) { legs.forEach(l => { totalDistance += toMeters(l.distance); totalDuration += toSeconds(l.duration); }); } else if (route) { totalDistance += toMeters(route.distance); totalDuration += toSeconds(route.duration); }
      }
      const meters = Number.isFinite(totalDistance) ? totalDistance : 0; const minutes = Math.round(((Number.isFinite(totalDuration) ? totalDuration : 0) / 60)); setRouteDistance(meters); setRouteEta(minutes);
    } catch {}
  }

  const moveStop = (index, direction) => {
    if (readOnly) return;
    userTouchedStopsRef.current = true;
    const newStops = [...selectedStops];
    const targetIndex = index + direction; if (targetIndex < 0 || targetIndex >= newStops.length) return;
    const idxStart = newStops.findIndex(s => Number(s.id_diem_dung) === 0); const idxEnd = newStops.findIndex(s => Number(s.id_diem_dung) === 1);
    if (index === idxStart || index === idxEnd) return; if (targetIndex === idxStart || targetIndex === idxEnd) return;
    [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]]; setSelectedStops(newStops);
  };

  const buildRouteData = () => ({
    ten_tuyen_duong: routeName,
    mo_ta: routeDesc,
    diem_dung_ids: selectedStops.map(s => s.id_diem_dung),
    quang_duong: routeDistance === '' ? null : Number(routeDistance),
    thoi_gian_du_kien: routeEta === '' ? null : Number(routeEta),
    ...(routeToEdit && routeToEdit.id_tuyen_duong ? { id_tuyen_duong: routeToEdit.id_tuyen_duong } : {}),
  });

  const handleUpdate = () => { const payload = buildRouteData(); onSave(payload); };

  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";
  const labelClasses = "block text-sm font-medium text-gray-700";
  const btnPrimaryClasses = "px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors";
  const btnSecondaryClasses = "px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition-colors";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa tuyến đường</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><FaTimes size={20} /></button>
        </div>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2">
          <div className="flex flex-col gap-6">
            <div>
              <label className={labelClasses}>Tên tuyến đường</label>
              <input type="text" value={routeName} onChange={e => setRouteName(e.target.value)} className={inputClasses}/>
            </div>
            <div>
              <label className={labelClasses}>Mô tả</label>
              <textarea value={routeDesc} onChange={e => setRouteDesc(e.target.value)} rows="3" className={inputClasses}></textarea>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gradient-to-r from-green-50 to-white rounded-md border border-green-100">
                <label className={`${labelClasses} text-green-700`}>Quãng đường</label>
                <div className="mt-1 text-lg font-semibold text-gray-900">{routeDistance !== '' && routeDistance !== null ? formatDistanceKm(routeDistance) : 'Tự tính'}</div>
                <div className="text-sm text-gray-500 mt-1">Dài hơn = tuyến phức tạp hơn</div>
              </div>
              <div className="p-3 bg-gradient-to-r from-indigo-50 to-white rounded-md border border-indigo-100">
                <label className={`${labelClasses} text-indigo-700`}>Thời gian dự kiến</label>
                <div className="mt-1 text-lg font-semibold text-gray-900">{routeEta !== '' && routeEta !== null ? formatDuration(routeEta) : 'Tự tính'}</div>
                <div className="text-sm text-gray-500 mt-1">Dựa trên lộ trình và mật độ giao thông</div>
              </div>
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
                      <button onClick={() => moveStop(index, -1)} disabled={readOnly || index === 0 || Number(stop.id_diem_dung) === 0 || Number(stop.id_diem_dung) === 1} className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"><FaArrowUp/></button>
                      <button onClick={() => moveStop(index, 1)} disabled={readOnly || index === selectedStops.length - 1 || Number(stop.id_diem_dung) === 0 || Number(stop.id_diem_dung) === 1} className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"><FaArrowDown/></button>
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
                        checked={Number(stop.id_diem_dung) === 0 || Number(stop.id_diem_dung) === 1 || selectedStops.some(s => s.id_diem_dung === stop.id_diem_dung)}
                        disabled={readOnly || Number(stop.id_diem_dung) === 0 || Number(stop.id_diem_dung) === 1}
                        onChange={() => handleStopSelection(stop)}
                      />
                      {stop.ten_diem_dung}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="relative rounded-lg overflow-hidden border shadow-sm aspect-square w-full self-start min-h-[320px]">
            <ReactMapGL className="absolute inset-0" width="100%" height="100%" {...viewport} onViewportChange={setViewport} goongApiAccessToken={import.meta.env.VITE_GOONG_MAPTILES_KEY}>
              {previewRoute && (
                <Source id="preview-route" type="geojson" data={previewRoute}>
                  <Layer id="preview-route" type="line" paint={{ 'line-color': '#0d9488', 'line-width': 5 }} />
                </Source>
              )}
              {selectedStops.map((stop, index) => (
                <Marker key={stop.id_diem_dung} longitude={Number(stop.kinh_do)} latitude={Number(stop.vi_do)}>
                  <div className="bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-lg">{index + 1}</div>
                </Marker>
              ))}
            </ReactMapGL>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4 pt-4 border-t">
          <button type="button" onClick={onClose} className={btnSecondaryClasses}>Hủy</button>
          <button type="button" onClick={handleUpdate} className={btnPrimaryClasses} disabled={false}>Cập nhật tuyến đường</button>
        </div>
      </div>
    </div>
  );
};

export default UpdateRouteModal;

// Helpers
function formatDistanceKm(meters) {
  const m = Number(meters) || 0; if (m < 1000) return `${m} m`;
  const km = m / 1000; const val = km >= 100 ? Math.round(km) : Math.round(km * 10) / 10; return `${val} km`;
}
function formatDuration(totalMinutes) {
  const mins = Number(totalMinutes) || 0; if (mins < 60) return `${mins} phút`;
  const h = Math.floor(mins / 60); const m = mins % 60; const mm = m.toString().padStart(2, '0'); return `${h}h ${mm}m`;
}
