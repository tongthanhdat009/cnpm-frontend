import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import CreateScheduleForm from './CreateScheduleForm';
import EditScheduleForm from './EditScheduleForm';
import NguoiDungService from '../services/nguoiDungService';
import XeBuytService from '../services/xeBuytService';
import TuyenDuongService from '../services/tuyenDuongService';
const ScheduleModal = ({ isOpen, onClose, onSave, scheduleToEdit }) => {
    const isEditMode = !!scheduleToEdit;
    const [buses, setBuses] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [routes, setRoutes] = useState([]);
    
    const handleFormSubmit = (data) => {
        onSave(data);
        onClose();
    };
    
    useEffect(() => {
        if (isOpen) {
            fetchTaiXe();
            fetchXeBuyt();
            fetchTuyenDuong();
        }
    }, [isOpen]);
    
    
    const fetchTaiXe = async () => {
        try {
            const response = await NguoiDungService.getNguoiDungByVaiTro('tai_xe');
            if (response.success) {
                setDrivers(response.data);
            }
        } catch (error) { 
            console.error('Error fetching tai xe:', error);
        }
    }
    
    const fetchXeBuyt = async () => {
        try {
            const response = await XeBuytService.getAllXeBuyt();
            if (response.success) {
                setBuses(response.data);
            }
        } catch (error) {
            console.error('Error fetching xe buyt:', error);
        }
    }
    
    const fetchTuyenDuong = async () => {
        try {
            const response = await TuyenDuongService.getAllTuyenDuong();
            if (response.success) {
                setRoutes(response.data);
            }
        } catch (error) {
            console.error('Error fetching tuyen duong:', error);
        }
    }
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 flex justify-between items-center mb-4 pb-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isEditMode ? 'Chỉnh Sửa Lịch Trình' : 'Tạo Lịch Trình Lặp Lại'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        title="Đóng"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Form Content */}
                {isEditMode ? (
                    <EditScheduleForm
                        schedule={scheduleToEdit}
                        buses={buses}
                        drivers={drivers}
                        onSubmit={handleFormSubmit}
                        onCancel={onClose}
                    />
                ) : (
                    <CreateScheduleForm
                        routes={routes}
                        buses={buses}
                        drivers={drivers}
                        onSubmit={handleFormSubmit}
                        onCancel={onClose}
                    />
                )}
            </div>
        </div>
    );
};

export default ScheduleModal;