import React, { useState, useMemo } from 'react';
import { FaBell, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTrash } from 'react-icons/fa';

// --- DỮ LIỆU MẪU (Mô phỏng các loại thông báo khác nhau) ---
const sampleNotifications = [
  { 
    id: 1, 
    type: 'chuyen_di', 
    title: 'Bé Nguyễn Văn An đã lên xe an toàn!', 
    message: 'Tài xế Trần Văn Sáu đã xác nhận đón bé An lên xe 51B-123.45 tại điểm đón Nhà văn hóa Thanh Niên.',
    time: '2025-09-29T06:45:00',
    read: false 
  },
  { 
    id: 2, 
    type: 'canh_bao', 
    title: 'Cảnh báo: Xe 51C-678.90 có thể đến trễ', 
    message: 'Do tình hình giao thông, xe buýt có thể đến điểm đón của bé Trần Thị Bích trễ khoảng 5-10 phút.',
    time: '2025-09-29T06:20:00',
    read: false 
  },
  { 
    id: 3, 
    type: 'chuyen_di', 
    title: 'Bé Lê Văn Cường đã về nhà an toàn', 
    message: 'Tài xế đã xác nhận trả bé Cường tại điểm trả Ngã tư Hàng Xanh.',
    time: '2025-09-28T17:15:00',
    read: true 
  },
  { 
    id: 4, 
    type: 'he_thong', 
    title: 'Thông báo nghỉ lễ 30/04', 
    message: 'Nhà trường xin thông báo lịch nghỉ lễ từ ngày 30/04 đến hết ngày 01/05. Dịch vụ xe buýt sẽ hoạt động lại vào ngày 02/05.',
    time: '2025-04-25T10:00:00',
    read: true 
  },
];
// --- KẾT THÚC DỮ LIỆU MẪU ---

// Lấy icon và màu sắc dựa trên loại thông báo
const getNotificationIcon = (type) => {
    switch (type) {
        case 'chuyen_di': return <FaCheckCircle className="text-green-500" />;
        case 'canh_bao': return <FaExclamationTriangle className="text-yellow-500" />;
        case 'he_thong': return <FaInfoCircle className="text-blue-500" />;
        default: return <FaBell className="text-gray-500" />;
    }
}


function ThongBao() {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };
  
  const handleDelete = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  }

  // Định dạng thời gian cho dễ đọc
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString('vi-VN');
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <h1 className="text-2xl font-bold text-gray-800">Hộp thư thông báo</h1>
        {/* Nút Lọc */}
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
                Tất cả ({notifications.length})
            </button>
            <button 
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors relative ${filter === 'unread' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
                Chưa đọc
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>
        </div>
      </div>

      {/* Danh sách thông báo */}
      <div className="flex-grow overflow-y-auto pr-2">
        {filteredNotifications.length > 0 ? (
            <div className="space-y-4">
            {filteredNotifications.map(notification => (
                <div 
                    key={notification.id} 
                    className={`p-4 rounded-lg border-l-4 relative group ${
                        notification.read ? 'bg-gray-50' : 'bg-blue-50 border-indigo-500'
                    }`}
                >
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-grow">
                            <h3 className={`font-bold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>{notification.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-2">{formatTime(notification.time)}</p>
                        </div>
                    </div>
                    {/* Nút hành động hiện ra khi hover */}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                            <button onClick={() => handleMarkAsRead(notification.id)} className="p-2 text-xs bg-white rounded-full shadow hover:bg-gray-100" title="Đánh dấu đã đọc">
                                <FaCheckCircle className="text-green-500"/>
                            </button>
                        )}
                        <button onClick={() => handleDelete(notification.id)} className="p-2 text-xs bg-white rounded-full shadow hover:bg-gray-100" title="Xóa thông báo">
                            <FaTrash className="text-red-500"/>
                        </button>
                    </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="text-center py-20 text-gray-500">
                <FaBell size={48} className="mx-auto mb-4"/>
                <p>Không có thông báo nào.</p>
            </div>
        )}
      </div>
    </div>
  );
}

export default ThongBao;