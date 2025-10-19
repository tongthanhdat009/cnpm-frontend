import React, { useState } from 'react';
import { FaPaperPlane, FaHistory } from 'react-icons/fa';

// --- DỮ LIỆU MẪU (Mô phỏng CSDL) ---
const sampleRoutes = [
  { id: 1, name: 'Tuyến Quận 1 - Bình Thạnh' },
  { id: 2, name: 'Tuyến Phú Nhuận' },
];
const sampleParents = [
  { id: 101, name: 'PH - Nguyễn Văn B (HS: Nguyễn Văn An)' },
  { id: 102, name: 'PH - Trần Thị C (HS: Trần Thị Bích)' },
];
// --- KẾT THÚC DỮ LIỆU MẪU ---

function GuiThongBao() {
  const [sentNotifications, setSentNotifications] = useState([]);
  const [recipient, setRecipient] = useState('all'); // 'all', 'route', 'specific'
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedParent, setSelectedParent] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !message) {
      alert('Vui lòng nhập tiêu đề và nội dung.');
      return;
    }

    let target = 'Tất cả phụ huynh';
    if (recipient === 'route') {
        const routeName = sampleRoutes.find(r => r.id === parseInt(selectedRoute))?.name;
        target = `Phụ huynh tuyến: ${routeName}`;
    } else if (recipient === 'specific') {
        const parentName = sampleParents.find(p => p.id === parseInt(selectedParent))?.name;
        target = `Phụ huynh: ${parentName}`;
    }

    const newNotification = {
      id: Date.now(),
      target,
      title,
      message,
      time: new Date().toLocaleString('vi-VN'),
    };

    setSentNotifications([newNotification, ...sentNotifications]);
    // Reset form
    setTitle('');
    setMessage('');
    alert('Gửi thông báo thành công!');
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
          {recipient === 'route' && (
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
          )}
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
                {sampleParents.map(parent => (
                  <option key={parent.id} value={parent.id}>{parent.name}</option>
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
            />
          </div>

          <div className="flex justify-end">
            <button 
              type="submit"
              className="btn-primary flex items-center gap-2"
            >
              <FaPaperPlane />
              Gửi thông báo
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
                    <div key={notif.id} className="p-3 bg-gray-50 rounded-lg border">
                        <p className="font-semibold text-gray-800">{notif.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                        <div className="text-xs text-gray-400 mt-2 flex justify-between">
                            <span>Gửi đến: <strong>{notif.target}</strong></span>
                            <span>{notif.time}</span>
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