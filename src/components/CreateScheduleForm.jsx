import React, { useState } from 'react';
import ChuyenDiService from '../services/chuyenDiService';

const CreateScheduleForm = ({ routes = [], buses = [], drivers = [], onSubmit, onCancel }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [scheduleType, setScheduleType] = useState('single'); // 'single' hoặc 'recurring'

    const daysOfWeek = [
        { id: 1, label: 'T2' },
        { id: 2, label: 'T3' },
        { id: 3, label: 'T4' },
        { id: 4, label: 'T5' },
        { id: 5, label: 'T6' },
        { id: 6, label: 'T7' },
        { id: 0, label: 'CN' }
    ];
    const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";
    const labelClasses = "block text-sm font-medium text-gray-700";
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formEl = event.target;

        let recurringData;

        if (scheduleType === 'single') {
            // Tạo 1 ngày: ngày bắt đầu = ngày kết thúc
            const ngayDon = formEl.ngay_don.value;
            recurringData = {
                id_tai_xe: parseInt(formEl.id_tai_xe.value),
                id_tuyen_duong: parseInt(formEl.id_tuyen_duong.value),
                id_xe_buyt: parseInt(formEl.id_xe_buyt.value),
                loai_chuyen_di: formEl.loai_chuyen_di.value,
                gio_khoi_hanh: formEl.gio_khoi_hanh.value + ':00',
                ngay_bat_dau: ngayDon,
                ngay_ket_thuc: ngayDon,
                lap_lai_cac_ngay: [new Date(ngayDon).getDay()] // Lấy thứ của ngày đó
            };
        } else {
            // Tạo nhiều ngày: lấy ngày bắt đầu, kết thúc và các ngày trong tuần
            const selectedDays = Array.from(formEl.elements)
                .filter(el => el.name.startsWith('day-') && el.checked)
                .map(el => parseInt(el.value));

            if (selectedDays.length === 0) {
                setError('Vui lòng chọn ít nhất một ngày trong tuần');
                setIsSubmitting(false);
                return;
            }

            recurringData = {
                id_tai_xe: parseInt(formEl.id_tai_xe.value),
                id_tuyen_duong: parseInt(formEl.id_tuyen_duong.value),
                id_xe_buyt: parseInt(formEl.id_xe_buyt.value),
                loai_chuyen_di: formEl.loai_chuyen_di.value,
                gio_khoi_hanh: formEl.gio_khoi_hanh.value + ':00',
                ngay_bat_dau: formEl.ngay_bat_dau.value,
                ngay_ket_thuc: formEl.ngay_ket_thuc.value,
                lap_lai_cac_ngay: selectedDays
            };
        }

        console.log('=== DỮ LIỆU GỬI ĐI ===');
        console.log('Loại lịch trình:', scheduleType === 'single' ? 'Tạo 1 ngày' : 'Tạo nhiều ngày');
        console.log(JSON.stringify(recurringData, null, 2));
        console.log('=======================');

        try {
            const result = await ChuyenDiService.createRecurringChuyenDi(recurringData);
            
            if (result.success) {
                console.log('Kết quả từ server:', result);
                onSubmit(result.data || result.created, result.errors || []);
            } else {
                setError(result.message || 'Không thể tạo lịch trình');
            }
        } catch (err) {
            console.error('Lỗi khi tạo lịch trình:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo lịch trình';
            const errors = err.response?.data?.errors;
            
            if (errors && errors.length > 0) {
                const errorDetails = errors.map(e => `${e.ngay}: ${e.reason || e.error}`).join('\n');
                setError(`Có lỗi xảy ra:\n${errorDetails}`);
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderRouteOptions = () => {
        if (!Array.isArray(routes)) return null;
        return routes.map(r => (
            <option key={r.id_tuyen_duong} value={r.id_tuyen_duong}>
                {r.ten_tuyen_duong}
            </option>
        ));
    };

    const renderBusOptions = () => {
        if (!Array.isArray(buses)) return null;
        return buses.map(b => (
            <option key={b.id_xe_buyt} value={b.id_xe_buyt}>
                {b.bien_so_xe}
            </option>
        ));
    };

    const renderDriverOptions = () => {
        if (!Array.isArray(drivers)) return null;
        return drivers.map(d => (
            <option key={d.id_nguoi_dung} value={d.id_nguoi_dung}>
                {d.ho_ten}
            </option>
        ));
    };

    return (
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4">
            {/* Hiển thị lỗi nếu có */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg whitespace-pre-line">
                    {error}
                </div>
            )}

            {/* Loại lịch trình */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className={labelClasses + " mb-2"}>Loại lịch trình *</label>
                <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="schedule_type"
                            value="single"
                            checked={scheduleType === 'single'}
                            onChange={(e) => setScheduleType(e.target.value)}
                            disabled={isSubmitting}
                            className="mr-2"
                        />
                        <span className="text-sm font-medium">Tạo 1 ngày</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="schedule_type"
                            value="recurring"
                            checked={scheduleType === 'recurring'}
                            onChange={(e) => setScheduleType(e.target.value)}
                            disabled={isSubmitting}
                            className="mr-2"
                        />
                        <span className="text-sm font-medium">Tạo nhiều ngày (lặp lại)</span>
                    </label>
                </div>
            </div>

            {/* Tuyến đường */}
            <div>
                <label className={labelClasses}>Tuyến đường *</label>
                <select name="id_tuyen_duong" required className={inputClasses} disabled={isSubmitting}>
                    <option value="">Chọn tuyến đường</option>
                    {renderRouteOptions()}
                </select>
            </div>

            {/* Xe buýt */}
            <div>
                <label className={labelClasses}>Xe buýt *</label>
                <select name="id_xe_buyt" required className={inputClasses} disabled={isSubmitting}>
                    <option value="">Chọn xe buýt</option>
                    {renderBusOptions()}
                </select>
            </div>

            {/* Tài xế */}
            <div>
                <label className={labelClasses}>Tài xế *</label>
                <select name="id_tai_xe" required className={inputClasses} disabled={isSubmitting}>
                    <option value="">Chọn tài xế</option>
                    {renderDriverOptions()}
                </select>
            </div>

            {/* Loại chuyến đi */}
            <div>
                <label className={labelClasses}>Loại chuyến đi *</label>
                <select name="loai_chuyen_di" required className={inputClasses} defaultValue="don" disabled={isSubmitting}>
                    <option value="don">Đón học sinh</option>
                    <option value="tra">Trả học sinh</option>
                </select>
            </div>

            {/* Giờ khởi hành */}
            <div>
                <label className={labelClasses}>Giờ khởi hành *</label>
                <input type="time" name="gio_khoi_hanh" required className={inputClasses} disabled={isSubmitting} />
            </div>

            {/* Phần ngày tháng - Hiển thị theo loại lịch trình */}
            {scheduleType === 'single' ? (
                // Tạo 1 ngày
                <div className="pt-4 border-t">
                    <label className={labelClasses}>Ngày thực hiện *</label>
                    <input type="date" name="ngay_don" required className={inputClasses} disabled={isSubmitting} />
                    <p className="mt-1 text-xs text-gray-500">Chỉ tạo chuyến đi cho ngày này</p>
                </div>
            ) : (
                // Tạo nhiều ngày
                <>
                    {/* Ngày bắt đầu - Ngày kết thúc */}
                    <div className='grid grid-cols-2 gap-4 pt-4 border-t'>
                        <div>
                            <label className={labelClasses}>Từ ngày *</label>
                            <input type="date" name="ngay_bat_dau" required className={inputClasses} disabled={isSubmitting} />
                        </div>
                        <div>
                            <label className={labelClasses}>Đến ngày *</label>
                            <input type="date" name="ngay_ket_thuc" required className={inputClasses} disabled={isSubmitting} />
                        </div>
                    </div>

                    {/* Chọn ngày trong tuần */}
                    <div>
                        <label className={labelClasses}>Lặp lại vào các ngày *</label>
                        <div className="mt-2 flex justify-between items-center gap-1">
                            {daysOfWeek.map(day => (
                                <label key={day.id} className="flex-1 text-center">
                                    <input
                                        type="checkbox"
                                        name={`day-${day.id}`}
                                        value={day.id}
                                        className="peer hidden"
                                        disabled={isSubmitting}
                                    />
                                    <span className="block p-2 border rounded-md cursor-pointer peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:font-bold transition-colors hover:bg-indigo-50 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed">
                                        {day.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Chọn các ngày trong tuần để tạo chuyến đi</p>
                    </div>
                </>
            )}

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-4 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Đang tạo...' : 'Tạo lịch trình'}
                </button>
            </div>
        </form>
    );
};

export default CreateScheduleForm;
