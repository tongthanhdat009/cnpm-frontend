import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaHistory, FaSpinner } from 'react-icons/fa';

import {getAllNotifications, sendNotification} from '../../services/thongBaoService';
import NguoiDungService from '../../services/nguoiDungService';

function GuiThongBao() {
  const [sentNotifications, setSentNotifications] = useState([]);
  const [parents, setParents] = useState([]);
  const [recipient, setRecipient] = useState('all'); // 'all', 'route', 'specific'
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedParent, setSelectedParent] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSentNotifications();
    fetchAllPhuHuynh();
  }, []);

  const fetchSentNotifications = async () => {
    try {
      const response = await getAllNotifications(); // Giả sử có endpoint này
      console.log("Response từ API thông báo:", response);
      if (response) {
        setSentNotifications(response);
      } else {
        throw new Error('Không thể lấy thông báo đã gửi');
      }
    } catch (err) {
      console.error("Lỗi khi lấy thông báo đã gửi:", err);
      setError('Đã xảy ra lỗi');
    }
  };
  
  

  const fetchAllPhuHuynh = async () => {
    try{
      const response = await NguoiDungService.getNguoiDungByVaiTro("phu_huynh"); // Giả sử có endpoint này
      if (response.success) {
        setParents(response.data);
      } else {
        throw new Error(response.error || 'Không thể lấy danh sách phụ huynh');
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách phụ huynh:", err);
      setError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi');
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!title || !message) {
      alert('Vui lòng nhập tiêu đề và nội dung.');
      return;
    }
    
    setLoading(true);

    const payload = {
      tieu_de: title,
      noi_dung: message,
      id_nguoi_gui: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id_nguoi_dung : null,
      recipient,
      selectedRoute,
      selectedParent,
    }

    if (recipient === 'specific') {
      payload.id_nguoi_nhan = parseInt(selectedParent);
    } else if (recipient === 'route') {
      payload.id_tuyen_duong = parseInt(selectedRoute);
    } else {
      payload.id_tuyen_duong = null;
    }

    try {
      // Gọi API POST để tạo thông báo
      console.log("Gửi payload thông báo:", payload);
      const response = await sendNotification(payload);

      if (response.success) {
        const newNotificationData = response.data;

        // Cập nhật lịch sử hiển thị local (tùy chọn)
        setSentNotifications(prev => [{
            id_thong_bao: newNotificationData.id_thong_bao, // Đổi từ id sang id_thong_bao
            target: recipient === 'all' ? 'Tất cả' : (recipient === 'specific' ? `PH ID: ${payload.id_nguoi_nhan}` : `Tuyến ID: ${payload.id_tuyen_duong}`),
            tieu_de: newNotificationData.tieu_de, // Đổi từ title sang tieu_de
            noi_dung: newNotificationData.noi_dung, // Đổi từ message sang noi_dung
            thoi_gian: newNotificationData.thoi_gian, // Đổi từ time sang thoi_gian
            id_nguoi_nhan: newNotificationData.id_nguoi_nhan,
        }, ...prev]);

        setTitle('');
        setMessage('');
        alert('Gửi thông báo thành công!');
      } else {
        throw new Error(response.message || 'Gửi thông báo thất bại');
      }
    } catch (err) {
      console.error("Lỗi khi gửi thông báo:", err);
      setError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi');
      alert(`Gửi thông báo thất bại: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col md:flex-row gap-6">
      {/* Cột soạn thảo thông báo */}
      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b">Soạn thông báo mới</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Chọn người nhận */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Gửi đến</label>
            <select 
              value={recipient} 
              onChange={(e) => setRecipient(e.target.value)}
              className="mt-1 block w-full input"
            >
              <option value="all">Tất cả phụ huynh</option>
              <option value="route">Phụ huynh theo tuyến</option>
              <option value="specific">Một phụ huynh cụ thể</option>
            </select>
          </div>

          {/* Hiển thị tùy chọn dựa trên người nhận */}
          {/* {recipient === 'route' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Chọn tuyến đường</label>
              <select 
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                required
                className="mt-1 block w-full input"
              >
                <option value="">-- Chọn tuyến --</option>
                {sampleRoutes.map(route => (
                  <option key={route.id} value={route.id}>{route.name}</option>
                ))}
              </select>
            </div>
          )} */}
          {recipient === 'specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Chọn phụ huynh</label>
              <select 
                value={selectedParent}
                onChange={(e) => setSelectedParent(e.target.value)}
                required
                className="mt-1 block w-full input"
              >
                <option value="">-- Chọn phụ huynh --</option>
                {parents.map(parent => (
                  <option key={parent.id_nguoi_dung} value={parent.id_nguoi_dung}>{parent.ho_ten}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tiêu đề và nội dung */}
          <div>
               <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tiêu đề</label>
               <input
                 id="title"
                 type="text"
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 className="mt-1 block w-full input"
                 placeholder="Ví dụ: Thông báo nghỉ học đột xuất"
                 disabled={loading} // Disable khi đang gửi
               />
             </div>
             <div>
               <label htmlFor="message" className="block text-sm font-medium text-gray-700">Nội dung</label>
               <textarea
                 id="message"
                 rows="6"
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 className="mt-1 block w-full input"
                 placeholder="Nhập nội dung thông báo tại đây..."
                 disabled={loading} // Disable khi đang gửi
               />
             </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={loading} // Disable button khi đang gửi
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
              {loading ? 'Đang gửi...' : 'Gửi thông báo'}
            </button>
          </div>
        </form>
      </div>

      {/* Cột lịch sử thông báo */}
      <div className="w-full md:w-1/2 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-6">
         <h2 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b">Lịch sử đã gửi</h2>
         <div className="h-[calc(100%-3.5rem)] overflow-y-auto pr-2 space-y-4">
            {sentNotifications.length > 0 ? (
                sentNotifications.map(notif => (
                    <div key={notif.id_thong_bao} className="p-3 bg-gray-50 rounded-lg border">
                        <p className="font-semibold text-gray-800">{notif.tieu_de}</p>
                        <p className="text-sm text-gray-600 mt-1">{notif.noi_dung}</p>
                        <div className="text-xs text-gray-400 mt-2 flex justify-between">
                            <span>Gửi đến: <strong>{notif.id_nguoi_nhan?notif.id_nguoi_nhan:"tất cả"}</strong></span>
                            <span>{new Date(notif.thoi_gian).toLocaleString('vi-VN')}</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-10 text-gray-400">
                    <FaHistory size={32} className="mx-auto mb-2"/>
                    <p>Chưa có thông báo nào được gửi.</p>
                </div>
            )}
         </div>
      </div>
    </div>
  );
}

// Thêm các class dùng chung vào file tailwind.css nếu cần
// .input { @apply px-3 py-2 border border-gray-300 rounded-md ... }
// .btn-primary { @apply px-4 py-2 bg-indigo-600 text-white ... }

export default GuiThongBao;