import React, { useState, useEffect } from 'react';

const EditScheduleForm = ({ schedule, buses = [], drivers = [], onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        id_xe_buyt: '',
        id_tai_xe: '',
        trang_thai: ''
    });

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
            setFormData({
                id_xe_buyt: schedule.id_xe_buyt || '',
                id_tai_xe: schedule.id_tai_xe || '',
                trang_thai: schedule.trang_thai || 'cho_khoi_hanh'
            });
        }
    }, [schedule]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const updatedSchedule = {
            ...schedule,
            id_xe_buyt: parseInt(formData.id_xe_buyt),
            id_tai_xe: parseInt(formData.id_tai_xe),
            trang_thai: formData.trang_thai
        };
        onSubmit(updatedSchedule);
    };

    return (
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4">
            {/* Thông tin tuyến đường (Read-only) */}
            <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-700 mb-2">Thông tin chuyến đi</h3>
                <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Tuyến đường:</span> {schedule.ten_tuyen_duong}</p>
                    <p><span className="font-medium">Ngày chạy:</span> {new Date(schedule.ngay_chay).toLocaleDateString('vi-VN')}</p>
                    <p><span className="font-medium">Giờ khởi hành:</span> {schedule.gio_khoi_hanh}</p>
                    <p><span className="font-medium">Loại chuyến:</span> {schedule.loai_chuyen_di === 'don' ? 'Đón học sinh' : 'Trả học sinh'}</p>
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
                    className={inputClasses}
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
                    className={inputClasses}
                >
                    <option value="">Chọn tài xế</option>
                    {drivers.map(d => (
                        <option key={d.id_nguoi_dung} value={d.id_nguoi_dung}>
                            {d.ho_ten}
                        </option>
                    ))}
                </select>
            </div>

            {/* Trạng thái */}
            <div>
                <label className={labelClasses}>Trạng thái *</label>
                <select
                    name="trang_thai"
                    value={formData.trang_thai}
                    onChange={handleFormChange}
                    required
                    className={inputClasses}
                >
                    {statusOptions.map(s => (
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
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Cập nhật
                </button>
            </div>
        </form>
    );
};

export default EditScheduleForm;
