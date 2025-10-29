import React, { useState, useMemo, useEffect } from 'react';
import { FaBell, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTrash } from 'react-icons/fa';

import {getNotificationsByUserId} from '../../services/thongBaoService';

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
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  // Fetch thông báo từ API khi component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        // Lấy thông tin user từ localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          throw new Error('Vui lòng đăng nhập để xem thông báo');
        }
        
        const user = JSON.parse(userStr);
        const userId = user.id_nguoi_dung;
        
        if (!userId) {
          throw new Error('Không tìm thấy thông tin người dùng');
        }

        // Gọi API lấy thông báo theo userId
        const data = await getNotificationsByUserId(userId);
        
        // Map data từ database sang format của UI
        const mappedNotifications = (data || []).map(item => ({
          id: item.id_thong_bao,
          title: item.tieu_de,
          message: item.noi_dung,
          time: item.thoi_gian,
          read: item.da_xem,
          type: item.loai_thong_bao || 'he_thong',
          sender: `${item.nguoi_dung_thong_bao_id_nguoi_guiTonguoi_dung?.ho_ten} (${item.nguoi_dung_thong_bao_id_nguoi_guiTonguoi_dung?.vai_tro})`
        }));
        
        setNotifications(mappedNotifications);
      } catch (err) {
        console.error("Lỗi khi fetch thông báo:", err);
        setError(err.message || 'Đã xảy ra lỗi khi tải thông báo');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n => n.id === id ? { ...n, read: true } : n)
    );
    // TODO: Gọi API để cập nhật trạng thái đã đọc trên server
  };
  
  const handleDelete = async (id) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(n => n.id !== id)
    );
    // TODO: Gọi API để xóa thông báo trên server
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

      {/* Loading State */}
      {loading && (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông báo...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center text-red-500">
            <FaExclamationTriangle size={48} className="mx-auto mb-4"/>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Danh sách thông báo */}
      {!loading && !error && (
        <div className="flex-grow overflow-y-auto pr-2">
          {filteredNotifications.length > 0 ? (
              <div className="space-y-4">
              {filteredNotifications.map(notification => (
                  <div 
                      key={notification.id} 
                      className={`p-4 rounded-lg border-l-4 relative group ${
                          notification.read ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-indigo-500'
                      }`}
                  >
                      <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-grow">
                              <h3 className={`font-bold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <p className="text-xs text-gray-400">{formatTime(notification.time)}</p>
                                {notification.sender && (
                                  <span className="text-xs text-gray-500">• Từ: {notification.sender}</span>
                                )}
                              </div>
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
      )}
    </div>
  );
}

export default ThongBao;