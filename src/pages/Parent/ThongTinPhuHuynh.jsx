import React, { useState } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBus, FaUserGraduate, FaCalendarAlt, FaSchool } from 'react-icons/fa';

// --- DỮ LIỆU MẪU (Thông tin phụ huynh và con cái) ---
const parentInfo = {
  id: 1,
  hoTen: 'Nguyễn Thị Mai',
  email: 'mai.nguyen@email.com',
  soDienThoai: '090-123-4567',
  diaChi: '123 Đường ABC, Quận 1, TP.HCM',
  ngaySinh: '1985-05-15',
  gioiTinh: 'Nữ',
  conCai: [
    {
      id: 1,
      hoTen: 'Nguyễn Văn An',
      lop: '6A',
      ngaySinh: '2012-03-20',
      gioiTinh: 'Nam',
      diemDon: {
        ten: 'Nhà văn hóa Thanh Niên',
        diaChi: '456 Đường XYZ, Quận 1, TP.HCM'
      },
      tuyenDuong: {
        ten: 'Tuyến Quận 1',
        xeBuyt: {
          bienSo: '51B-123.45',
          taiXe: 'Nguyễn Văn A',
          sdtTaiXe: '090-987-6543'
        }
      },
      trangThai: 'Đang học'
    },
    {
      id: 2,
      hoTen: 'Nguyễn Thị Linh',
      lop: '4B',
      ngaySinh: '2014-08-10',
      gioiTinh: 'Nữ',
      diemDon: {
        ten: 'Công viên Thống Nhất',
        diaChi: '789 Đường DEF, Quận 3, TP.HCM'
      },
      tuyenDuong: {
        ten: 'Tuyến Quận 3',
        xeBuyt: {
          bienSo: '51B-678.90',
          taiXe: 'Trần Văn B',
          sdtTaiXe: '091-234-5678'
        }
      },
      trangThai: 'Đang học'
    }
  ]
};

function ThongTinPhuHuynh() {
  const [activeTab, setActiveTab] = useState('profile');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="h-full max-h-[calc(100vh-8rem)] bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-black bg-opacity-20 rounded-full flex items-center justify-center">
            <FaUser size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{parentInfo.hoTen}</h1>
            <p className="text-blue-100">Phụ huynh học sinh</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'profile'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab('children')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'children'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Thông tin con cái ({parentInfo.conCai.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto h-full">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin cá nhân</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin cơ bản */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaUser className="text-blue-600" />
                  Thông tin cơ bản
                </h3>
                <div className="space-y-2">
                  <p><strong>Họ tên:</strong> {parentInfo.hoTen}</p>
                  <p><strong>Ngày sinh:</strong> {formatDate(parentInfo.ngaySinh)} ({calculateAge(parentInfo.ngaySinh)} tuổi)</p>
                  <p><strong>Giới tính:</strong> {parentInfo.gioiTinh}</p>
                </div>
              </div>

              {/* Thông tin liên hệ */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaPhone className="text-green-600" />
                  Thông tin liên hệ
                </h3>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <FaPhone className="text-gray-500" />
                    <strong>Số điện thoại:</strong> {parentInfo.soDienThoai}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-500" />
                    <strong>Email:</strong> {parentInfo.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-500" />
                    <strong>Địa chỉ:</strong> {parentInfo.diaChi}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'children' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Danh sách con cái</h2>

            <div className="grid gap-6">
              {parentInfo.conCai.map((child) => (
                <div key={child.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaUserGraduate className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{child.hoTen}</h3>
                        <p className="text-gray-600">Lớp {child.lop}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {child.trangThai}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Thông tin cá nhân */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-500" size={14} />
                        Thông tin cá nhân
                      </h4>
                      <p className="text-sm text-gray-600">Ngày sinh: {formatDate(child.ngaySinh)} ({calculateAge(child.ngaySinh)} tuổi)</p>
                      <p className="text-sm text-gray-600">Giới tính: {child.gioiTinh}</p>
                    </div>

                    {/* Điểm đón */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-gray-500" size={14} />
                        Điểm đón
                      </h4>
                      <p className="text-sm font-medium text-gray-800">{child.diemDon.ten}</p>
                      <p className="text-sm text-gray-600">{child.diemDon.diaChi}</p>
                    </div>

                    {/* Thông tin xe buýt */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2">
                        <FaBus className="text-gray-500" size={14} />
                        Thông tin xe buýt
                      </h4>
                      <p className="text-sm text-gray-600"><strong>Tuyến:</strong> {child.tuyenDuong.ten}</p>
                      <p className="text-sm text-gray-600"><strong>Biển số:</strong> {child.tuyenDuong.xeBuyt.bienSo}</p>
                      <p className="text-sm text-gray-600"><strong>Tài xế:</strong> {child.tuyenDuong.xeBuyt.taiXe}</p>
                      <p className="text-sm text-gray-600"><strong>SĐT:</strong> {child.tuyenDuong.xeBuyt.sdtTaiXe}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ThongTinPhuHuynh;