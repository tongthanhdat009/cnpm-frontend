import React, { useState, useEffect, useMemo } from 'react';
import {FaTimes} from 'react-icons/fa';
const ScheduleModal = ({ isOpen, onClose, onSave, routes, buses, drivers, allStudents, scheduleToEdit }) => {
    if (!isOpen) return null;

    const isEditMode = !!scheduleToEdit;
    const [formData, setFormData] = useState({});
    const [selectedRouteId, setSelectedRouteId] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                id_xe_buyt: scheduleToEdit.id_xe_buyt,
                id_tai_xe: scheduleToEdit.id_tai_xe,
            });
        } else {
            setFormData({});
            setSelectedRouteId('');
            setSelectedStudentIds([]);
        }
    }, [scheduleToEdit, isOpen]);
    
    const availableStudents = useMemo(() => {
        if (!selectedRouteId || isEditMode) return [];
        const selectedRoute = routes.find(r => r.id_tuyen_duong === parseInt(selectedRouteId));
        if (!selectedRoute) return [];
        // Sửa lỗi: Đảm bảo allStudents là một mảng trước khi filter
        return (allStudents || []).filter(student => selectedRoute.quan.includes(student.quan));
    }, [selectedRouteId, routes, allStudents, isEditMode]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRouteChange = (e) => {
        setSelectedRouteId(e.target.value);
        setSelectedStudentIds([]);
    };
    
    const handleStudentSelect = (studentId) => {
        setSelectedStudentIds(prev => 
            prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
        );
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      if (isEditMode) {
        const updatedSchedule = {
            ...scheduleToEdit,
            id_xe_buyt: parseInt(formData.id_xe_buyt),
            id_tai_xe: parseInt(formData.id_tai_xe),
        };
        onSave(updatedSchedule);
      } else {
        const formEl = event.target;
        const scheduleData = {
            id_tuyen_duong: parseInt(formEl.id_tuyen_duong.value),
            id_xe_buyt: parseInt(formEl.id_xe_buyt.value),
            id_tai_xe: parseInt(formEl.id_tai_xe.value),
            gio_khoi_hanh: formEl.gio_khoi_hanh.value,
            hoc_sinh_ids: selectedStudentIds
        };
        const startDate = new Date(formEl.ngay_bat_dau.value);
        const endDate = new Date(formEl.ngay_ket_thuc.value);
        const selectedDays = Array.from(formEl.elements)
          .filter(el => el.name.startsWith('day-') && el.checked)
          .map(el => parseInt(el.value));
        
        let newSchedules = [];
        endDate.setDate(endDate.getDate() + 1);
        for (let day = new Date(startDate); day < endDate; day.setDate(day.getDate() + 1)) {
          if (selectedDays.includes(day.getDay())) {
            newSchedules.push({ ...scheduleData, id_lich_trinh: Math.random(), ngay_chay: day.toISOString().split('T')[0] });
          }
        }
        onSave(newSchedules);
      }
    };
        
        const daysOfWeek = [ { id: 1, label: 'T2' }, { id: 2, label: 'T3' }, { id: 3, label: 'T4' }, { id: 4, label: 'T5' }, { id: 5, label: 'T6' }, { id: 6, label: 'T7' }, { id: 0, label: 'CN' }];
        const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";
        const labelClasses = "block text-sm font-medium text-gray-700";
    
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
              <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col">
                <div className="flex-shrink-0 flex justify-between items-center mb-4 pb-4 border-b">
                  <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Chỉnh Sửa Lịch Trình' : 'Tạo Lịch Trình Lặp Lại'}</h2>
                  <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><FaTimes size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4">
                    {!isEditMode && (
                        <>
                            <div><label className={labelClasses}>Tuyến đường</label><select name="id_tuyen_duong" required className={inputClasses} onChange={handleRouteChange}><option value="">Chọn tuyến đường</option>{routes.map(r => <option key={r.id_tuyen_duong} value={r.id_tuyen_duong}>{r.ten_tuyen_duong}</option>)}</select></div>
                        </>
                    )}
                    <div><label className={labelClasses}>Xe buýt</label><select name="id_xe_buyt" value={formData.id_xe_buyt || ''} onChange={handleFormChange} required className={inputClasses}>{buses.map(b => <option key={b.id_xe_buyt} value={b.id_xe_buyt}>{b.bien_so_xe}</option>)}</select></div>
                    <div><label className={labelClasses}>Tài xế</label><select name="id_tai_xe" value={formData.id_tai_xe || ''} onChange={handleFormChange} required className={inputClasses}>{drivers.map(d => <option key={d.id_nguoi_dung} value={d.id_nguoi_dung}>{d.ho_ten}</option>)}</select></div>
                    
                    {!isEditMode && (
                        <>
                            <div className='grid grid-cols-2 gap-4 pt-4 border-t'>
                                <div><label className={labelClasses}>Từ ngày</label><input type="date" name="ngay_bat_dau" required className={inputClasses} /></div>
                                <div><label className={labelClasses}>Đến ngày</label><input type="date" name="ngay_ket_thuc" required className={inputClasses} /></div>
                            </div>
                            <div>
                                <label className={labelClasses}>Lặp lại vào các ngày</label>
                                <div className="mt-2 flex justify-between items-center gap-1">{daysOfWeek.map(day => (<label key={day.id} className="flex-1 text-center"><input type="checkbox" name={`day-${day.id}`} value={day.id} className="peer hidden"/><span className="block p-2 border rounded-md cursor-pointer peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:font-bold transition-colors">{day.label}</span></label>))}</div>
                            </div>
                            <div><label className={labelClasses}>Giờ khởi hành</label><input type="time" name="gio_khoi_hanh" required className={inputClasses} /></div>
                            
                            {/* --- PHẦN THÊM MỚI: CHỌN HỌC SINH --- */}
                            <div>
                                <label className={labelClasses}>Phân công học sinh</label>
                                <div className="mt-2 p-2 border rounded-md max-h-40 overflow-y-auto bg-gray-50 space-y-1">
                                    {availableStudents.length > 0 ? availableStudents.map(student => (
                                        <label key={student.id_hoc_sinh} className="flex items-center gap-2 p-1 rounded hover:bg-indigo-100 cursor-pointer">
                                            <input type="checkbox" 
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                                                checked={selectedStudentIds.includes(student.id_hoc_sinh)}
                                                onChange={() => handleStudentSelect(student.id_hoc_sinh)} />
                                            {student.ho_ten}
                                        </label>
                                    )) : <p className="text-gray-500 text-sm text-center">Vui lòng chọn tuyến đường để xem học sinh</p>}
                                </div>
                            </div>
                        </>
                    )}
                    
                  <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Hủy</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{isEditMode ? 'Cập nhật' : 'Tạo lịch trình'}</button>
                  </div>
                </form>
              </div>
            </div>
        );
    };
export default ScheduleModal;
