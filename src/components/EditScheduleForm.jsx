import React, { useState, useEffect } from 'react';
import ChuyenDiService from '../services/chuyenDiService';

const EditScheduleForm = ({ schedule, buses = [], drivers = [], onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        id_xe_buyt: '',
        id_tai_xe: '',
        ngay: '',
        gio_khoi_hanh: '',
        trang_thai: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const statusOptions = [
        { value: 'cho_khoi_hanh', label: 'Chờ khởi hành' },
        { value: 'dang_di', label: 'Đang đi' },
        { value: 'hoan_thanh', label: 'Hoàn thành' },
        { value: 'da_huy', label: 'Đã hủy' },
        { value: 'bi_tre', label: 'Bị trễ' }
    ];

    const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";
    const labelClasses = "block text-sm font-medium text-gray-700";

    useEffect(() => {
        if (schedule) {
            // Chuyển đổi ngày về định dạng YYYY-MM-DD cho input date
            let ngayFormatted = '';
            if (schedule.ngay) {
                ngayFormatted = new Date(schedule.ngay).toISOString().split('T')[0];
            } else if (schedule.ngay_chay) {
                ngayFormatted = new Date(schedule.ngay_chay).toISOString().split('T')[0];
            }

            // Chuyển đổi giờ khởi hành về định dạng HH:mm
            let gioKhoiHanh = schedule.gio_khoi_hanh || '';
            if (gioKhoiHanh && gioKhoiHanh.length > 5) {
                gioKhoiHanh = gioKhoiHanh.substring(0, 5); // Lấy HH:mm từ HH:mm:ss
            }
            
            setFormData({
                id_xe_buyt: schedule.id_xe_buyt || '',
                id_tai_xe: schedule.id_tai_xe || '',
                ngay: ngayFormatted,
                gio_khoi_hanh: gioKhoiHanh,
                trang_thai: schedule.trang_thai || 'cho_khoi_hanh'
            });
        }
    }, [schedule]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Tạo object theo đúng định dạng JSON API yêu cầu
        const updatedData = {
            id_tai_xe: parseInt(formData.id_tai_xe),
            id_xe_buyt: parseInt(formData.id_xe_buyt),
            id_tuyen_duong: schedule.id_tuyen_duong, // Giữ nguyên từ schedule
            ngay: formData.ngay,
            gio_khoi_hanh: formData.gio_khoi_hanh + ':00', // Thêm :00 cho giây
            trang_thai: formData.trang_thai
        };

        try {
            const result = await ChuyenDiService.updateChuyenDi(schedule.id_chuyen_di, updatedData);
            
            if (result.success) {
                onSubmit(result.data);
            } else {
                setError(result.message || 'Không thể cập nhật chuyến đi');
            }
        } catch (err) {
            console.error('Lỗi khi cập nhật:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật';
            const errors = err.response?.data?.errors;
            
            if (errors && errors.length > 0) {
                // Hiển thị lỗi conflict
                const conflictMessages = errors.map(e => `${e.ngay}: ${e.reason}`).join('\n');
                setError(`Có xung đột lịch trình:\n${conflictMessages}`);
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Kiểm tra nếu chuyến đi đang đi thì khóa một số trường
    const isInProgress = schedule?.trang_thai === 'dang_di';
    // Kiểm tra nếu chuyến đi đã hoàn thành hoặc đã hủy thì khóa tất cả các trường
    const isFinishedOrCancelled = schedule?.trang_thai === 'hoan_thanh' || schedule?.trang_thai === 'da_huy';
    const disabledClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed";

    // Lọc các trạng thái được phép chọn dựa trên trạng thái hiện tại
    const getAvailableStatusOptions = () => {
        if (isInProgress) {
            // Nếu đang đi, chỉ cho phép chọn "Đang đi", "Hoàn thành" hoặc "Đã hủy"
            return statusOptions.filter(s => 
                s.value === 'dang_di' || s.value === 'hoan_thanh' || s.value === 'da_huy'
            );
        }
        return statusOptions;
    };

    return (
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4">
            {/* Hiển thị lỗi nếu có */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg whitespace-pre-line">
                    {error}
                </div>
            )}

            {/* Thông tin tuyến đường (Read-only) */}
            <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-700 mb-2">Thông tin chuyến đi</h3>
                <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Tuyến đường:</span> {schedule.ten_tuyen_duong}</p>
                    <p><span className="font-medium">Loại chuyến:</span> {schedule.loai_chuyen_di === 'don' ? 'Đón học sinh' : 'Trả học sinh'}</p>
                    {isInProgress && (
                        <p className="text-orange-600 font-semibold mt-2">
                            ⚠️ Chuyến đi đang trong quá trình thực hiện. Một số trường không thể chỉnh sửa.
                        </p>
                    )}
                    {isFinishedOrCancelled && (
                        <p className="text-red-600 font-semibold mt-2">
                            🚫 Chuyến đi đã {schedule?.trang_thai === 'hoan_thanh' ? 'hoàn thành' : 'bị hủy'}. Không thể chỉnh sửa.
                        </p>
                    )}
                </div>
            </div>

            {/* Xe buýt */}
            <div>
                <label className={labelClasses}>Xe buýt *</label>
                <select
                    name="id_xe_buyt"
                    value={formData.id_xe_buyt}
                    onChange={handleFormChange}
                    required
                    disabled={isInProgress || isFinishedOrCancelled || isSubmitting}
                    className={(isInProgress || isFinishedOrCancelled || isSubmitting) ? disabledClasses : inputClasses}
                >
                    <option value="">Chọn xe buýt</option>
                    {buses.map(b => (
                        <option key={b.id_xe_buyt} value={b.id_xe_buyt}>
                            {b.bien_so_xe}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tài xế */}
            <div>
                <label className={labelClasses}>Tài xế *</label>
                <select
                    name="id_tai_xe"
                    value={formData.id_tai_xe}
                    onChange={handleFormChange}
                    required
                    disabled={isInProgress || isFinishedOrCancelled || isSubmitting}
                    className={(isInProgress || isFinishedOrCancelled || isSubmitting) ? disabledClasses : inputClasses}
                >
                    <option value="">Chọn tài xế</option>
                    {drivers.map(d => (
                        <option key={d.id_nguoi_dung} value={d.id_nguoi_dung}>
                            {d.ho_ten}
                        </option>
                    ))}
                </select>
            </div>

            {/* Ngày chạy */}
            <div>
                <label className={labelClasses}>Ngày chạy *</label>
                <input
                    type="date"
                    name="ngay"
                    value={formData.ngay}
                    onChange={handleFormChange}
                    required
                    disabled={isInProgress || isFinishedOrCancelled || isSubmitting}
                    className={(isInProgress || isFinishedOrCancelled || isSubmitting) ? disabledClasses : inputClasses}
                />
            </div>

            {/* Giờ khởi hành */}
            <div>
                <label className={labelClasses}>Giờ khởi hành *</label>
                <input
                    type="time"
                    name="gio_khoi_hanh"
                    value={formData.gio_khoi_hanh}
                    onChange={handleFormChange}
                    required
                    disabled={isInProgress || isFinishedOrCancelled || isSubmitting}
                    className={(isInProgress || isFinishedOrCancelled || isSubmitting) ? disabledClasses : inputClasses}
                />
            </div>

            {/* Trạng thái */}
            <div>
                <label className={labelClasses}>Trạng thái *</label>
                <select
                    name="trang_thai"
                    value={formData.trang_thai}
                    onChange={handleFormChange}
                    required
                    disabled={isFinishedOrCancelled || isSubmitting}
                    className={(isFinishedOrCancelled || isSubmitting) ? disabledClasses : inputClasses}
                >
                    {getAvailableStatusOptions().map(s => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-4 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                    {isFinishedOrCancelled ? 'Đóng' : 'Hủy'}
                </button>
                {!isFinishedOrCancelled && (
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                    </button>
                )}
            </div>
        </form>
    );
};

export default EditScheduleForm;
