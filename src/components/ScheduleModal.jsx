import React from 'react';
import { FaTimes } from 'react-icons/fa';
import CreateScheduleForm from './CreateScheduleForm';
import EditScheduleForm from './EditScheduleForm';

const ScheduleModal = ({ isOpen, onClose, onSave, routes = [], buses = [], drivers = [], scheduleToEdit }) => {
    const isEditMode = !!scheduleToEdit;

    if (!isOpen) return null;

    const handleFormSubmit = (data) => {
        onSave(data);
        onClose();
    };

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