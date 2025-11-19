import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaHistory, FaSpinner, FaUsers, FaUser, FaBullhorn } from 'react-icons/fa';

import {getAllNotifications, sendNotification} from '../../services/thongBaoService';
import NguoiDungService from '../../services/nguoiDungService';
import { formatDateTime } from '../../utils/dateUtils';

function GuiThongBao() {
  const [sentNotifications, setSentNotifications] = useState([]);
  const [parents, setParents] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [recipientType, setRecipientType] = useState('all_users'); // 'all_users', 'specific_user'
  const [selectedRole, setSelectedRole] = useState('phu_huynh'); // 'phu_huynh', 'tai_xe'
  const [selectedUser, setSelectedUser] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSentNotifications();
    fetchParents();
    fetchDrivers();
  }, []);

  const fetchSentNotifications = async () => {
    try {
      const response = await getAllNotifications();
      console.log("Response từ API thông báo:", response);
      if (response) {
        setSentNotifications(response);
      } else {
        throw new Error('Không thể lấy thông báo đã gửi');
      }
    } catch (err) {
      console.error("Lỗi khi lấy thông báo đã gửi:", err);
    }
  };

  const fetchParents = async () => {
    try {
      const response = await NguoiDungService.getNguoiDungByVaiTro("phu_huynh");
      if (response.success) {
        setParents(response.data);
      } else {
        throw new Error(response.error || 'Không thể lấy danh sách phụ huynh');
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách phụ huynh:", err);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await NguoiDungService.getNguoiDungByVaiTro("tai_xe");
      if (response.success) {
        setDrivers(response.data);
      } else {
        throw new Error(response.error || 'Không thể lấy danh sách tài xế');
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách tài xế:", err);
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      alert('Vui lòng nhập tiêu đề và nội dung.');
      return;
    }
    
    setLoading(true);

    const payload = {
      tieu_de: title,
      noi_dung: message,
      id_nguoi_gui: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id_nguoi_dung : null,
    }

    if (recipientType === 'specific_user') {
      payload.id_nguoi_nhan = parseInt(selectedUser);
    } else {
      // Gửi cho tất cả người dùng
      payload.id_nguoi_nhan = null;
    }

    try {
      console.log("Gửi payload thông báo:", payload);
      const response = await sendNotification(payload);

      if (response.success) {
        const newNotificationData = response.data;

        setSentNotifications(prev => [{
            id_thong_bao: newNotificationData.id_thong_bao,
            target: getTargetDisplay(recipientType, payload.id_nguoi_nhan),
            tieu_de: newNotificationData.tieu_de,
            noi_dung: newNotificationData.noi_dung,
            thoi_gian: newNotificationData.thoi_gian,
            id_nguoi_nhan: newNotificationData.id_nguoi_nhan,
        }, ...prev]);

        setTitle('');
        setMessage('');
        setSelectedUser('');
        alert('Gửi thông báo thành công!');
      } else {
        throw new Error(response.message || 'Gửi thông báo thất bại');
      }
    } catch (err) {
      console.error("Lỗi khi gửi thông báo:", err);
      alert(`Gửi thông báo thất bại: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getTargetDisplay = (type, id) => {
    if (type === 'all_users') {
      return 'Tất cả người dùng';
    } else if (type === 'specific_user') {
      const allUsers = [...parents, ...drivers];
      const user = allUsers.find(u => u.id_nguoi_dung === id);
      return user ? `${user.ho_ten} (${user.vai_tro === 'phu_huynh' ? 'Phụ huynh' : 'Tài xế'})` : `Người dùng ID: ${id}`;
    }
    return 'Không xác định';
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 rounded-xl shadow-lg h-full flex flex-col">
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 h-full flex flex-col lg:flex-row gap-6">
        {/* Cột soạn thảo thông báo */}
        <div className="w-full lg:w-1/2">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-indigo-200">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <FaBullhorn className="text-indigo-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Soạn thông báo mới</h2>
              <p className="text-sm text-gray-500">Gửi thông báo đến tất cả người dùng hoặc người dùng cụ thể</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Chọn đối tượng nhận */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <FaUsers className="inline mr-2 text-indigo-600" />
                Đối tượng nhận thông báo
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  recipientType === 'all_users' 
                    ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                    : 'border-gray-300 bg-white hover:border-indigo-300'
                }`}>
                  <input
                    type="radio"
                    value="all_users"
                    checked={recipientType === 'all_users'}
                    onChange={(e) => setRecipientType(e.target.value)}
                    className="mr-3 w-4 h-4 text-indigo-600"
                  />
                  <FaUsers className="mr-2 text-green-600" />
                  <span className="font-medium">Tất cả người dùng</span>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  recipientType === 'specific_user' 
                    ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                    : 'border-gray-300 bg-white hover:border-indigo-300'
                }`}>
                  <input
                    type="radio"
                    value="specific_user"
                    checked={recipientType === 'specific_user'}
                    onChange={(e) => setRecipientType(e.target.value)}
                    className="mr-3 w-4 h-4 text-indigo-600"
                  />
                  <FaUser className="mr-2 text-blue-600" />
                  <span className="font-medium">Một người dùng cụ thể</span>
                </label>
              </div>
            </div>

            {/* Dropdown cho người nhận cụ thể */}
            {recipientType === 'specific_user' && (
              <div className="animate-fadeIn space-y-4">
                {/* Chọn vai trò */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chọn vai trò
                  </label>
                  <select 
                    value={selectedRole}
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      setSelectedUser(''); // Reset người dùng khi đổi vai trò
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  >
                    <option value="phu_huynh">Phụ huynh</option>
                    <option value="tai_xe">Tài xế</option>
                  </select>
                </div>

                {/* Chọn người dùng theo vai trò */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chọn {selectedRole === 'phu_huynh' ? 'phụ huynh' : 'tài xế'}
                  </label>
                  <select 
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  >
                    <option value="">-- Chọn {selectedRole === 'phu_huynh' ? 'phụ huynh' : 'tài xế'} --</option>
                    {(selectedRole === 'phu_huynh' ? parents : drivers).map(user => (
                      <option key={user.id_nguoi_dung} value={user.id_nguoi_dung}>
                        {user.ho_ten} - {user.email || user.so_dien_thoai}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Tiêu đề */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Tiêu đề thông báo
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Ví dụ: Thông báo nghỉ học đột xuất"
                disabled={loading}
                required
              />
            </div>

            {/* Nội dung */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                Nội dung thông báo
              </label>
              <textarea
                id="message"
                rows="6"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                placeholder="Nhập nội dung thông báo chi tiết tại đây..."
                disabled={loading}
                required
              />
            </div>

            {/* Nút gửi */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-lg" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="text-lg" />
                    <span>Gửi thông báo</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Cột lịch sử thông báo */}
        <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l-2 border-gray-200 pt-6 lg:pt-0 lg:pl-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-indigo-200">
            <div className="bg-green-100 p-3 rounded-lg">
              <FaHistory className="text-green-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Lịch sử đã gửi</h2>
              <p className="text-sm text-gray-500">{sentNotifications.length} thông báo</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {sentNotifications.length > 0 ? (
              sentNotifications.map(notif => (
                <div 
                  key={notif.id_thong_bao} 
                  className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-bold text-gray-800 text-lg flex-1">{notif.tieu_de}</p>
                    <span className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                      {notif.id_nguoi_nhan ? 'Cá nhân' : 'Tất cả'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{notif.noi_dung}</p>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                      <span className="text-gray-500">
                        <FaUsers className="inline mr-1 text-indigo-500" />
                        Gửi đến: <strong className="text-gray-700">{notif.id_nguoi_nhan ? `ID: ${notif.id_nguoi_nhan}` : "Tất cả"}</strong>
                      </span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {formatDateTime(notif.thoi_gian)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FaHistory size={48} className="mb-4 opacity-50"/>
                <p className="text-lg font-medium">Chưa có thông báo nào được gửi</p>
                <p className="text-sm mt-2">Các thông báo đã gửi sẽ hiển thị tại đây</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuiThongBao;