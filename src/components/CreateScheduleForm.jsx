import React from 'react';

const CreateScheduleForm = ({ routes = [], buses = [], drivers = [], onSubmit, onCancel }) => {
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

    const handleSubmit = (event) => {
        event.preventDefault();
        const formEl = event.target;

        const scheduleData = {
            id_tuyen_duong: parseInt(formEl.id_tuyen_duong.value),
            id_xe_buyt: parseInt(formEl.id_xe_buyt.value),
            id_tai_xe: parseInt(formEl.id_tai_xe.value),
            gio_khoi_hanh: formEl.gio_khoi_hanh.value,
            loai_chuyen_di: formEl.loai_chuyen_di.value,
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
                newSchedules.push({
                    ...scheduleData,
                    id_lich_trinh: Math.random(),
                    ngay_chay: day.toISOString().split('T')[0]
                });
            }
        }

        onSubmit(newSchedules);
    };

    return (
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4">
            {/* Tuyến đường */}
            <div>
                <label className={labelClasses}>Tuyến đường *</label>
                <select name="id_tuyen_duong" required className={inputClasses}>
                    <option value="">Chọn tuyến đường</option>
                    {routes.map(r => (
                        <option key={r.id_tuyen_duong} value={r.id_tuyen_duong}>
                            {r.ten_tuyen_duong}
                        </option>
                    ))}
                </select>
            </div>

            {/* Xe buýt */}
            <div>
                <label className={labelClasses}>Xe buýt *</label>
                <select name="id_xe_buyt" required className={inputClasses}>
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
                <select name="id_tai_xe" required className={inputClasses}>
                    <option value="">Chọn tài xế</option>
                    {drivers.map(d => (
                        <option key={d.id_nguoi_dung} value={d.id_nguoi_dung}>
                            {d.ho_ten}
                        </option>
                    ))}
                </select>
            </div>

            {/* Loại chuyến đi */}
            <div>
                <label className={labelClasses}>Loại chuyến đi *</label>
                <select name="loai_chuyen_di" required className={inputClasses} defaultValue="don">
                    <option value="don">Đón học sinh</option>
                    <option value="tra">Trả học sinh</option>
                </select>
            </div>

            {/* Giờ khởi hành */}
            <div>
                <label className={labelClasses}>Giờ khởi hành *</label>
                <input type="time" name="gio_khoi_hanh" required className={inputClasses} />
            </div>

            {/* Ngày bắt đầu - Ngày kết thúc */}
            <div className='grid grid-cols-2 gap-4 pt-4 border-t'>
                <div>
                    <label className={labelClasses}>Từ ngày *</label>
                    <input type="date" name="ngay_bat_dau" required className={inputClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Đến ngày *</label>
                    <input type="date" name="ngay_ket_thuc" required className={inputClasses} />
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
                            />
                            <span className="block p-2 border rounded-md cursor-pointer peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:font-bold transition-colors hover:bg-indigo-50">
                                {day.label}
                            </span>
                        </label>
                    ))}
                </div>
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
                    Tạo lịch trình
                </button>
            </div>
        </form>
    );
};

export default CreateScheduleForm;
